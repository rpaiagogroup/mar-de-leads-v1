'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Search, Loader2, RefreshCw } from 'lucide-react'
import {
    Company,
    Owner,
    StatusFilter,
    OWNERS,
    SENIORITY_FILTER_OPTIONS,
    sortContactsBySeniority,
} from '@/lib/types'
import { CompanyCard } from '@/components/CompanyCard'

type CompanyListProps = {
    /** API query param: 'china' filters by +55 phone, 'all' returns everything */
    source: 'china' | 'all'
    /** Override the API endpoint (default: /api/companies?source=...) */
    apiEndpoint?: string
    /** Override the status toggle endpoint (default: /api/company-status) */
    statusEndpoint?: string
}

export function CompanyList({ source, apiEndpoint, statusEndpoint }: CompanyListProps) {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeOwner, setActiveOwner] = useState<Owner>('VANESSA')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [seniorityFilter, setSeniorityFilter] = useState<string>('all')

    const fetchCompanies = async () => {
        try {
            setLoading(true)
            const url = apiEndpoint || `/api/companies?source=${source}`
            const res = await fetch(url)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source])

    const toggleStatus = async (company: Company) => {
        const userToLog = activeOwner
        const newStatus = !company.contacted

        // Optimistic update
        setCompanies((prev) =>
            prev.map((c) =>
                c.key === company.key ? { ...c, contacted: newStatus } : c
            )
        )

        try {
            await fetch(statusEndpoint || '/api/company-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_key: company.key,
                    contacted: newStatus,
                    contacted_by: userToLog,
                }),
            })
            toast.success(newStatus ? 'Marcada!' : 'Desmarcada.')
        } catch {
            toast.error('Erro ao atualizar.')
            fetchCompanies() // Revert on error
        }
    }

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copiado!`)
    }

    const filtered = useMemo(() => {
        return companies.filter((c) => {
            const matchesOwner = c.owner === activeOwner
            const matchesSearch =
                !search || c.name.toLowerCase().includes(search.toLowerCase())
            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : statusFilter === 'contacted'
                        ? c.contacted
                        : !c.contacted
            const matchesSeniority =
                seniorityFilter === 'all'
                    ? true
                    : c.contacts.some((contact) =>
                        (contact.seniority || '')
                            .toLowerCase()
                            .includes(seniorityFilter.toLowerCase())
                    )

            return matchesOwner && matchesSearch && matchesStatus && matchesSeniority
        })
    }, [companies, activeOwner, search, statusFilter, seniorityFilter])

    return (
        <>
            {/* Filters */}
            <div className="flex flex-1 w-full sm:w-auto gap-2 max-w-lg justify-end items-center">
                <select
                    className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md px-3 py-2 outline-none focus:border-indigo-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                >
                    <option value="all">Todos os Status</option>
                    <option value="pending">Pendentes</option>
                    <option value="contacted">Contatados</option>
                </select>

                <select
                    className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md px-3 py-2 outline-none focus:border-indigo-500"
                    value={seniorityFilter}
                    onChange={(e) => setSeniorityFilter(e.target.value)}
                >
                    {SENIORITY_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className="relative w-full sm:w-48">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-md text-sm outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button
                    onClick={fetchCompanies}
                    className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
                    title="Atualizar"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            {/* Owner Tabs */}
            <div className="flex border-b border-slate-200 mb-8 gap-6 mt-6">
                {OWNERS.map((owner) => (
                    <button
                        key={owner}
                        onClick={() => setActiveOwner(owner)}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeOwner === owner
                            ? 'text-blue-600 bg-blue-50/50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {owner}
                        {activeOwner === owner && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 shadow-[0_-2px_6px_rgba(37,99,235,0.2)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    Lista de Prospecção
                </h2>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded-full font-mono text-slate-600">
                    {filtered.length} Empresas
                </span>
            </div>

            {/* Company Cards */}
            {loading && filtered.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {filtered.map((company) => (
                        <CompanyCard
                            key={company.key}
                            company={company}
                            onToggle={toggleStatus}
                            onCopy={handleCopy}
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-lg">
                            Nenhuma empresa encontrada para este filtro.
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
