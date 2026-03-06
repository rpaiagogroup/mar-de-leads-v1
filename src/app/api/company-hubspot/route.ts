import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAction } from '@/lib/logAction'

const WEBHOOK_URL = process.env.N8N_HUBSPOT_WEBHOOK_URL || 'https://n8n-study.gogroupgl.com/webhook/mar-de-leads-hub'

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
        const {
            company_domain,
            company_name,
            contact_name,
            contact_phone,
            contact_email,
            contact_linkedin,
            vendedor_responsavel,
            hubspot_owner_name,
            hubspot_owner_id,
            hubspot_owner_email,
        } = body

        if (!company_domain) {
            return NextResponse.json({ error: 'company_domain is required' }, { status: 400 })
        }

        // Send to n8n webhook
        const webhookRes = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_domain,
                empresa: company_name,
                'nome pessoa': contact_name,
                'numero telefone': contact_phone,
                email: contact_email,
                linkedin: contact_linkedin,
                'vendedor responsavel': vendedor_responsavel,
                hubspot_owner_name: hubspot_owner_name || vendedor_responsavel || null,
                hubspot_owner_id: hubspot_owner_id || null,
                hubspot_owner_email: hubspot_owner_email || null,
                fonte: 'MAR-DE-LEADS-V2',
            }),
        })

        if (!webhookRes.ok) {
            throw new Error(`Webhook failed: ${webhookRes.statusText}`)
        }

        // Mark as sent in company_actions
        const now = new Date()
        const action = await prisma.company_actions.upsert({
            where: { company_domain },
            create: {
                company_domain,
                sent_to_hubspot: true,
                sent_to_hubspot_at: now,
                vendedor_responsavel: vendedor_responsavel || null,
                hubspot_owner_id: hubspot_owner_id || null,
            },
            update: {
                sent_to_hubspot: true,
                sent_to_hubspot_at: now,
                vendedor_responsavel: vendedor_responsavel || null,
                hubspot_owner_id: hubspot_owner_id || null,
            },
        })

        await logAction({
            userEmail: session.user.email,
            actionType: 'hubspot_sent',
            entityType: 'company',
            entityId: company_domain,
            details: { company_name, contact_name, contact_email, vendedor_responsavel, hubspot_owner_name, hubspot_owner_id, hubspot_owner_email },
        })

        return NextResponse.json({ success: true, action })
    } catch (error) {
        console.error('Error sending to HubSpot:', error)
        return NextResponse.json({ error: 'Failed to send to HubSpot' }, { status: 500 })
    }
}
