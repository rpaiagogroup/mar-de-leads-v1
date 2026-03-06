import { NextResponse } from 'next/server'

// Deprecated: HubSpot status sync is now read directly by the app via HubSpot API.
// This endpoint is intentionally disabled to avoid n8n-based read sync.

export async function POST() {
    return NextResponse.json(
        {
            error: 'Deprecated endpoint. HubSpot read sync must happen in-app via HubSpot API.',
        },
        { status: 410 }
    )
}