import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const user = searchParams.get('user') || undefined
        const action = searchParams.get('action') || undefined
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: Record<string, unknown> = {}
        if (user) where.user_email = user
        if (action) where.action_type = action

        const [logs, total] = await Promise.all([
            prisma.action_logs.findMany({
                where,
                orderBy: { created_at: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.action_logs.count({ where }),
        ])

        return NextResponse.json({ logs, total })
    } catch (error) {
        console.error('Error fetching logs:', error)
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }
}
