import { Contact } from './types'

const OWNER_FULL_NAMES: Record<string, string> = {
    VANESSA: 'Vanessa Araujo',
    DEBORAH: 'Deborah',
}

function getFirstName(fullName: string): string {
    return fullName.split(' ')[0] || fullName
}

function buildEmailBody(
    contact: Contact,
    companyName: string,
    ownerName: string,
): string {
    const leadFirstName = getFirstName(contact.name)
    const senderName = OWNER_FULL_NAMES[ownerName.toUpperCase()] || ownerName

    return `Oi, ${leadFirstName}! Tudo bem? Sou a ${senderName} da Gocase.

Vi que a ${companyName} tem iniciativas de onboarding e sabemos que o kit de onboarding e o momento em que a cultura vira experiencia real para o colaborador.

Criamos kits corporativos personalizados, de alto padrao, e ja atendemos Nubank, Netflix, Globo e Caixa. Entregamos para todo o Brasil, com mais de 2.000 empresas atendidas e 300 mil pessoas impactadas no ambiente corporativo.

Voce teria disponibilidade para batermos um papo para eu te apresentar nossas solucoes personalizadas para esse fortalecimento da cultura?

Vou te enviar algumas imagens para voce visualizar melhor.`
}

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
