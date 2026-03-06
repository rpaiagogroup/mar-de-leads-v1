import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const normalize = (str: string | null | undefined) => {
    if (!str) return ''
    return str.trim().toLowerCase()
}

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

        // 1. Fetch all people from v2 table
        const people = await prisma.pessoas_apollo_b2b_2.findMany()

        // 2. Group by company_domain
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

        // 4. Fetch enrichment data from v2 table (all companies)
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

        // 5. Fetch company_actions for all domains
        const allDomainKeys = allCompanies.map(c => c.key).filter(Boolean)
        const actions = await prisma.company_actions.findMany({
            where: { company_domain: { in: allDomainKeys } },
        })
        const actionsMap = new Map(actions.map(a => [a.company_domain, a]))

        // 6. Assemble response
        const result = allCompanies.map((comp) => {
            const domainKey = extractDomain(comp.domainInput)
            const enrich = enrichedData.find(e => {
                if (e.primary_domain && extractDomain(e.primary_domain) === domainKey) return true
                if (e.company_name && normalize(e.company_name) === normalize(comp.name)) return true
                return false
            })

            const action = actionsMap.get(comp.key)
            const contacted = action?.contacted ?? false

            return {
                key: comp.key,
                name: enrich?.company_name || comp.name,
                description: enrich?.description || 'Sem descricao disponivel.',
                website: enrich?.website || enrich?.primary_domain || comp.domainInput || null,
                location: [enrich?.city, enrich?.state, enrich?.country].filter(Boolean).join(', ') || null,
                industry: enrich?.industry || null,
                numEmployees: enrich?.num_employees || null,
                mockupLink: enrich?.mockup_link || null,
                origin: enrich?.origin || null,
                finalidade: enrich?.finalidade || null,
                state: enrich?.state || null,

                contacted,
                contacted_by: action?.contacted_by || null,
                contacted_at: action?.contacted_at?.toISOString() || null,
                sent_to_hubspot: action?.sent_to_hubspot ?? false,
                sent_to_hubspot_at: action?.sent_to_hubspot_at?.toISOString() || null,
                vendedor_responsavel: action?.vendedor_responsavel || null,

                contacts: comp.contacts.map(p => ({
                    id: p.contact_id || p.id,
                    name: p.lead_name || 'Sem nome',
                    title: p.job_title || 'Sem cargo',
                    seniority: p.seniority_level,
                    department: p.department,
                    email: p.email || 'N/A',
                    phone: p.phone,
                    linkedin: p.linkedin_url,
                })),
            }
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error fetching companies:', error)
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }
}
