'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CompanyList } from '@/components/CompanyList'

const NAV_ITEMS = [
  { href: '/', label: 'China' },
  { href: '/todos', label: 'China 2' },
] as const

export default function Dashboard() {
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
              <span className="text-slate-300 font-light ml-1">China</span>
            </h2>
          </div>

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
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CompanyList source="china" />
      </main>
    </div>
  )
}
