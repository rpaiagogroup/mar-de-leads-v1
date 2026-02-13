import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TARGET_COMPANY_IDS, TARGET_COMPANIES } from '@/lib/targetCompanies'

// Helper to normalize strings for comparison/keys
const normalize = (str: string | null | undefined) => {
    if (!str) return ''
    return str.trim().toLowerCase()
}

// Helper to extract a domain from a URL (simple version)
const extractDomain = (url: string | null | undefined) => {
    if (!url) return ''
    try {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`
        const hostname = new URL(cleanUrl).hostname
        return hostname.replace(/^www\./, '')
    } catch (e) {
        return normalize(url) // Fallback: just return normalized string if not a valid URL
    }
}

/**
 * For source=all, we need to map each company back to its position in the
 * TARGET_COMPANIES list to determine the owner (first 20 = VANESSA, last 20 = DEBORAH).
 * We build a domain-based lookup from the target list for reliable matching.
 */
function buildTargetOwnerMap(): Map<string, 'VANESSA' | 'DEBORAH'> {
    const map = new Map<string, 'VANESSA' | 'DEBORAH'>()
    const splitIndex = Math.ceil(TARGET_COMPANIES.length / 2) // 20

    TARGET_COMPANIES.forEach((company, idx) => {
        const domain = extractDomain(company.companyId)
        const owner = idx < splitIndex ? 'VANESSA' : 'DEBORAH'
        if (domain) map.set(domain, owner)
        // Also store the raw companyId for exact match fallback
        map.set(normalize(company.companyId), owner)
    })

    return map
}

export async function GET(request: Request) {
    try {
        // Determine filter mode from query parameter
        const { searchParams } = new URL(request.url)
        const source = searchParams.get('source') || 'china'

        // 1. Fetch filtered people
        let people

        if (source === 'all') {
            // Filter by specific target company_ids
            people = await prisma.pessoas_apollo_b2b.findMany({
                where: {
                    company_id: { in: [...TARGET_COMPANY_IDS] },
                },
            })
        } else {
            // China: linkedin_scrapping + Brazilian phone
            people = await prisma.pessoas_apollo_b2b.findMany({
                where: {
                    notes: 'linkedin_scrapping',
                    phone: { startsWith: '+55' },
                },
            })
        }

        // 2. Group by Unique Company
        const companiesMap = new Map<string, {
            key: string // Used for ID/Status
            name: string
            domainInput: string
            contacts: typeof people
        }>()

        for (const person of people) {
            // Determine Company Key (Preference: company_id (often a URL) -> company_name)
            let key = ''

            if (person.company_id && person.company_id.includes('.')) {
                key = extractDomain(person.company_id)
            } else {
                key = normalize(person.company_name)
            }

            if (!key) continue

            if (!companiesMap.has(key)) {
                companiesMap.set(key, {
                    key,
                    name: person.company_name || 'Empresa Desconhecida',
                    domainInput: person.company_id || '',
                    contacts: []
                })
            }

            const entry = companiesMap.get(key)!
            entry.contacts.push(person)
        }

        // 3. Assemble List and Sort
        const allCompanies = Array.from(companiesMap.values())
            .sort((a, b) => a.name.localeCompare(b.name))

        // Prepare keys for DB lookups
        const keys = allCompanies.map(c => c.key)
        const rawDomains = allCompanies.map(c => extractDomain(c.domainInput)).filter(Boolean)
        // Include both "domain.com" and "www.domain.com" so the IN query matches DB values
        const potentialDomains = [...new Set(rawDomains.flatMap(d => [d, `www.${d}`]))]
        const potentialNames = allCompanies.map(c => normalize(c.name)).filter(Boolean)

        // 4. Fetch Enrichment Data
        const enrichedData = await prisma.empresas_enriquecidas.findMany({
            where: {
                OR: [
                    { primary_domain: { in: potentialDomains, mode: 'insensitive' } },
                    { company_name: { in: potentialNames, mode: 'insensitive' } }
                ]
            }
        })

        // 5. Fetch Status Data
        const statusData = await prisma.company_outreach_status.findMany({
            where: {
                company_key: { in: keys }
            }
        })

        // 6. Build owner assignment
        // For source=all: use the target list order (first 20 VANESSA, last 20 DEBORAH)
        // For source=china: use alphabetical 50/50 split
        const targetOwnerMap = source === 'all' ? buildTargetOwnerMap() : null

        // 7. Assemble Final Response
        const result = allCompanies.map((comp, i) => {
            // Determine owner
            let owner: 'VANESSA' | 'DEBORAH'
            if (targetOwnerMap) {
                // Try matching by domain first, then raw company_id
                const domainKey = extractDomain(comp.domainInput)
                owner = targetOwnerMap.get(domainKey)
                    || targetOwnerMap.get(normalize(comp.domainInput))
                    || 'VANESSA' // Fallback
            } else {
                const splitIndex = Math.ceil(allCompanies.length / 2)
                owner = i < splitIndex ? 'VANESSA' : 'DEBORAH'
            }

            const domainKey = extractDomain(comp.domainInput)
            const enrich = enrichedData.find(e => {
                if (e.primary_domain && extractDomain(e.primary_domain) === domainKey) return true
                if (e.company_name && normalize(e.company_name) === normalize(comp.name)) return true
                return false
            })

            const status = statusData.find(s => s.company_key === comp.key)

            return {
                key: comp.key,
                owner,
                name: enrich?.company_name || comp.name,
                description: enrich?.description || 'Sem descrição disponível.',
                website: enrich?.website || enrich?.primary_domain || comp.domainInput || null,
                location: [enrich?.city, enrich?.state, enrich?.country].filter(Boolean).join(', ') || null,
                mockupLink: enrich?.mockup_link || null,

                contacted: status?.contacted || false,
                contacted_by: status?.contacted_by || null,
                contacted_at: status?.contacted_at || null,

                contacts: comp.contacts.map(p => ({
                    id: p.contact_id,
                    name: p.lead_name || 'Sem nome',
                    title: p.job_title || 'Sem cargo',
                    seniority: p.seniority_level,
                    email: p.email || 'N/A',
                    phone: p.phone,
                    linkedin: p.linkedin_url
                }))
            }
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error fetching companies:', error)
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }
}
