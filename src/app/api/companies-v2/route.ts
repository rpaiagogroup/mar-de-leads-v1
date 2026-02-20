import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Helper to normalize strings for comparison
const normalize = (str: string | null | undefined) => {
    if (!str) return ''
    return str.trim().toLowerCase()
}

// Helper to extract a clean domain
const extractDomain = (url: string | null | undefined) => {
    if (!url) return ''
    try {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`
        const hostname = new URL(cleanUrl).hostname
        return hostname.replace(/^www\./, '')
    } catch {
        return normalize(url)
    }
}

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch all people from v2 table with linkedin_scrapping origin
        const people = await prisma.pessoas_apollo_b2b_2.findMany({
            where: {
                notes: 'linkedin_scrapping',
            },
        })

        // 2. Group by company_domain (already clean in v2, e.g. "claro.com")
        const companiesMap = new Map<string, {
            key: string
            name: string
            domainInput: string
            contacts: typeof people
        }>()

        for (const person of people) {
            const key = person.company_domain
                ? extractDomain(person.company_domain)
                : normalize(person.company_name)

            if (!key) continue

            if (!companiesMap.has(key)) {
                companiesMap.set(key, {
                    key,
                    name: person.company_name || 'Empresa Desconhecida',
                    domainInput: person.company_domain || '',
                    contacts: [],
                })
            }

            companiesMap.get(key)!.contacts.push(person)
        }

        // 3. Sort alphabetically
        const allCompanies = Array.from(companiesMap.values())
            .sort((a, b) => a.name.localeCompare(b.name))

        // 4. Fetch enrichment data from v2 table
        const rawDomains = allCompanies.map(c => extractDomain(c.domainInput)).filter(Boolean)
        const potentialDomains = [...new Set(rawDomains.flatMap(d => [d, `www.${d}`]))]
        const potentialNames = allCompanies.map(c => normalize(c.name)).filter(Boolean)

        const enrichedData = await prisma.empresas_enriquecidas_2.findMany({
            where: {
                OR: [
                    { primary_domain: { in: potentialDomains, mode: 'insensitive' } },
                    { company_name: { in: potentialNames, mode: 'insensitive' } },
                ],
            },
        })

        // 5. Assign owners: 50/50 alphabetical split
        const splitIndex = Math.ceil(allCompanies.length / 2)

        // 6. Assemble response
        const result = allCompanies.map((comp, i) => {
            const owner = i < splitIndex ? 'VANESSA' : 'DEBORAH'

            const domainKey = extractDomain(comp.domainInput)
            const enrich = enrichedData.find(e => {
                if (e.primary_domain && extractDomain(e.primary_domain) === domainKey) return true
                if (e.company_name && normalize(e.company_name) === normalize(comp.name)) return true
                return false
            })

            // For v2, contacted status is tracked per-contact.
            // A company is "contacted" if ALL its contacts are marked contacted.
            const allContacted = comp.contacts.length > 0 && comp.contacts.every(c => c.contacted === true)

            return {
                key: comp.key,
                owner,
                name: enrich?.company_name || comp.name,
                description: enrich?.description || 'Sem descrição disponível.',
                website: enrich?.website || enrich?.primary_domain || comp.domainInput || null,
                location: [enrich?.city, enrich?.state, enrich?.country].filter(Boolean).join(', ') || null,
                mockupLink: enrich?.mockup_link || null,

                contacted: allContacted,
                contacted_by: null,
                contacted_at: null,

                contacts: comp.contacts.map(p => ({
                    id: p.contact_id || p.id,
                    name: p.lead_name || 'Sem nome',
                    title: p.job_title || 'Sem cargo',
                    seniority: p.seniority_level,
                    email: p.email || 'N/A',
                    phone: p.phone,
                    linkedin: p.linkedin_url,
                })),
            }
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error fetching v2 companies:', error)
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }
}
