'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
    Check,
    Globe,
    ChevronDown,
    ChevronUp,
    Loader2,
    Smartphone,
    Mail,
    Linkedin,
    Database,
    ImageIcon,
    Building2,
    Users,
    MapPin,
    Briefcase,
    Send,
} from 'lucide-react'
import { Company, Contact, getSeniorityBadge, cleanPhone } from '@/lib/types'
import { buildGmailDraftUrl } from '@/lib/emailTemplate'

type CompanyCardProps = {
    company: Company
    selectedVendedor: { name: string; id: string; email: string } | null
    onStatusChange: (company: Company, contacted: boolean) => void
    onSendHubSpot: (company: Company, contact: Contact, ownerName: string, hubspotOwnerId: string, hubspotOwnerEmail: string) => void
    onCopy: (text: string, label: string) => void
    defaultExpanded?: boolean
}

function getDepartmentLabel(dept: string | null): string {
    if (!dept) return ''
    const map: Record<string, string> = {
        master_marketing: 'Marketing',
        master_human_resources: 'RH',
        c_suite: 'C-Suite',
        master_finance: 'Financeiro',
        master_sales: 'Vendas',
        master_operations: 'Operacoes',
        master_engineering_technical: 'Engenharia',
        master_information_technology: 'TI',
    }
    return map[dept.toLowerCase()] || dept.replace(/^master_/, '').replace(/_/g, ' ')
}

function formatDate(iso: string | null): string {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function CompanyCard({ company, selectedVendedor, onStatusChange, onSendHubSpot, onCopy, defaultExpanded = false }: CompanyCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded)
    const [sendingId, setSendingId] = useState<string | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(expanded ? contentRef.current.scrollHeight : 0)
        }
    }, [expanded, company.contacts.length])

    const handleSendHubSpot = async (contact: Contact) => {
        if (sendingId) return
        const ownerName = selectedVendedor?.name || ''
        const ownerId = selectedVendedor?.id || ''
        const ownerEmail = selectedVendedor?.email || ''
        setSendingId(contact.id)
        try {
            await onSendHubSpot(company, contact, ownerName, ownerId, ownerEmail)
        } finally {
            setSendingId(null)
        }
    }

    const location = company.location
    const qualifiedCount = company.contacts.length

    return (
        <div
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                company.contacted
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-slate-200'
            }`}
        >
            {/* Minimized Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-left hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                            {company.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {company.industry && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                    <Building2 className="w-3 h-3" />
                                    {company.industry}
                                </span>
                            )}
                            {location && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                    <MapPin className="w-3 h-3" />
                                    {location}
                                </span>
                            )}
                            {company.numEmployees && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                    <Users className="w-3 h-3" />
                                    {company.numEmployees.toLocaleString('pt-BR')}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="shrink-0 text-slate-400 sm:hidden">
                        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {qualifiedCount} {qualifiedCount === 1 ? 'contato' : 'contatos'}
                    </span>

                    {company.sent_to_hubspot && (
                        <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200" title={company.vendedor_responsavel ? `Vendedor: ${company.vendedor_responsavel}` : undefined}>
                            <Send className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            <span className="hidden sm:inline">HubSpot{company.vendedor_responsavel ? ` - ${company.vendedor_responsavel}` : ''}</span>
                            <span className="sm:hidden">HS</span>
                        </span>
                    )}

                    {company.contacted && (
                        <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-green-50 text-green-600 border border-green-200">
                            Contatado
                        </span>
                    )}
                </div>

                <span className="shrink-0 text-slate-400 hidden sm:block">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
            </button>

            {/* Expanded Content — 2-column v1 layout */}
            <div
                ref={contentRef}
                style={{ maxHeight: contentHeight !== undefined ? `${contentHeight}px` : expanded ? 'none' : '0px' }}
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                onTransitionEnd={() => {
                    if (expanded && contentRef.current) {
                        contentRef.current.style.maxHeight = 'none'
                    }
                }}
            >
                <div className="border-t border-slate-100">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Column — Company Info (30%) */}
                        <div className="md:w-[30%] p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/40 relative">
                            {/* Mark Contacted — top right */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onStatusChange(company, !company.contacted)
                                }}
                                className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    company.contacted
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                                title={company.contacted ? 'Desmarcar contatado' : 'Marcar contatado'}
                            >
                                <Check className="w-3.5 h-3.5" />
                                {company.contacted ? 'Contatado' : 'Marcar'}
                            </button>

                            <h2 className="text-lg font-bold text-slate-800 pr-24 leading-snug">
                                {company.name}
                            </h2>

                            <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {qualifiedCount} {qualifiedCount === 1 ? 'lead' : 'leads'}
                            </span>

                            {/* Ver Mockup — Big Purple Button */}
                            {company.mockupLink && (
                                <a
                                    href={company.mockupLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Ver Mockup
                                </a>
                            )}

                            {/* Description */}
                            {company.description && company.description !== 'Sem descricao disponivel.' && (
                                <p className="mt-4 text-xs text-slate-500 leading-relaxed line-clamp-4">
                                    {company.description}
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="mt-4 space-y-2">
                                {company.industry && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                        {company.industry}
                                    </div>
                                )}
                                {company.numEmployees && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        {company.numEmployees.toLocaleString('pt-BR')} funcionarios
                                    </div>
                                )}
                                {location && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {location}
                                    </div>
                                )}
                                {company.website && (
                                    <a
                                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs text-blue-600 hover:underline font-medium"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        Website
                                    </a>
                                )}
                            </div>

                            {/* Contacted by info */}
                            {company.contacted && company.contacted_by && (
                                <p className="mt-4 text-[11px] text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                                    Contatado por {company.contacted_by} em {formatDate(company.contacted_at)}
                                </p>
                            )}
                        </div>

                        {/* Right Column — Contacts Grid (70%) */}
                        <div className="md:w-[70%] p-5 md:p-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                Contatos Qualificados ({company.contacts.length})
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {company.contacts.map((contact) => {
                                    const seniorityInfo = getSeniorityBadge(contact.seniority)
                                    const waLink = contact.phone
                                        ? `https://wa.me/${cleanPhone(contact.phone)}`
                                        : '#'

                                    return (
                                        <div
                                            key={contact.id}
                                            className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-white flex flex-col gap-2.5"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-sm text-slate-800 truncate">
                                                        {contact.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate" title={contact.title}>
                                                        {contact.title}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${seniorityInfo.style}`}
                                                >
                                                    {seniorityInfo.label}
                                                </span>
                                            </div>

                                            {contact.department && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                                    <Briefcase className="w-3 h-3" />
                                                    {getDepartmentLabel(contact.department)}
                                                </span>
                                            )}

                                            <div className="space-y-2 mt-1">
                                                {contact.email && contact.email !== 'N/A' && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 overflow-hidden text-slate-600">
                                                            <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                            <span className="text-xs truncate">{contact.email}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => onCopy(contact.email, 'Email')}
                                                            className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-medium px-2.5 py-1 rounded-md transition-all shrink-0"
                                                        >
                                                            copiar
                                                        </button>
                                                    </div>
                                                )}
                                                {contact.phone && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 overflow-hidden text-slate-600">
                                                            <Smartphone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                            <a
                                                                href={waLink}
                                                                target="_blank"
                                                                className="text-xs truncate hover:underline hover:text-green-600"
                                                            >
                                                                {contact.phone}
                                                            </a>
                                                        </div>
                                                        <button
                                                            onClick={() => onCopy(contact.phone || '', 'Numero')}
                                                            className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-medium px-2.5 py-1 rounded-md transition-all shrink-0"
                                                        >
                                                            copiar
                                                        </button>
                                                    </div>
                                                )}
                                                {contact.linkedin && (
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Linkedin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                        <a
                                                            href={contact.linkedin}
                                                            target="_blank"
                                                            className="text-xs hover:underline"
                                                        >
                                                            LinkedIn
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-1">
                                                {contact.email && contact.email !== 'N/A' && (
                                                    <a
                                                        href={buildGmailDraftUrl(contact, company.name, selectedVendedor?.name || 'VANESSA')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200"
                                                        title="Abrir rascunho no Gmail"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        Rascunho Gmail
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleSendHubSpot(contact)}
                                                    disabled={sendingId === contact.id}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all border ${
                                                        sendingId === contact.id
                                                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                                                            : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
                                                    }`}
                                                >
                                                    {sendingId === contact.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Database className="w-3 h-3" />
                                                    )}
                                                    {sendingId === contact.id ? 'Enviando...' : 'Enviar HubSpot'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
