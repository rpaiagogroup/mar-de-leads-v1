import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || ''

const DEAL_STAGE_LABELS: Record<string, string> = {
    appointmentscheduled: 'Reuniao Agendada',
    qualifiedtobuy: 'Qualificado',
    presentationscheduled: 'Apresentacao Agendada',
    decisionmakerboughtin: 'Decisor Envolvido',
    contractsent: 'Contrato Enviado',
    closedwon: 'Fechado Ganho',
    closedlost: 'Fechado Perdido',
}

function labelForStage(stage: string): string {
    return DEAL_STAGE_LABELS[stage] || stage
}

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const companyDomain = searchParams.get('company_domain')

        if (!companyDomain) {
            return NextResponse.json({ error: 'company_domain is required' }, { status: 400 })
        }

        const action = await prisma.company_actions.findUnique({
            where: { company_domain: companyDomain },
        })

        if (!action?.hubspot_deal_id) {
            return NextResponse.json({
                hubspot_status: action?.hubspot_status || null,
                hubspot_deal_stage: action?.hubspot_deal_stage || null,
                hubspot_last_synced_at: action?.hubspot_last_synced_at?.toISOString() || null,
                _source: 'local',
            })
        }

        if (!HUBSPOT_API_KEY) {
            return NextResponse.json({
                hubspot_status: action.hubspot_status || null,
                hubspot_deal_stage: action.hubspot_deal_stage || null,
                hubspot_last_synced_at: action.hubspot_last_synced_at?.toISOString() || null,
                _source: 'local',
                _warning: 'HUBSPOT_API_KEY not configured',
            })
        }

        // Fetch deal from HubSpot API
        const res = await fetch(
            `https://api.hubapi.com/crm/v3/objects/deals/${action.hubspot_deal_id}?properties=dealstage,dealname,amount,closedate,hs_lastmodifieddate`,
            {
                headers: {
                    Authorization: `Bearer ${HUBSPOT_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!res.ok) {
            console.error('HubSpot deal fetch error:', res.status)
            return NextResponse.json({
                hubspot_status: action.hubspot_status || null,
                hubspot_deal_stage: action.hubspot_deal_stage || null,
                hubspot_last_synced_at: action.hubspot_last_synced_at?.toISOString() || null,
                _source: 'local_fallback',
            })
        }

        const deal = await res.json()
        const dealStage = deal.properties?.dealstage || null
        const statusLabel = dealStage ? labelForStage(dealStage) : null
        const now = new Date()

        // Update local cache
        await prisma.company_actions.update({
            where: { company_domain: companyDomain },
            data: {
                hubspot_status: statusLabel,
                hubspot_deal_stage: dealStage,
                hubspot_last_synced_at: now,
            },
        })

        return NextResponse.json({
            hubspot_status: statusLabel,
            hubspot_deal_stage: dealStage,
            hubspot_last_synced_at: now.toISOString(),
            deal_name: deal.properties?.dealname || null,
            amount: deal.properties?.amount || null,
            close_date: deal.properties?.closedate || null,
            _source: 'hubspot_api',
        })
    } catch (error) {
        console.error('Error fetching deal status:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
