'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import type { Filters, StatusFilter, HubspotFilter, EmployeeRange, Company } from '@/lib/types'

// --- Multi-select dropdown ---

function MultiSelect({
    label,
    options,
    selected,
    onChange,
}: {
    label: string
    options: { value: string; label: string }[]
    selected: string[]
    onChange: (vals: string[]) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const toggle = (val: string) => {
        onChange(
            selected.includes(val)
                ? selected.filter((v) => v !== val)
                : [...selected, val]
        )
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    selected.length > 0
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
                {label}
                {selected.length > 0 && (
                    <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {selected.length}
                    </span>
                )}
                <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-400">Nenhuma opcao</div>
                    )}
                    {options.map((opt) => (
                        <label
                            key={opt.value}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-xs"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.value)}
                                onChange={() => toggle(opt.value)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate text-slate-800">{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Single-select dropdown ---

function SingleSelect<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string
    options: { value: T; label: string }[]
    value: T
    onChange: (val: T) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const current = options.find((o) => o.value === value)
    const isDefault = value === options[0]?.value

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    !isDefault
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
                {label}: {current?.label}
                <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false) }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                                value === opt.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-800'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Helpers to extract unique values from companies ---

function extractOptions(companies: Company[]) {
    const industries = new Set<string>()
    const states = new Set<string>()
    const origins = new Set<string>()
    const finalidades = new Set<string>()
    const seniorities = new Set<string>()
    const departments = new Set<string>()
    const vendedores = new Set<string>()
    const hubspotStatuses = new Set<string>()

    for (const c of companies) {
        if (c.industry) industries.add(c.industry)
        if (c.state) states.add(c.state)
        if (c.origin) origins.add(c.origin)
        if (c.finalidade) finalidades.add(c.finalidade)
        if (c.vendedor_responsavel) vendedores.add(c.vendedor_responsavel)
        if (c.hubspot_status) hubspotStatuses.add(c.hubspot_status)
        for (const ct of c.contacts) {
            if (ct.seniority) seniorities.add(ct.seniority)
            if (ct.department) departments.add(ct.department)
        }
    }

    const toSorted = (s: Set<string>) =>
        Array.from(s).sort((a, b) => a.localeCompare(b, 'pt-BR'))

    return {
        industries: toSorted(industries).map((v) => ({ value: v, label: v })),
        states: toSorted(states).map((v) => ({ value: v, label: v })),
        origins: toSorted(origins).map((v) => ({ value: v, label: v })),
        finalidades: toSorted(finalidades).map((v) => ({ value: v, label: v })),
        vendedores: toSorted(vendedores).map((v) => ({ value: v, label: v })),
        hubspotStatuses: toSorted(hubspotStatuses).map((v) => ({ value: v, label: v })),
        seniorities: toSorted(seniorities).map((v) => ({
            value: v,
            label: SENIORITY_LABELS[v] || v,
        })),
        departments: toSorted(departments).map((v) => ({
            value: v,
            label: DEPARTMENT_LABELS[v] || v,
        })),
    }
}

const SENIORITY_LABELS: Record<string, string> = {
    c_suite: 'C-Level',
    founder: 'Founder',
    head: 'Head',
    director: 'Director',
    senior: 'Senior',
    manager: 'Manager',
    partner: 'Partner',
    entry: 'Entry',
    intern: 'Intern',
}

const DEPARTMENT_LABELS: Record<string, string> = {
    c_suite: 'C-Suite',
    design: 'Design',
    master_finance: 'Financeiro',
    master_human_resources: 'RH',
    master_marketing: 'Marketing',
    master_operations: 'Operacoes',
    product_management: 'Produto',
}

const EMPLOYEE_RANGE_OPTIONS: { value: EmployeeRange; label: string }[] = [
    { value: '1-50', label: '1-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendente' },
    { value: 'contacted', label: 'Contatado' },
    { value: 'follow_up', label: 'Follow-up pendente' },
]

const HUBSPOT_OPTIONS: { value: HubspotFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Nao' },
]

// --- Default filters ---

export const DEFAULT_FILTERS: Filters = {
    search: '',
    industries: [],
    seniorities: [],
    departments: [],
    states: [],
    status: 'all',
    hubspot: 'all',
    hubspotStatuses: [],
    origins: [],
    employeeRanges: [],
    finalidades: [],
    vendedores: [],
}

export function hasActiveFilters(filters: Filters): boolean {
    return (
        filters.industries.length > 0 ||
        filters.seniorities.length > 0 ||
        filters.departments.length > 0 ||
        filters.states.length > 0 ||
        filters.status !== 'all' ||
        filters.hubspot !== 'all' ||
        filters.hubspotStatuses.length > 0 ||
        filters.origins.length > 0 ||
        filters.employeeRanges.length > 0 ||
        filters.finalidades.length > 0 ||
        filters.vendedores.length > 0
    )
}

// --- Filter logic ---

function matchesEmployeeRange(num: number | null, ranges: EmployeeRange[]): boolean {
    if (ranges.length === 0) return true
    if (num === null) return false
    return ranges.some((r) => {
        switch (r) {
            case '1-50': return num >= 1 && num <= 50
            case '51-200': return num >= 51 && num <= 200
            case '201-500': return num >= 201 && num <= 500
            case '500+': return num > 500
        }
    })
}

export function applyFilters(companies: Company[], filters: Filters): Company[] {
    return companies.filter((c) => {
        // Text search
        if (filters.search) {
            const term = filters.search.toLowerCase()
            if (!c.name.toLowerCase().includes(term)) return false
        }

        // Industry
        if (filters.industries.length > 0) {
            if (!c.industry || !filters.industries.includes(c.industry)) return false
        }

        // State
        if (filters.states.length > 0) {
            if (!c.state || !filters.states.includes(c.state)) return false
        }

        // Origin
        if (filters.origins.length > 0) {
            if (!c.origin || !filters.origins.includes(c.origin)) return false
        }

        // Finalidade
        if (filters.finalidades.length > 0) {
            if (!c.finalidade || !filters.finalidades.includes(c.finalidade)) return false
        }

        // Employee range
        if (!matchesEmployeeRange(c.numEmployees, filters.employeeRanges)) return false

        // Status
        if (filters.status === 'pending' && c.contacted) return false
        if (filters.status === 'contacted' && !c.contacted) return false
        if (filters.status === 'follow_up') {
            if (!c.follow_up_date) return false
        }

        // HubSpot
        if (filters.hubspot === 'yes' && !c.sent_to_hubspot) return false
        if (filters.hubspot === 'no' && c.sent_to_hubspot) return false

        // Vendedor
        if (filters.vendedores.length > 0) {
            if (!c.vendedor_responsavel || !filters.vendedores.includes(c.vendedor_responsavel)) return false
        }

        // HubSpot Status
        if (filters.hubspotStatuses.length > 0) {
            if (!c.hubspot_status || !filters.hubspotStatuses.includes(c.hubspot_status)) return false
        }

        // Seniority (company has at least one contact matching)
        if (filters.seniorities.length > 0) {
            const hasSeniority = c.contacts.some(
                (ct) => ct.seniority && filters.seniorities.includes(ct.seniority)
            )
            if (!hasSeniority) return false
        }

        // Department (company has at least one contact matching)
        if (filters.departments.length > 0) {
            const hasDept = c.contacts.some(
                (ct) => ct.department && filters.departments.includes(ct.department)
            )
            if (!hasDept) return false
        }

        return true
    })
}

// --- FilterBar Component ---

type FilterBarProps = {
    companies: Company[]
    filters: Filters
    onChange: (filters: Filters) => void
}

export function FilterBar({ companies, filters, onChange }: FilterBarProps) {
    const [expanded, setExpanded] = useState(false)
    const options = extractOptions(companies)
    const active = hasActiveFilters(filters)

    const update = (partial: Partial<Filters>) => {
        onChange({ ...filters, ...partial })
    }

    const clear = () => {
        onChange({ ...DEFAULT_FILTERS, search: filters.search })
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-2.5"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Filtros</span>
                    {active && (
                        <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-[10px] font-medium">
                            Ativos
                        </span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
                <div className="px-4 pb-3 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                        <MultiSelect
                            label="Industria"
                            options={options.industries}
                            selected={filters.industries}
                            onChange={(v) => update({ industries: v })}
                        />
                        <MultiSelect
                            label="Senioridade"
                            options={options.seniorities}
                            selected={filters.seniorities}
                            onChange={(v) => update({ seniorities: v })}
                        />
                        <MultiSelect
                            label="Departamento"
                            options={options.departments}
                            selected={filters.departments}
                            onChange={(v) => update({ departments: v })}
                        />
                        <MultiSelect
                            label="Estado"
                            options={options.states}
                            selected={filters.states}
                            onChange={(v) => update({ states: v })}
                        />
                        <SingleSelect
                            label="Status"
                            options={STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(v) => update({ status: v })}
                        />
                        <SingleSelect
                            label="HubSpot"
                            options={HUBSPOT_OPTIONS}
                            value={filters.hubspot}
                            onChange={(v) => update({ hubspot: v })}
                        />
                        <MultiSelect
                            label="Origem"
                            options={options.origins}
                            selected={filters.origins}
                            onChange={(v) => update({ origins: v })}
                        />
                        <MultiSelect
                            label="Funcionarios"
                            options={EMPLOYEE_RANGE_OPTIONS}
                            selected={filters.employeeRanges}
                            onChange={(v) => update({ employeeRanges: v as EmployeeRange[] })}
                        />
                        <MultiSelect
                            label="Finalidade"
                            options={options.finalidades}
                            selected={filters.finalidades}
                            onChange={(v) => update({ finalidades: v })}
                        />
                        <MultiSelect
                            label="Vendedor"
                            options={options.vendedores}
                            selected={filters.vendedores}
                            onChange={(v) => update({ vendedores: v })}
                        />
                        {options.hubspotStatuses.length > 0 && (
                            <MultiSelect
                                label="Status HubSpot"
                                options={options.hubspotStatuses}
                                selected={filters.hubspotStatuses}
                                onChange={(v) => update({ hubspotStatuses: v })}
                            />
                        )}

                        {active && (
                            <button
                                onClick={clear}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Limpar filtros
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
