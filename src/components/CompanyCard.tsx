'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
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
    Send,
    ImageIcon,
    Building2,
    Users,
    MapPin,
} from 'lucide-react'
import { buildGmailDraftUrl } from '@/lib/emailTemplate'
import { Company, Contact, getSeniorityBadge, cleanPhone } from '@/lib/types'

type CompanyCardProps = {
    company: Company
    onToggle: (company: Company) => void
    onCopy: (text: string, label: string) => void
}

export function CompanyCard({ company, onToggle, onCopy }: CompanyCardProps) {
    const [open, setOpen] = useState(true)
    const [sendingId, setSendingId] = useState<string | null>(null)

    const handleSendHubSpot = async (contact: Contact) => {
        if (sendingId) return

        setSendingId(contact.id)
        const toastId = toast.loading('Enviando para HubSpot...')

        try {
            const res = await fetch('/api/hubspot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: company.name,
                    name: contact.name,
                    phone: contact.phone,
                    email: contact.email,
                    linkedin: contact.linkedin,
                    owner: company.owner,
                }),
            })

            if (!res.ok) throw new Error('Falha no envio')
            toast.success('Enviado com sucesso!', { id: toastId })
        } catch {
            toast.error('Erro ao enviar.', { id: toastId })
        } finally {
            setSendingId(null)
        }
    }

    return (
        <div
            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col md:flex-row ${company.contacted
                ? 'border-green-200 bg-green-50/10'
                : 'border-slate-200'
                }`}
        >
            {/* Left Column: Company Info */}
            <div className="md:w-[30%] bg-slate-50/50 p-6 flex flex-col border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3
                        className="text-xl font-bold text-slate-800 leading-snug truncate"
                        title={company.name}
                    >
                        {company.name}
                    </h3>

                    <button
                        onClick={() => onToggle(company)}
                        className={`shrink-0 p-1.5 rounded-full transition-colors ${company.contacted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                            }`}
                        title={
                            company.contacted
                                ? 'Marcada como contatada'
                                : 'Marcar como contatada'
                        }
                    >
                        <Check className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 uppercase tracking-widest border border-slate-200 shadow-sm">
                        {company.contacts.length} Leads
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
                        {company.owner}
                    </span>
                </div>

                {/* Mockup Link - Prominent */}
                {company.mockupLink && (
                    <a
                        href={company.mockupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 hover:border-purple-300 transition-all font-bold text-sm shadow-sm"
                        title="Ver mockup no Google Drive"
                    >
                        <ImageIcon className="w-4 h-4" />
                        Ver Mockup
                    </a>
                )}

                <div className="text-xs text-slate-500 leading-relaxed overflow-y-auto max-h-[100px] mb-3 pr-2 custom-scrollbar">
                    {company.description || (
                        <span className="italic text-slate-400">
                            Descrição indisponível.
                        </span>
                    )}
                </div>

                {/* Company Metadata */}
                {(company.industry || company.numEmployees || company.location) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {company.industry && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <Building2 className="w-3 h-3" />
                                {company.industry}
                            </span>
                        )}
                        {company.numEmployees && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Users className="w-3 h-3" />
                                {company.numEmployees.toLocaleString('pt-BR')} funcionários
                            </span>
                        )}
                        {company.location && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100">
                                <MapPin className="w-3 h-3" />
                                {company.location}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {company.website ? (
                            <a
                                href={
                                    company.website.startsWith('http')
                                        ? company.website
                                        : `https://${company.website}`
                                }
                                target="_blank"
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 group"
                            >
                                <Globe className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                Website
                            </a>
                        ) : (
                            <span className="text-xs text-slate-400">Sem site</span>
                        )}

                    </div>

                    <div className="flex flex-col items-end">
                        {company.contacted && (
                            <span className="text-[10px] text-green-600 font-medium">
                                Contatado por {company.contacted_by}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Contacts */}
            <div className="md:w-[70%] p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Contatos Qualificados
                    </h4>
                    <button
                        onClick={() => setOpen(!open)}
                        className="text-slate-400 hover:text-indigo-600 md:hidden"
                    >
                        {open ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {open && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                        {company.contacts.map((contact) => {
                            const seniorityInfo = getSeniorityBadge(contact.seniority)
                            const waLink = contact.phone
                                ? `https://wa.me/${cleanPhone(contact.phone)}`
                                : '#'

                            return (
                                <div
                                    key={contact.id}
                                    className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group relative bg-white flex flex-col gap-3"
                                >
                                    {/* Top Row: Name & Badge */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div
                                                className="font-bold text-base text-slate-800 leading-tight"
                                                title={contact.name}
                                            >
                                                {contact.name}
                                            </div>
                                            <div
                                                className="text-xs text-slate-500 mt-0.5"
                                                title={contact.title}
                                            >
                                                {contact.title}
                                            </div>
                                        </div>
                                        <span
                                            className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${seniorityInfo.style}`}
                                        >
                                            {seniorityInfo.label}
                                        </span>
                                    </div>

                                    {/* Actions Rows */}
                                    <div className="space-y-2 mt-2">
                                        {/* Email Row */}
                                        {contact.email && (
                                            <div className="flex items-center justify-between group/row">
                                                <div className="flex items-center gap-2 overflow-hidden text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs truncate">
                                                        {contact.email}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => onCopy(contact.email, 'Email')}
                                                    className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-md transition-all whitespace-nowrap"
                                                    title="Copiar Email"
                                                >
                                                    copiar email
                                                </button>
                                            </div>
                                        )}

                                        {/* Phone Row */}
                                        {contact.phone && (
                                            <div className="flex items-center justify-between group/row">
                                                <div className="flex items-center gap-2 overflow-hidden text-slate-600">
                                                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                                    <a
                                                        href={waLink}
                                                        target="_blank"
                                                        className="text-xs truncate hover:underline hover:text-green-600 transition-colors"
                                                        title="Abrir WhatsApp"
                                                    >
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        onCopy(contact.phone || '', 'Número')
                                                    }
                                                    className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-md transition-all whitespace-nowrap"
                                                    title="Copiar Número"
                                                >
                                                    copiar numero
                                                </button>
                                            </div>
                                        )}

                                        {/* LinkedIn Row */}
                                        {contact.linkedin && (
                                            <div className="flex items-center justify-between group/row">
                                                <div className="flex items-center gap-2 overflow-hidden text-slate-600">
                                                    <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                                                    <a
                                                        href={contact.linkedin}
                                                        target="_blank"
                                                        className="text-xs truncate hover:underline underline-offset-2"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                </div>
                                                <a
                                                    href={contact.linkedin}
                                                    target="_blank"
                                                    className="ml-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-md transition-all whitespace-nowrap"
                                                >
                                                    abrir link
                                                </a>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-2">
                                            {/* Gmail Draft Button */}
                                            {contact.email && contact.email !== 'N/A' && (
                                                <a
                                                    href={buildGmailDraftUrl(contact, company.name, company.owner || 'VANESSA')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider py-2 rounded-md transition-all border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200"
                                                    title="Abrir rascunho no Gmail"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    Rascunho Gmail
                                                </a>
                                            )}

                                            {/* HubSpot Button */}
                                            <button
                                                onClick={() => handleSendHubSpot(contact)}
                                                disabled={sendingId === contact.id}
                                                className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider py-2 rounded-md transition-all border ${sendingId === contact.id
                                                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                                                    : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 hover:border-orange-200'
                                                    }`}
                                            >
                                                {sendingId === contact.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Database className="w-3 h-3" />
                                                )}
                                                {sendingId === contact.id
                                                    ? 'Enviando...'
                                                    : 'Enviar para HubSpot'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
