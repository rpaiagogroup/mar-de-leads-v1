import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { logAction } from '@/lib/logAction'

const WEBHOOK_URL = process.env.N8N_ADD_COMPANY_WEBHOOK_URL || ''

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let body
        try { body = await request.json() } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }
        const { company_name, domain, linkedin_url, notes } = body

        if (!company_name || !domain) {
            return NextResponse.json(
                { error: 'company_name and domain are required' },
                { status: 400 }
            )
        }

        // Clean domain (remove protocol and trailing slash)
        const cleanDomain = domain
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/+$/, '')

        if (!WEBHOOK_URL) {
            return NextResponse.json(
                { error: 'Webhook URL not configured (N8N_ADD_COMPANY_WEBHOOK_URL)' },
                { status: 503 }
            )
        }

        // Send domain to n8n webhook for enrichment
        const webhookRes = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domain: cleanDomain,
                company_name,
                linkedin_url: linkedin_url || null,
                notes: notes || null,
                added_by: session.user.email,
                fonte: 'MAR-DE-LEADS-V2-MANUAL',
            }),
        })

        if (!webhookRes.ok) {
            throw new Error(`Webhook failed: ${webhookRes.statusText}`)
        }

        await logAction({
            userEmail: session.user.email,
            actionType: 'company_added',
            entityType: 'company',
            entityId: cleanDomain,
            details: { company_name, linkedin_url, notes },
        })

        return NextResponse.json({ success: true, domain: cleanDomain })
    } catch (error) {
        console.error('Error adding company:', error)
        return NextResponse.json(
            { error: 'Failed to add company' },
            { status: 500 }
        )
    }
}
