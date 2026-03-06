'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

interface LogEntry {
    id: string
    user_email: string
    action_type: string
    entity_type: string
    entity_id: string
    details: Record<string, unknown> | null
    created_at: string
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    contact_marked: { label: 'Contatado', color: 'bg-green-100 text-green-700' },
    contact_unmarked: { label: 'Desmarcar contato', color: 'bg-slate-100 text-slate-600' },
    hubspot_sent: { label: 'Enviado HubSpot', color: 'bg-orange-100 text-orange-700' },
    follow_up_set: { label: 'Follow-up definido', color: 'bg-sky-100 text-sky-700' },
    follow_up_removed: { label: 'Follow-up removido', color: 'bg-amber-100 text-amber-700' },
    company_added: { label: 'Empresa adicionada', color: 'bg-violet-100 text-violet-700' },
}

const PAGE_SIZE = 50

export function LogsView() {
    const router = useRouter()
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [filterUser, setFilterUser] = useState('')
    const [filterAction, setFilterAction] = useState('')

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                offset: String(page * PAGE_SIZE),
            })
            if (filterUser) params.set('user', filterUser)
            if (filterAction) params.set('action', filterAction)

            const res = await fetch(`/api/logs?${params}`)
            const data = await res.json()
            setLogs(data.logs || [])
            setTotal(data.total || 0)
        } catch {
            console.error('Failed to fetch logs')
        } finally {
            setLoading(false)
        }
    }, [page, filterUser, filterAction])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const totalPages = Math.ceil(total / PAGE_SIZE)

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const uniqueUsers = [...new Set(logs.map((l) => l.user_email))].sort()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-1 sm:gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar</span>
                    </button>
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                        Historico de Acoes
                    </h1>
                    <span className="text-xs text-slate-400 shrink-0">
                        {total} registro{total !== 1 ? 's' : ''}
                    </span>
                    <div className="flex-1" />
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-50 shrink-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                    <select
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); setPage(0) }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">Todas as acoes</option>
                        {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={filterUser}
                        onChange={(e) => { setFilterUser(e.target.value); setPage(0) }}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">Todos os usuarios</option>
                        {uniqueUsers.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {loading && logs.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-sm">
                        Nenhum log encontrado
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Data</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Usuario</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Acao</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Entidade</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Detalhes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const actionInfo = ACTION_LABELS[log.action_type] || {
                                            label: log.action_type,
                                            color: 'bg-slate-100 text-slate-600',
                                        }
                                        return (
                                            <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                                                    {log.user_email.split('@')[0]}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${actionInfo.color}`}>
                                                        {actionInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600 font-mono text-xs">
                                                    {log.entity_id}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-400 text-xs max-w-xs truncate">
                                                    {log.details ? JSON.stringify(log.details) : '-'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
                                <span className="text-xs text-slate-400">
                                    Pagina {page + 1} de {totalPages}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
