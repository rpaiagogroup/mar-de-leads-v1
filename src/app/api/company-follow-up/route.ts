import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAction } from '@/lib/logAction'

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
        const { company_domain, follow_up_date, follow_up_notes } = body

        if (!company_domain) {
            return NextResponse.json({ error: 'company_domain is required' }, { status: 400 })
        }

        const action = await prisma.company_actions.upsert({
            where: { company_domain },
            create: {
                company_domain,
                follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
                follow_up_notes: follow_up_notes || null,
            },
            update: {
                follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
                follow_up_notes: follow_up_notes || null,
            },
        })

        await logAction({
            userEmail: session.user.email,
            actionType: follow_up_date ? 'follow_up_set' : 'follow_up_removed',
            entityType: 'company',
            entityId: company_domain,
            details: { follow_up_date, follow_up_notes },
        })

        return NextResponse.json({ success: true, action })
    } catch (error) {
        console.error('Error setting follow-up:', error)
        return NextResponse.json({ error: 'Failed to set follow-up' }, { status: 500 })
    }
}
