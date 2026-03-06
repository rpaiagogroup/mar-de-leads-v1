// --- Shared Types ---

export type Contact = {
    id: string
    name: string
    title: string
    email: string
    phone: string | null
    linkedin: string | null
    seniority: string | null
    department: string | null
}

export type Company = {
    key: string
    name: string
    description: string
    website: string | null
    location: string | null
    industry: string | null
    numEmployees: number | null
    mockupLink: string | null
    origin: string | null
    finalidade: string | null
    state: string | null
    contacted: boolean
    contacted_by: string | null
    contacted_at: string | null
    sent_to_hubspot: boolean
    sent_to_hubspot_at: string | null
    vendedor_responsavel: string | null
    contacts: Contact[]
}

export type HubSpotOwner = {
    id: string
    email: string
    firstName: string
    lastName: string
    label: string
}

export type StatusFilter = 'all' | 'pending' | 'contacted'

export type EmployeeRange = '1-50' | '51-200' | '201-500' | '500+'

export type Filters = {
    search: string
    status: StatusFilter
    origins: string[]
    employeeRanges: EmployeeRange[]
    vendedores: string[]
}

// --- Shared Constants ---

export const SENIORITY_ORDER = [
    'c_suite',
    'founder',
    'head',
    'director',
    'senior',
    'manager',
    'partner',
    'entry',
] as const

export const SENIORITY_FILTER_OPTIONS = [
    { value: 'all', label: 'Todas Senioridades' },
    { value: 'c_suite', label: 'C-Level' },
    { value: 'director', label: 'Diretores' },
    { value: 'manager', label: 'Gerentes' },
    { value: 'head', label: 'Heads' },
] as const

// --- Shared Helpers ---

export function getSeniorityBadge(level: string | null) {
    if (!level) return { label: '?', style: 'text-slate-500 bg-slate-100 border-slate-200' }

    const clean = level.toLowerCase()
    let style = 'text-slate-600 bg-slate-100 border-slate-200'
    let label = level.toUpperCase()

    switch (clean) {
        case 'c_suite':
            label = 'C-LEVEL'
            style = 'text-red-700 bg-red-100 border-red-200'
            break
        case 'founder':
            label = 'FOUNDER'
            style = 'text-orange-700 bg-orange-100 border-orange-200'
            break
        case 'head':
            label = 'HEAD'
            style = 'text-yellow-700 bg-yellow-100 border-yellow-200'
            break
        case 'director':
            label = 'DIRECTOR'
            style = 'text-green-700 bg-green-100 border-green-200'
            break
        case 'senior':
            style = 'text-blue-700 bg-blue-100 border-blue-200'
            break
        case 'manager':
            style = 'text-purple-700 bg-purple-100 border-purple-200'
            break
    }

    return { label, style }
}

export function cleanPhone(phone: string | null): string {
    return (phone || '').replace(/\D/g, '')
}

export function sortContactsBySeniority(contacts: Contact[]): Contact[] {
    return [...contacts].sort((a, b) => {
        const idxA = SENIORITY_ORDER.indexOf(
            (a.seniority?.toLowerCase() || '') as (typeof SENIORITY_ORDER)[number]
        )
        const idxB = SENIORITY_ORDER.indexOf(
            (b.seniority?.toLowerCase() || '') as (typeof SENIORITY_ORDER)[number]
        )
        const valA = idxA === -1 ? 99 : idxA
        const valB = idxB === -1 ? 99 : idxB
        return valA - valB
    })
}
