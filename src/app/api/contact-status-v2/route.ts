import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { company_key, contacted } = await request.json()

        if (!company_key) {
            return NextResponse.json({ error: 'company_key is required' }, { status: 400 })
        }

        // In v2, company_key is the domain. Update all contacts for this domain.
        await prisma.pessoas_apollo_b2b_2.updateMany({
            where: {
                company_domain: { contains: company_key, mode: 'insensitive' },
            },
            data: {
                contacted: contacted,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating v2 contact status:', error)
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }
}
