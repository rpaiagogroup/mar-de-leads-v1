import { Contact } from './types'

/**
 * Full names for each owner, used in email signatures.
 * Update these as needed.
 */
const OWNER_FULL_NAMES: Record<string, string> = {
    VANESSA: 'Vanessa Araújo',
    DEBORAH: 'Deborah',
}

/**
 * Extracts the first name from a full name string.
 * "João Silva" → "João", "Maria" → "Maria"
 */
function getFirstName(fullName: string): string {
    return fullName.split(' ')[0] || fullName
}

/**
 * Builds the outreach email body with dynamic lead/company/owner data.
 */
function buildEmailBody(
    contact: Contact,
    companyName: string,
    ownerName: string,
): string {
    const leadFirstName = getFirstName(contact.name)
    const senderName = OWNER_FULL_NAMES[ownerName] || ownerName

    return `Oi, ${leadFirstName}! Tudo bem? Sou a ${senderName} da Gocase.

Vi que a ${companyName} tem iniciativas de onboarding e sabemos que o kit de onboarding é o momento em que a cultura vira experiência real para o colaborador.

Criamos kits corporativos personalizados, de alto padrão, e já atendemos Nubank, Netflix, Globo e Caixa. Entregamos para todo o Brasil, com mais de 2.000 empresas atendidas e 300 mil pessoas impactadas no ambiente corporativo.

Você teria disponibilidade para batermos um papo para eu te apresentar nossas soluções personalizadas para esse fortalecimento da cultura?

Vou te enviar algumas imagens para você visualizar melhor.`
}

/**
 * Builds a Gmail compose URL that opens a pre-filled draft.
 *
 * Gmail compose URL format:
 * https://mail.google.com/mail/?view=cm&fs=1&to=EMAIL&su=SUBJECT&body=BODY
 *
 * Note: Gmail compose URLs cannot attach files.
 * The user can manually attach the portfolio image after the draft opens.
 */
export function buildGmailDraftUrl(
    contact: Contact,
    companyName: string,
    ownerName: string,
): string {
    const to = contact.email && contact.email !== 'N/A' ? contact.email : ''
    const subject = `Kits Corporativos Personalizados — Gocase x ${companyName}`
    const body = buildEmailBody(contact, companyName, ownerName)

    const params = new URLSearchParams({
        view: 'cm',
        fs: '1',
        to,
        su: subject,
        body,
    })

    return `https://mail.google.com/mail/?${params.toString()}`
}
