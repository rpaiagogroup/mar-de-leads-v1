/**
 * List of 40 target companies for the "Todos os Leads" section.
 * Each entry maps a display name to its company_id (URL) as stored in pessoas_apollo_b2b.
 * Companies are ordered so that the first 20 go to VANESSA and the last 20 go to DEBORAH.
 */
export const TARGET_COMPANIES = [
    { name: 'Accenture Brasil', companyId: 'www.accenture.com.br' },
    { name: 'Allianz Partners', companyId: 'https://www.allianz-partners.com/' },
    { name: 'Banco do Brasil', companyId: 'http://www.bb.com.br' },
    { name: 'Beep Saúde', companyId: 'http://www.beepsaude.com.br' },
    { name: 'Bradesco Seguros', companyId: 'http://banco.bradesco' },
    { name: 'Catupiry®', companyId: 'http://www.catupiry.com.br' },
    { name: 'Cielo', companyId: 'http://www.cielo.com.br' },
    { name: 'Claro Brasil', companyId: 'http://www.claro.com.br' },
    { name: 'Clínica CEI', companyId: 'http://www.suzano.com.br' },
    { name: 'Consórcio Embracon', companyId: 'http://www.embracon.com.br' },
    { name: 'Crefisa', companyId: 'http://www.crefisa.com.br' },
    { name: 'CSN - Companhia Siderúrgica Nacional', companyId: 'http://www.csn.com.br' },
    { name: 'Decolar Brasil', companyId: 'https://www.decolar.com/' },
    { name: 'Embraer', companyId: 'https://embraer.com/global/en' },
    { name: 'Esfera Energia', companyId: 'https://esferaenergia.com.br/simplifica/' },
    { name: 'Estácio', companyId: 'http://www.estacio.br' },
    { name: 'Franquia Prudential do Brasil', companyId: 'https://www.prudential.com.br/seja-um-franqueado' },
    { name: 'Hero Brasil', companyId: 'http://www.hero.com.br' },
    { name: 'Caixa', companyId: 'caixa.gov.br' },
    { name: 'Hyundai Mobis Brasil', companyId: 'https://hyundaimobis.com.br/' },
    { name: 'Ipiranga', companyId: 'http://www.ipiranga.com.br' },
    { name: 'Itaú Unibanco', companyId: 'http://www.itau.com.br' },
    { name: 'Junto Seguros', companyId: 'http://www.juntoseguros.com' },
    { name: 'M. Dias Branco', companyId: 'https://abre.bio/mdb' },

    { name: 'MV', companyId: 'https://mla.bs/297344b6' },
    { name: 'Natura', companyId: 'http://www.natura.com.br' },
    { name: 'Nomad', companyId: 'https://www.nomadglobal.com/' },
    { name: 'Nubank', companyId: 'http://www.nubank.com.br' },
    { name: 'PagBank', companyId: 'https://pagbank.com.br/' },
    { name: 'Pipefy', companyId: 'www.pipefy.com' },
    { name: 'QuintoAndar', companyId: 'https://carreiras.quintoandar.com.br/' },
    { name: 'Rei do Pitaco', companyId: 'https://reidopitaco.bet.br/' },
    { name: 'Seguros Unimed', companyId: 'http://www.segurosunimed.com.br' },
    { name: 'Stellantis South América', companyId: 'https://www.stellantis.com/' },
    { name: 'Stone', companyId: 'stone.com.br' },
    { name: 'Vivo (Telefônica Brasil)', companyId: 'http://www.vivo.com.br' },
] as const

/** Just the company_id values for DB queries */
export const TARGET_COMPANY_IDS = TARGET_COMPANIES.map(c => c.companyId)
