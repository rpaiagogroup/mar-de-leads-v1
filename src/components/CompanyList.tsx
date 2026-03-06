'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Search, Loader2, RefreshCw, Building2, Users, CheckCircle2, Clock, Plus, ClipboardList } from 'lucide-react'
import {
    Company,
    Contact,
    HubSpotOwner,
    Filters,
    StatusFilter,
    EmployeeRange,
    sortContactsBySeniority,
} from '@/lib/types'
import { CompanyCard } from '@/components/CompanyCard'
import { FilterBar, applyFilters, hasActiveFilters } from '@/components/FilterBar'
import { AddCompanyModal } from '@/components/AddCompanyModal'

// --- URL <-> Filters serialization ---

function filtersFromParams(params: URLSearchParams): Filters {
    const parseArray = (key: string) => {
        const val = params.get(key)
        return val ? val.split(',').filter(Boolean) : []
    }

    return {
        search: params.get('q') || '',
        status: (params.get('status') as StatusFilter) || 'all',
        origins: parseArray('origin'),
        employeeRanges: parseArray('employees') as EmployeeRange[],
        vendedores: parseArray('vendedor'),
    }
}

function filtersToParams(filters: Filters): string {
    const p = new URLSearchParams()
    if (filters.search) p.set('q', filters.search)
    if (filters.status !== 'all') p.set('status', filters.status)
    if (filters.origins.length) p.set('origin', filters.origins.join(','))
    if (filters.employeeRanges.length) p.set('employees', filters.employeeRanges.join(','))
    if (filters.vendedores.length) p.set('vendedor', filters.vendedores.join(','))
    return p.toString()
}

export function CompanyList() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [companies, setCompanies] = useState<Company[]>([])
    const [owners, setOwners] = useState<HubSpotOwner[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Filters>(() => filtersFromParams(searchParams))
    const [showAddModal, setShowAddModal] = useState(false)

    const fetchOwners = async () => {
        try {
            const res = await fetch('/api/hubspot/owners')
            if (res.ok) {
                const data = await res.json()
                setOwners(data.owners || [])
            }
        } catch {
            // Owners are optional — don't block if fetch fails
        }
    }

    const fetchCompanies = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/companies')
            if (!res.ok) throw new Error('Falha ao buscar dados')
            const data: Company[] = await res.json()

            const enriched = data.map((c) => ({
                ...c,
                contacts: sortContactsBySeniority(c.contacts),
            }))

            setCompanies(enriched)
        } catch {
            toast.error('Erro ao carregar dados.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCompanies()
        fetchOwners()
    }, [])

    // Sync filters to URL
    const updateFilters = useCallback((newFilters: Filters) => {
        setFilters(newFilters)
        const qs = filtersToParams(newFilters)
        router.replace(qs ? `?${qs}` : '/', { scroll: false })
    }, [router])

    const handleSearchChange = useCallback((value: string) => {
        updateFilters({ ...filters, search: value })
    }, [filters, updateFilters])

    const handleStatusChange = async (company: Company, contacted: boolean) => {
        setCompanies((prev) =>
            prev.map((c) =>
                c.key === company.key ? { ...c, contacted } : c
            )
        )

        try {
            const res = await fetch('/api/company-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_domain: company.key, contacted }),
            })
            if (!res.ok) throw new Error()
            toast.success(contacted ? 'Marcada como contatada!' : 'Desmarcada.')
        } catch {
            toast.error('Erro ao atualizar status.')
            fetchCompanies()
        }
    }

    const handleSendHubSpot = async (company: Company, contact: Contact, ownerName: string, hubspotOwnerId: string, hubspotOwnerEmail: string) => {
        const toastId = toast.loading('Enviando para HubSpot...')
        try {
            const res = await fetch('/api/company-hubspot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_domain: company.key,
                    company_name: company.name,
                    contact_name: contact.name,
                    contact_phone: contact.phone,
                    contact_email: contact.email,
                    contact_linkedin: contact.linkedin,
                    vendedor_responsavel: ownerName,
                    hubspot_owner_name: ownerName,
                    hubspot_owner_id: hubspotOwnerId,
                    hubspot_owner_email: hubspotOwnerEmail,
                }),
            })
            if (!res.ok) throw new Error('Falha no envio')
            setCompanies((prev) =>
                prev.map((c) =>
                    c.key === company.key ? { ...c, sent_to_hubspot: true, vendedor_responsavel: ownerName } : c
                )
            )
            toast.success('Enviado para HubSpot!', { id: toastId })
        } catch {
            toast.error('Erro ao enviar para HubSpot.', { id: toastId })
        }
    }

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copiado!`)
    }

    const filtered = useMemo(() => applyFilters(companies, filters), [companies, filters])

    // Derive selected vendedor from owners list (first selected in filter, if any)
    const selectedVendedor = useMemo(() => {
        if (filters.vendedores.length === 1) {
            const name = filters.vendedores[0]
            const owner = owners.find(o => o.label === name)
            return { name, id: owner?.id || '', email: owner?.email || '' }
        }
        return null
    }, [filters.vendedores, owners])

    const totalEmpresas = companies.length
    const totalContatos = companies.reduce((acc, c) => acc + c.contacts.length, 0)
    const contatados = companies.filter((c) => c.contacted).length
    const pendentes = totalEmpresas - contatados

    const activeFilterCount = hasActiveFilters(filters)

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <img src="/logo_icon.png" alt="Mar de Leads" className="w-9 h-9 rounded-lg" />
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900">
                                    Mar de Leads
                                </h1>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Dashboard de Prospeccao B2B
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full sm:w-72 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                    placeholder="Buscar empresa..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                title="Adicionar empresa"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Adicionar</span>
                            </button>
                            <button
                                onClick={() => router.push('/logs')}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                title="Historico de acoes"
                            >
                                <ClipboardList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={fetchCompanies}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                title="Atualizar"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Counters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        { icon: Building2, bg: 'bg-indigo-50', color: 'text-indigo-600', value: totalEmpresas, label: 'Empresas' },
                        { icon: Users, bg: 'bg-blue-50', color: 'text-blue-600', value: totalContatos, label: 'Contatos' },
                        { icon: CheckCircle2, bg: 'bg-green-50', color: 'text-green-600', value: contatados, label: 'Contatados' },
                        { icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', value: pendentes, label: 'Pendentes' },
                    ].map(({ icon: Icon, bg, color, value, label }) => (
                        <div key={label} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
                            <div className={`p-2 ${bg} rounded-lg`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-slate-800">
                                    {loading && companies.length === 0 ? (
                                        <span className="inline-block w-8 h-5 bg-slate-200 rounded animate-pulse" />
                                    ) : value}
                                </div>
                                <div className="text-xs text-slate-500">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
                <FilterBar
                    companies={companies}
                    filters={filters}
                    onChange={updateFilters}
                />
            </div>

            {/* Results count */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-600">
                        {filters.search || activeFilterCount
                            ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} filtrado${filtered.length !== 1 ? 's' : ''}`
                            : `${filtered.length} empresas`}
                    </h2>
                </div>
            </div>

            {/* Company List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
                {loading && companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-sm text-slate-400">Carregando empresas...</p>
                    </div>
                ) : (
                    <div className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
                        {filtered.map((company, index) => (
                            <CompanyCard
                                key={company.key}
                                company={company}
                                owners={owners}
                                selectedVendedor={selectedVendedor}
                                onStatusChange={handleStatusChange}
                                onSendHubSpot={handleSendHubSpot}
                                onCopy={handleCopy}
                                defaultExpanded={index === 0}
                            />
                        ))}
                        {filtered.length === 0 && !loading && (
                            <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white">
                                <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-medium">Nenhuma empresa encontrada</p>
                                {(filters.search || activeFilterCount) && (
                                    <p className="text-sm mt-1">Tente ajustar os filtros ou buscar por outro termo.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Company Modal */}
            <AddCompanyModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    toast.success('Empresa enviada para enriquecimento! Ela aparecera no listao apos o processamento.')
                    fetchCompanies()
                }}
            />
        </div>
    )
}
