'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { Filters, StatusFilter, EmployeeRange, Company } from '@/lib/types'

// --- Origin mapping ---

const ORIGIN_GROUPS: { value: string; label: string; raw: string[] }[] = [
    { value: 'prospeccao_linkedin', label: 'Prospecção LinkedIn', raw: ['linkedin', 'linkedin_scrapping'] },
    { value: 'prospeccao_icp', label: 'Prospecção ICP', raw: ['automatic', 'apollo'] },
    { value: 'inclusao_manual', label: 'Inclusão Manual', raw: ['manual_input', 'manual'] },
]

function rawOriginsForGroup(groupValues: string[]): string[] {
    return ORIGIN_GROUPS
        .filter((g) => groupValues.includes(g.value))
        .flatMap((g) => g.raw)
}

// --- No-owner sentinel ---

const NO_OWNER = '__sem_proprietario__'

// --- Multi-select dropdown (large style) ---

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

    const displayLabel = selected.length > 0
        ? `${label} (${selected.length})`
        : label

    return (
        <div ref={ref} className="relative flex-1 min-w-[180px]">
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    selected.length > 0
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[220px] max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-400">Nenhuma opcao</div>
                    )}
                    {options.map((opt) => (
                        <label
                            key={opt.value}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.value)}
                                onChange={() => toggle(opt.value)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-slate-800">{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Single-select dropdown (large style) ---

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
        <div ref={ref} className="relative flex-1 min-w-[180px]">
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    !isDefault
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
            >
                <span className="truncate">{label}: {current?.label}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-slate-200 rounded-lg shadow-lg">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false) }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${
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

// --- Extract vendedor options from companies ---

function extractVendedorOptions(companies: Company[]) {
    const vendedores = new Set<string>()
    for (const c of companies) {
        if (c.vendedor_responsavel) vendedores.add(c.vendedor_responsavel)
    }
    const sorted = Array.from(vendedores).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    return [
        { value: NO_OWNER, label: 'Sem proprietario' },
        ...sorted.map((v) => ({ value: v, label: v })),
    ]
}

// --- Extract origin options (only groups that have data) ---

function extractOriginOptions(companies: Company[]) {
    const rawOrigins = new Set<string>()
    for (const c of companies) {
        if (c.origin) rawOrigins.add(c.origin)
    }
    return ORIGIN_GROUPS.filter((g) =>
        g.raw.some((r) => rawOrigins.has(r))
    ).map((g) => ({ value: g.value, label: g.label }))
}

// --- Constants ---

const EMPLOYEE_RANGE_OPTIONS: { value: EmployeeRange; label: string }[] = [
    { value: '1-50', label: '1-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'contacted', label: 'Contatados' },
]

// --- Default filters ---

export const DEFAULT_FILTERS: Filters = {
    search: '',
    status: 'all',
    origins: [],
    employeeRanges: [],
    vendedores: [],
}

export function hasActiveFilters(filters: Filters): boolean {
    return (
        filters.status !== 'all' ||
        filters.origins.length > 0 ||
        filters.employeeRanges.length > 0 ||
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

        // Origin (mapped groups)
        if (filters.origins.length > 0) {
            const allowedRaw = rawOriginsForGroup(filters.origins)
            if (!c.origin || !allowedRaw.includes(c.origin)) return false
        }

        // Employee range
        if (!matchesEmployeeRange(c.numEmployees, filters.employeeRanges)) return false

        // Status
        if (filters.status === 'pending' && c.contacted) return false
        if (filters.status === 'contacted' && !c.contacted) return false

        // Vendedor (with "Sem proprietario" support)
        if (filters.vendedores.length > 0) {
            const hasNoOwner = filters.vendedores.includes(NO_OWNER)
            const namedVendedores = filters.vendedores.filter((v) => v !== NO_OWNER)

            const isNoOwner = !c.vendedor_responsavel
            const matchesNamed = namedVendedores.length > 0 && c.vendedor_responsavel && namedVendedores.includes(c.vendedor_responsavel)

            if (hasNoOwner && isNoOwner) return true
            if (matchesNamed) return true
            if (!hasNoOwner && !matchesNamed) return false
            if (hasNoOwner && !isNoOwner && namedVendedores.length === 0) return false
            if (!hasNoOwner) return false
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
    const originOptions = extractOriginOptions(companies)
    const vendedorOptions = extractVendedorOptions(companies)
    const active = hasActiveFilters(filters)

    const update = (partial: Partial<Filters>) => {
        onChange({ ...filters, ...partial })
    }

    const clear = () => {
        onChange({ ...DEFAULT_FILTERS, search: filters.search })
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <MultiSelect
                label="Origem"
                options={originOptions}
                selected={filters.origins}
                onChange={(v) => update({ origins: v })}
            />
            <MultiSelect
                label="Qtd. Funcionarios"
                options={EMPLOYEE_RANGE_OPTIONS}
                selected={filters.employeeRanges}
                onChange={(v) => update({ employeeRanges: v as EmployeeRange[] })}
            />
            <MultiSelect
                label="Vendedor"
                options={vendedorOptions}
                selected={filters.vendedores}
                onChange={(v) => update({ vendedores: v })}
            />
            <SingleSelect
                label="Status"
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={(v) => update({ status: v })}
            />
            {active && (
                <button
                    onClick={clear}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                >
                    <X className="w-4 h-4" />
                    Limpar filtros
                </button>
            )}
        </div>
    )
}
