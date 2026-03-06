import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || ''

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // If no API key configured, return empty list (placeholder for when key is added)
        if (!HUBSPOT_API_KEY) {
            return NextResponse.json({
                owners: [],
                _warning: 'HUBSPOT_API_KEY not configured. Add it to .env to fetch real owners.',
            })
        }

        const res = await fetch('https://api.hubapi.com/crm/v3/owners?limit=100', {
            headers: {
                Authorization: `Bearer ${HUBSPOT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            next: { revalidate: 300 }, // cache 5 min
        })

        if (!res.ok) {
            console.error('HubSpot API error:', res.status, await res.text())
            return NextResponse.json({ error: 'Failed to fetch HubSpot owners' }, { status: 502 })
        }

        const data = await res.json()

        const owners = (data.results || []).map((owner: Record<string, string>) => ({
            id: owner.id,
            email: owner.email,
            firstName: owner.firstName || '',
            lastName: owner.lastName || '',
            label: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email,
        }))

        return NextResponse.json({ owners })
    } catch (error) {
        console.error('Error fetching HubSpot owners:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
