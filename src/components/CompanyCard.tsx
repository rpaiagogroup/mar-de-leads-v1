'use client'

import React, { useState } from 'react'
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
    CalendarClock,
    Send,
    RefreshCw,
    ArrowRightLeft,
} from 'lucide-react'
import { Company, Contact, HubSpotOwner, getSeniorityBadge, cleanPhone } from '@/lib/types'

type CompanyCardProps = {
    company: Company
    owners: HubSpotOwner[]
    onStatusChange: (company: Company, contacted: boolean) => void
    onFollowUp: (company: Company, date: string, notes: string) => void
    onSendHubSpot: (company: Company, contact: Contact, ownerName: string, hubspotOwnerId: string, hubspotOwnerEmail: string) => void
    onRefreshHubSpotStatus: (company: Company) => void
    onCopy: (text: string, label: string) => void
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

export function CompanyCard({ company, owners, onStatusChange, onFollowUp, onSendHubSpot, onRefreshHubSpotStatus, onCopy }: CompanyCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [sendingId, setSendingId] = useState<string | null>(null)
    const [showFollowUp, setShowFollowUp] = useState(false)
    const [followUpDate, setFollowUpDate] = useState(company.follow_up_date?.split('T')[0] || '')
    const [followUpNotes, setFollowUpNotes] = useState(company.follow_up_notes || '')
    const [selectedOwner, setSelectedOwner] = useState('')
    const [showOwnerSelect, setShowOwnerSelect] = useState<string | null>(null)
    const [refreshingStatus, setRefreshingStatus] = useState(false)

    const handleSendHubSpot = async (contact: Contact) => {
        if (sendingId) return
        const owner = owners.find(o => o.id === selectedOwner)
        const ownerName = owner?.label || selectedOwner || ''
        const ownerId = owner?.id || ''
        const ownerEmail = owner?.email || ''
        setSendingId(contact.id)
        try {
            await onSendHubSpot(company, contact, ownerName, ownerId, ownerEmail)
        } finally {
            setSendingId(null)
            setShowOwnerSelect(null)
            setSelectedOwner('')
        }
    }

    const handleFollowUpSave = () => {
        onFollowUp(company, followUpDate, followUpNotes)
        setShowFollowUp(false)
    }

    const location = company.location
    const qualifiedCount = company.contacts.length

    const isFollowUpDue = company.follow_up_date && new Date(company.follow_up_date) <= new Date()

    return (
        <div
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                company.contacted
                    ? 'border-green-200 bg-green-50/30'
                    : isFollowUpDue
                    ? 'border-amber-200 bg-amber-50/30'
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

                    {company.follow_up_date && (
                        <span className={`shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border ${
                            isFollowUpDue
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-sky-50 text-sky-600 border-sky-200'
                        }`}>
                            <CalendarClock className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            {formatDate(company.follow_up_date)}
                        </span>
                    )}

                    {company.sent_to_hubspot && (
                        <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200" title={company.vendedor_responsavel ? `Vendedor: ${company.vendedor_responsavel}` : undefined}>
                            <Send className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            <span className="hidden sm:inline">HubSpot{company.vendedor_responsavel ? ` - ${company.vendedor_responsavel}` : ''}</span>
                            <span className="sm:hidden">HS</span>
                        </span>
                    )}

                    {company.hubspot_status && (
                        <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-violet-50 text-violet-600 border border-violet-200">
                            <ArrowRightLeft className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                            {company.hubspot_status}
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

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Company Details Bar */}
                    <div className="px-4 sm:px-5 py-3 bg-slate-50/70 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
                        {company.description && company.description !== 'Sem descricao disponivel.' && (
                            <p className="w-full text-slate-500 text-xs leading-relaxed line-clamp-2 mb-1">
                                {company.description}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                            {company.website && (
                                <a
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Globe className="w-3 h-3" />
                                    Website
                                </a>
                            )}
                            {company.mockupLink && (
                                <a
                                    href={company.mockupLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Ver Mockup
                                </a>
                            )}

                            {/* Mark Contacted Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onStatusChange(company, !company.contacted)
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                    company.contacted
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                            >
                                <Check className="w-3 h-3" />
                                {company.contacted ? 'Contatado' : 'Marcar contatado'}
                            </button>

                            {/* Follow-up Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowFollowUp(!showFollowUp)
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                    company.follow_up_date
                                        ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                            >
                                <CalendarClock className="w-3 h-3" />
                                {company.follow_up_date ? `Follow-up ${formatDate(company.follow_up_date)}` : 'Follow-up'}
                            </button>
                        </div>

                        {/* Follow-up inline form */}
                        {showFollowUp && (
                            <div className="w-full mt-2 flex flex-wrap items-end gap-2 bg-white p-3 rounded-lg border border-slate-200" onClick={(e) => e.stopPropagation()}>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Data</label>
                                    <input
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="px-2 py-1 border border-slate-200 rounded text-xs"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Notas</label>
                                    <input
                                        type="text"
                                        value={followUpNotes}
                                        onChange={(e) => setFollowUpNotes(e.target.value)}
                                        placeholder="Ex: Ligar novamente..."
                                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                    />
                                </div>
                                <button
                                    onClick={handleFollowUpSave}
                                    className="px-3 py-1 bg-sky-500 text-white rounded text-xs font-semibold hover:bg-sky-600 transition-colors"
                                >
                                    Salvar
                                </button>
                                {company.follow_up_date && (
                                    <button
                                        onClick={() => {
                                            setFollowUpDate('')
                                            setFollowUpNotes('')
                                            onFollowUp(company, '', '')
                                            setShowFollowUp(false)
                                        }}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold hover:bg-red-100 transition-colors"
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Contacted by info */}
                        {company.contacted && company.contacted_by && (
                            <p className="w-full text-[11px] text-green-600">
                                Contatado por {company.contacted_by} em {formatDate(company.contacted_at)}
                            </p>
                        )}

                        {/* Follow-up notes */}
                        {company.follow_up_notes && !showFollowUp && (
                            <p className="w-full text-[11px] text-sky-600">
                                Follow-up: {company.follow_up_notes}
                            </p>
                        )}

                        {/* HubSpot Deal Status */}
                        {company.sent_to_hubspot && (
                            <div className="w-full flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-violet-600">
                                    <ArrowRightLeft className="w-3 h-3" />
                                    <span className="font-semibold">Status HubSpot:</span>
                                    <span>{company.hubspot_status || 'Sem status'}</span>
                                    {company.hubspot_deal_stage && (
                                        <span className="text-violet-400">({company.hubspot_deal_stage})</span>
                                    )}
                                    {company.hubspot_last_synced_at && (
                                        <span className="text-slate-400 ml-1">
                                            Sync: {formatDate(company.hubspot_last_synced_at)}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setRefreshingStatus(true)
                                        onRefreshHubSpotStatus(company)
                                        setTimeout(() => setRefreshingStatus(false), 2000)
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded hover:bg-violet-100 transition-colors"
                                    title="Atualizar status do HubSpot"
                                >
                                    <RefreshCw className={`w-3 h-3 ${refreshingStatus ? 'animate-spin' : ''}`} />
                                    Atualizar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contacts Grid */}
                    <div className="p-4 sm:p-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Contatos ({company.contacts.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                            {company.contacts.map((contact) => {
                                const seniorityInfo = getSeniorityBadge(contact.seniority)
                                const waLink = contact.phone
                                    ? `https://wa.me/${cleanPhone(contact.phone)}`
                                    : '#'

                                return (
                                    <div
                                        key={contact.id}
                                        className="p-3.5 rounded-lg border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all bg-white flex flex-col gap-2"
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

                                        <div className="space-y-1.5 mt-1">
                                            {contact.email && contact.email !== 'N/A' && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 overflow-hidden text-slate-600">
                                                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                                                        <span className="text-xs truncate">{contact.email}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => onCopy(contact.email, 'Email')}
                                                        className="ml-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded transition-all shrink-0"
                                                    >
                                                        copiar
                                                    </button>
                                                </div>
                                            )}
                                            {contact.phone && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 overflow-hidden text-slate-600">
                                                        <Smartphone className="w-3 h-3 shrink-0 text-slate-400" />
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
                                                        className="ml-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded transition-all shrink-0"
                                                    >
                                                        copiar
                                                    </button>
                                                </div>
                                            )}
                                            {contact.linkedin && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 overflow-hidden text-slate-600">
                                                        <Linkedin className="w-3 h-3 shrink-0 text-slate-400" />
                                                        <a
                                                            href={contact.linkedin}
                                                            target="_blank"
                                                            className="text-xs truncate hover:underline"
                                                        >
                                                            LinkedIn
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* HubSpot Button + Owner Selector */}
                                        {showOwnerSelect === contact.id ? (
                                            <div className="mt-1 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                {owners.length > 0 ? (
                                                    <select
                                                        value={selectedOwner}
                                                        onChange={(e) => setSelectedOwner(e.target.value)}
                                                        className="w-full px-2 py-1 border border-orange-200 rounded text-xs bg-orange-50 text-slate-700"
                                                    >
                                                        <option value="">Selecione vendedor...</option>
                                                        {owners.map((o) => (
                                                            <option key={o.id} value={o.id}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={selectedOwner}
                                                        onChange={(e) => setSelectedOwner(e.target.value)}
                                                        placeholder="Nome do vendedor..."
                                                        className="w-full px-2 py-1 border border-orange-200 rounded text-xs"
                                                    />
                                                )}
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleSendHubSpot(contact)}
                                                        disabled={sendingId === contact.id || !selectedOwner}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all border ${
                                                            sendingId === contact.id || !selectedOwner
                                                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                                                : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
                                                        }`}
                                                    >
                                                        {sendingId === contact.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Send className="w-3 h-3" />
                                                        )}
                                                        {sendingId === contact.id ? 'Enviando...' : 'Enviar'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowOwnerSelect(null); setSelectedOwner('') }}
                                                        className="px-2 py-1.5 text-[10px] font-bold text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowOwnerSelect(contact.id)}
                                                disabled={sendingId === contact.id}
                                                className={`mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all border ${
                                                    sendingId === contact.id
                                                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                                                        : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
                                                }`}
                                            >
                                                <Database className="w-3 h-3" />
                                                HubSpot
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
