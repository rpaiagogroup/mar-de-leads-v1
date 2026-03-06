'use client'

import React, { useState } from 'react'
import { X, Loader2, Plus } from 'lucide-react'

type Props = {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function AddCompanyModal({ open, onClose, onSuccess }: Props) {
    const [companyName, setCompanyName] = useState('')
    const [domain, setDomain] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!open) return null

    const reset = () => {
        setCompanyName('')
        setDomain('')
        setLinkedinUrl('')
        setNotes('')
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!companyName.trim() || !domain.trim()) {
            setError('Nome da empresa e dominio sao obrigatorios.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/companies/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: companyName.trim(),
                    domain: domain.trim(),
                    linkedin_url: linkedinUrl.trim() || null,
                    notes: notes.trim() || null,
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Erro ao adicionar empresa')
            }

            reset()
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Adicionar Empresa</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nome da empresa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Ex: Gocase"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Dominio / Website <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="Ex: gocase.com ou https://gocase.com"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            disabled={loading}
                        />
                        <p className="text-xs text-slate-400 mt-1">O dominio sera usado para enriquecimento automatico</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            LinkedIn URL
                        </label>
                        <input
                            type="text"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="Ex: https://linkedin.com/company/gocase"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Notas
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observacoes opcionais..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            {loading ? 'Enviando...' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
