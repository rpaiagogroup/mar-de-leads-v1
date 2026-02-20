'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { CompanyList } from '@/components/CompanyList'

const NAV_ITEMS = [
    { href: '/', label: 'China' },
    { href: '/todos', label: 'China 2' },
    { href: '/china3', label: 'China 3' },
] as const

export default function DashboardChina3() {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col relative pl-16">
                        <img
                            src="/logo_icon.png"
                            alt="Mar de Leads Logo"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 object-contain"
                        />
                        <h1 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">
                            DASHBOARD COMERCIAL
                        </h1>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                            MAR DE LEADS{' '}
                            <span className="text-slate-300 font-light ml-1">
                                China 3
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Section Navigation */}
                        <nav className="flex gap-2">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pathname === item.href
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Logout */}
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <CompanyList
                    source="china"
                    apiEndpoint="/api/companies-v2"
                    statusEndpoint="/api/contact-status-v2"
                />
            </main>
        </div>
    )
}
