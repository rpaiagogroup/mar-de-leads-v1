# Mar de Leads v2

Dashboard comercial para prospeccao de leads B2B com envio direto ao HubSpot.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma ORM** + PostgreSQL (Supabase)
- **Tailwind CSS** + Lucide React
- **NextAuth** (Google OAuth — @gocase.com / @gobeaute.com.br)
- **Sonner** (toasts)

## Funcionalidades

- **Listao unico** de empresas com cards minimizados expandiveis (primeiro card expandido por padrao)
- **Layout 2 colunas** (estilo v1): coluna esquerda com info da empresa + botao "Ver Mockup" grande e roxo; coluna direita com grid de contatos
- **4 filtros simplificados**: Origem, Qtd. Funcionarios, Vendedor (com "Sem proprietario"), Status
- **Acoes por contato**: copiar email, WhatsApp, LinkedIn, Rascunho Gmail (abre draft pre-preenchido), Enviar para HubSpot
- **Envio HubSpot** via webhook n8n com vendedor do filtro global
- **Adicionar empresa** manualmente via modal (dispara enriquecimento via webhook n8n)
- **Marcar contatado** com registro de quem e quando
- **Sistema de logs** de todas as acoes com pagina dedicada `/logs` (filtros por usuario e tipo, paginacao)
- **Filtros persistidos na URL** (compartilhavel entre equipe)
- **Contadores** no topo: total empresas, contatos, contatados, pendentes
- **Busca em tempo real** por nome da empresa
- **Responsividade mobile** completa (cards e filtros empilham verticalmente)
- **Auth Google OAuth** restrito a dominios corporativos

## Arquitetura

```
src/
  app/
    page.tsx                    # Dashboard principal (protegido por auth)
    login/page.tsx              # Login Google OAuth
    logs/page.tsx               # Historico de acoes
    api/
      companies/
        route.ts                # GET — listao de empresas com contatos e status
        add/route.ts            # POST — adicionar empresa via webhook n8n
      company-status/route.ts   # POST — marcar/desmarcar contatado
      company-hubspot/route.ts  # POST — enviar para HubSpot via webhook n8n
      hubspot/
        owners/route.ts         # GET — vendedores da HubSpot API
      logs/route.ts             # GET — historico de acoes (paginado)
  components/
    CompanyList.tsx              # Lista principal + header + contadores
    CompanyCard.tsx              # Card expandivel 2 colunas (contatos, acoes, badges)
    FilterBar.tsx                # Barra de 4 filtros simplificados
    AddCompanyModal.tsx          # Modal para adicionar empresa
    LogsView.tsx                 # Tabela de logs paginada com filtros
  lib/
    types.ts                    # Tipos, helpers de senioridade, filtros
    emailTemplate.ts            # Template de email e builder de URL Gmail draft
    prisma.ts                   # Singleton Prisma Client
    logAction.ts                # Util para registrar acoes no banco
```

## Tabelas (Supabase)

| Tabela | Descricao | Registros |
|--------|-----------|-----------|
| `empresas_enriquecidas_2` | Dados enriquecidos das empresas (nome, industria, funcionarios, localizacao, mockup) | ~220 |
| `pessoas_apollo_b2b_2` | Contatos B2B (nome, cargo, senioridade, email, telefone, LinkedIn) | ~594 |
| `company_actions` | Status por empresa (contatado, HubSpot, vendedor) | dinamico |
| `action_logs` | Historico de todas as acoes dos usuarios | dinamico |

## Setup Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env
# Preencher as variaveis obrigatorias (DATABASE_URL, AUTH_*)

# 3. Gerar Prisma Client
npx prisma generate

# 4. Rodar
npm run dev
```

Acesse: `http://localhost:3000`

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|----------|:-----------:|-----------|
| `DATABASE_URL` | Sim | Connection string PostgreSQL (Supabase com pgbouncer) |
| `AUTH_SECRET` | Sim | Secret do NextAuth (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Sim | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Sim | Google OAuth Client Secret |
| `HUBSPOT_API_KEY` | Nao | Token da Private App HubSpot — necessario para buscar owners. Sem ela, dropdown de vendedores mostra input texto livre |
| `N8N_HUBSPOT_WEBHOOK_URL` | Nao | URL do webhook n8n para envio de leads ao HubSpot |
| `N8N_ADD_COMPANY_WEBHOOK_URL` | Nao | URL do webhook n8n para enriquecimento de empresa adicionada manualmente |

## Deploy

O projeto usa o repo `mar-de-leads-v1` (branch `main`). Para deploy:

1. Push para `main`
2. O Vercel detecta automaticamente e faz deploy
3. Configurar as variaveis de ambiente no painel do Vercel

> **Importante**: O build inclui `prisma generate` automaticamente (`npm run build` = `npx prisma generate && next build`).
