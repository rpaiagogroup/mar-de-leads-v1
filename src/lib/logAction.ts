import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type ActionType =
    | 'contact_marked'
    | 'contact_unmarked'
    | 'hubspot_sent'
    | 'follow_up_set'
    | 'follow_up_removed'
    | 'company_added'

export async function logAction({
    userEmail,
    actionType,
    entityType,
    entityId,
    details,
}: {
    userEmail: string
    actionType: ActionType
    entityType: 'company' | 'contact'
    entityId: string
    details?: Record<string, unknown>
}) {
    try {
        await prisma.action_logs.create({
            data: {
                user_email: userEmail,
                action_type: actionType,
                entity_type: entityType,
                entity_id: entityId,
                details: details ? (details as Prisma.InputJsonValue) : undefined,
            },
        })
    } catch (error) {
        console.error('Failed to log action:', error)
    }
}
