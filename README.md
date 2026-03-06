# Mar de Leads v2

Dashboard comercial para prospeccao de leads B2B com integracao bidirecional HubSpot.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma ORM** + PostgreSQL (Supabase)
- **Tailwind CSS** + Lucide React
- **NextAuth** (Google OAuth — @gocase.com / @gobeaute.com.br)
- **Sonner** (toasts)

## Arquitetura

```
src/
  app/
    page.tsx              # Dashboard principal (protegido por auth)
    login/page.tsx        # Login Google OAuth
    logs/page.tsx         # Historico de acoes
    api/
      companies/          # GET listao, POST adicionar empresa
      company-status/     # POST marcar contatado
      company-follow-up/  # POST follow-up
      company-hubspot/    # POST enviar para HubSpot
      hubspot/
        owners/           # GET vendedores HubSpot
        deal-status/      # GET status deal HubSpot
      logs/               # GET historico de acoes
  components/
    CompanyList.tsx        # Lista principal + filtros + header
    CompanyCard.tsx        # Card expandivel de empresa
    FilterBar.tsx          # Barra de filtros multi-select
    AddCompanyModal.tsx    # Modal adicionar empresa
    LogsView.tsx           # Tabela de logs paginada
  lib/
    types.ts               # Tipos compartilhados
    prisma.ts              # Singleton Prisma
    logAction.ts           # Util para logging de acoes
```

### Tabelas (Supabase)

| Tabela | Descricao |
|--------|-----------|
| `empresas_enriquecidas_2` | Dados enriquecidos das empresas (218 registros) |
| `pessoas_apollo_b2b_2` | Contatos B2B (594 registros) |
| `company_actions` | Status, follow-up, integracao HubSpot |
| `action_logs` | Historico de todas as acoes |

## Setup Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variaveis de ambiente**:
   ```bash
   cp .env.example .env
   # Preencher as variaveis obrigatorias (DATABASE_URL, AUTH_*)
   ```

3. **Gerar Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Rodar**:
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000`

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string PostgreSQL (Supabase) |
| `AUTH_SECRET` | Sim | Secret do NextAuth |
| `AUTH_GOOGLE_ID` | Sim | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Sim | Google OAuth Client Secret |
| `HUBSPOT_API_KEY` | Nao | Token da Private App HubSpot (owners + deal status) |
| `N8N_HUBSPOT_WEBHOOK_URL` | Nao | URL webhook n8n para envio de contato ao HubSpot |
| `N8N_ADD_COMPANY_WEBHOOK_URL` | Nao | URL webhook n8n para adicionar empresa |

> Sem as variaveis opcionais, o app funciona normalmente — as features de HubSpot e adicao manual degradam graciosamente.

## Funcionalidades

- **Listao unico** de empresas com cards expandiveis
- **Filtros combinaveis**: industria, senioridade, departamento, estado, status, HubSpot, origem, faixa de funcionarios, finalidade, vendedor
- **Acoes por contato**: copiar email, WhatsApp, LinkedIn, enviar para HubSpot
- **Follow-up** com data e notas
- **Integracao HubSpot**: envio via n8n + leitura de status direto na API HubSpot
- **Adicionar empresa** manualmente via webhook n8n
- **Logs** de todas as acoes (pagina /logs)
- **Filtros persistidos na URL** (compartilhavel)
- **Auth Google OAuth** restrito a dominios corporativos
