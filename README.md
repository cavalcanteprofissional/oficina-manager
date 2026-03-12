# 🚀 Oficina Manager

**Versão:** 1.0.0

Sistema completo de gestão para oficinas mecânicas. Aplicação web progressiva (PWA) construída com Next.js 15, Supabase e Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| Next.js 15 | Framework React com App Router |
| React 19 | Biblioteca de UI |
| Tailwind CSS | Framework de estilização |
| Supabase | Banco de dados PostgreSQL + Auth + Storage |
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
- ✅ Ordens de Serviço (OS)
- ✅ Vendas no balcão
- ✅ Controle de estoque
- ✅ Agendamentos
- ✅ Dashboard

### Financeiro
- ✅ Contas a Pagar
- ✅ Contas a Receber
- ✅ Controle de Caixa

### Extras
- ✅ Relatórios
- ✅ Reajuste de preços em massa
- ✅ PWA (instalável)

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
│   ├── (auth)/          # Login, Registro
│   ├── (dashboard)/     # Páginas protegidas
│   └── api/            # API Routes
├── components/
│   ├── ui/             # Componentes base
│   └── layout/         # Sidebar, Navigation
└── lib/
    └── supabase/       # Cliente/Server Supabase
```

---

## 📱 PWA

O app pode ser instalado como aplicativo nativo:

1. Acesse pelo navegador (Chrome/Safari)
2. Toque em "Adicionar à tela inicial"
3. Use offline (funcionalidades básicas)

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
