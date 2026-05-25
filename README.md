# 🚀 Oficina Manager

**Versão:** 1.1.0

Sistema completo de gestão para oficinas mecânicas. Aplicação web progressiva (PWA) construída com Next.js 16, Supabase e Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| Next.js 16 | Framework React com App Router + Turbopack |
| React 19 | Biblioteca de UI |
| Tailwind CSS v4 | Framework de estilização |
| Supabase | Banco de dados PostgreSQL + Auth + Storage |
| Zod | Validação de schemas nas APIs |
| TypeScript | Tipagem estática |
| Vercel | Hospedagem |

---

## 📋 Funcionalidades

### Cadastros
- ✅ Clientes (com foto)
- ✅ Fornecedores
- ✅ Mecânicos (com especialidades)
- ✅ Veículos (múltiplas fotos)
- ✅ Produtos (estoque, margem de lucro)
- ✅ Serviços (mão de obra)

### Operações
- ✅ Ordens de Serviço (OS) com itens (produtos + serviços)
- ✅ Vendas no balcão (carrinho + baixa automática de estoque)
- ✅ Controle de estoque (movimentações, histórico, alertas)
- ✅ Agendamentos (calendário com status)
- ✅ Dashboard (estatísticas)

### Financeiro
- ✅ Contas a Pagar (juros, multa, baixa)
- ✅ Contas a Receber (recebimento parcial)
- ✅ Controle de Caixa (entradas, saídas, suprimento, sangria)

### Extras
- ✅ Relatórios (aniversariantes, top produtos/serviços, resumo)
- ✅ Reajuste de preços em massa (percentual ou valor fixo)
- ✅ PWA (instalável com service worker)
- ✅ Consulta automática de CEP (VIACEP)
- ✅ Sistema de gestão de usuários com 5 roles

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone <repo-url>

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Copie .env.local.example para .env.local
cp .env.local.example .env.local
# Edite com suas credenciais do Supabase
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

### Executando

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

---

## 📁 Estrutura

```
src/
├── app/
│   ├── (auth)/           # Login, Registro
│   ├── dashboard/        # 17 páginas protegidas (/dashboard/*)
│   └── api/              # 14 API Routes com validação Zod
├── components/
│   ├── ui/               # Button, Input, Modal, Toast, DataTable, SelectSearch, etc
│   ├── tables/           # DataTable genérico (paginação, ordenação, busca)
│   └── layout/           # Sidebar, BottomNavigation, AuthCheck
├── hooks/                # useSupabaseQuery, usePagination
├── types/                # Tipos TypeScript (database.ts)
├── lib/
│   ├── supabase/         # Cliente/Server Supabase
│   ├── schemas.ts        # Schemas Zod para validação
│   ├── api-utils.ts      # Helpers para API routes
│   └── utils/            # CEP, permissões de usuário
└── middleware.ts          # Proteção server-side de rotas
```

---

## 👥 Sistema de Usuários e Permissões

### Roles Disponíveis

| Role | Descrição | Acesso |
|------|-----------|--------|
| **admin** | Administrador | Todas as abas |
| **gerente** | Gerente | Dashboard, Clientes, Veículos, OS, Vendas, Estoque, Relatórios, Reajuste |
| **mecanico** | Mecânico | Dashboard, Ordens Serviço, Veículos, Agendamentos |
| **caixa** | Caixa | Dashboard, Vendas, Caixa, Contas Receber |
| **comum** | Comum | Apenas Dashboard |

### Configuração Inicial

1. Execute o script SQL em `src/lib/supabase/usuarios.sql` no Supabase SQL Editor
2. O primeiro usuário admin deve ser criado manualmente via SQL

### Criar Admin via SQL

```sql
INSERT INTO usuarios (id, nome, role, ativo)
VALUES ('SEU-USER-ID', 'Seu Nome', 'admin', true)
ON CONFLICT (id) DO NOTHING;
```

Obtenha o ID do usuário em: Supabase Dashboard → Authentication → Users

---

## 📱 PWA

O app pode ser instalado como aplicativo nativo:

1. Acesse pelo navegador (Chrome/Safari)
2. Toque em "Adicionar à tela inicial"
3. Service worker registrado com cache-first para assets estáticos

---

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis para Vercel

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |

---

## 📄 Licença

MIT License - see LICENSE for details.

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
