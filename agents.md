# 🚀 Oficina Manager - Documentação Técnica

## 📋 Visão Geral

Sistema de gestão para oficina mecânica com funcionalidades completas de cadastro, controle de estoque, ordens de serviço e financeiro. Aplicação PWA construída com Next.js 15, Supabase e hospedada na Vercel.

---

## 🛠 Stack Tecnológica

| Tecnologia | Finalidade |
|------------|-------------|
| Next.js 15 | Frontend/Backend com API Routes |
| React 19 | Interface de usuário |
| Tailwind CSS | Estilização |
| Supabase | Banco de dados (PostgreSQL) |
| Supabase Storage | Armazenamento de imagens |
| Supabase Auth | Autenticação |
| Vercel | Hospedagem |
| next-pwa | Progressive Web App |

---

## 📁 Estrutura de Diretórios

```
oficina-manager/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Rotas protegidas
│   │   │   ├── clientes/
│   │   │   ├── fornecedores/
│   │   │   ├── mecanicos/
│   │   │   ├── veiculos/
│   │   │   ├── produtos/
│   │   │   ├── servicos/
│   │   │   ├── ordens-servico/
│   │   │   ├── vendas/
│   │   │   ├── estoque/
│   │   │   ├── caixa/
│   │   │   ├── contas-pagar/
│   │   │   ├── contas-receber/
│   │   │   ├── relatorios/
│   │   │   └── agendamentos/
│   │   ├── api/                  # API Routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                   # Componentes base
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── modals/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── utils/
│   │   └── constants/
│   ├── hooks/
│   ├── types/
│   └── styles/
├── public/
├── .env.local
├── next.config.js
└── package.json
```

---

## 📌 Instruções para IA

Ao desenvolver este projeto, siga estas regras:

- **Server Components** por padrão no Next.js 15
- **Client Components** apenas quando necessário (interatividade, hooks)
- **Zod** para validação de dados em todas as APIs
- **Feedback visual** para todas ações (toasts)
- **Responsividade** em todas as páginas
- **Tratamento de erros** em todas as chamadas à API
- **RLS e políticas de segurança** do Supabase
- **Índices** para otimizar consultas e evitar N+1 queries

---

# 🗓️ Fases de Implementação

## Fase 1: Fundação (Semanas 1-2)

### 1.1 Configuração do Projeto

- [ ] Criar projeto Next.js 15 com TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar ESLint e Prettier
- [ ] Criar estrutura de pastas base

### 1.2 Conexão com Supabase

- [ ] Configurar variáveis de ambiente (.env.local)
- [ ] Criar `src/lib/supabase/client.ts` (client-side)
- [ ] Criar `src/lib/supabase/server.ts` (server-side)
- [ ] Criar `src/lib/supabase/middleware.ts`
- [ ] Configurar buckets de storage para imagens

### 1.3 Autenticação

- [ ] Configurar Supabase Auth
- [ ] Criar página de login `src/app/(auth)/login/page.tsx`
- [ ] Criar página de registro `src/app/(auth)/register/page.tsx`
- [ ] Implementar middleware de proteção de rotas
- [ ] Criar sessão e logout

### 1.4 Layout Base

- [ ] Criar layout principal `src/app/layout.tsx`
- [ ] Criar componente Sidebar retrátil
- [ ] Criar componente Bottom Navigation (mobile)
- [ ] Configurar tema (cores conforme especificado)
- [ ] Configurar fonte Inter (Google Fonts)

### 1.5 Componentes UI Base

- [ ] DataTable (ordenação, filtros, paginação)
- [ ] ImageUpload (upload para Supabase Storage)
- [ ] CurrencyInput (formatação monetária)
- [ ] DatePicker
- [ ] SelectSearch (select com busca)
- [ ] Modal genérico
- [ ] Toast/Notification
- [ ] Button, Input, Label, Select

---

## Fase 2: Cadastros Básicos (Semanas 3-5)

### 2.1 Banco de Dados

Executar SQL completo (15 tabelas + índices + triggers):

```sql
-- Tabelas: clientes, fornecedores, mecanicos, veiculos, produtos, 
-- servicos, ordens_servico, os_itens, vendas, venda_itens, 
-- contas_pagar, contas_receber, caixa_movimentos, agendamentos, 
-- estoque_movimentos
```

### 2.2 Clientes

- [ ] API: `src/app/api/clientes/route.ts` (GET, POST)
- [ ] API: `src/app/api/clientes/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Página: `src/app/(dashboard)/clientes/page.tsx`
- [ ] Componente de formulário com upload de foto
- [ ] Listagem com DataTable
- [ ] Busca por nome, CPF, telefone

### 2.3 Fornecedores

- [ ] API: `src/app/api/fornecedores/route.ts`
- [ ] API: `src/app/api/fornecedores/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/fornecedores/page.tsx`
- [ ] Formulário de cadastro
- [ ] Listagem com DataTable

### 2.4 Mecânicos

- [ ] API: `src/app/api/mecanicos/route.ts`
- [ ] API: `src/app/api/mecanicos/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/mecanicos/page.tsx`
- [ ] Formulário com especialidades (array)
- [ ] Foto, commission percentage
- [ ] Listagem com filtro "ativo/inativo"

### 2.5 Veículos

- [ ] API: `src/app/api/veiculos/route.ts`
- [ ] API: `src/app/api/veiculos/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/veiculos/page.tsx`
- [ ] Vinculação com cliente (obrigatório)
- [ ] Múltiplas fotos
- [ ] Busca por placa, modelo, cliente

### 2.6 Produtos

- [ ] API: `src/app/api/produtos/route.ts`
- [ ] API: `src/app/api/produtos/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/produtos/page.tsx`
- [ ] Controle de estoque (mínimo, máximo, atual)
- [ ] Cálculo automático de margem de lucro
- [ ] Múltiplas fotos
- [ ] Busca por código, nome, código de barras

### 2.7 Serviços (Mão de Obra)

- [ ] API: `src/app/api/servicos/route.ts`
- [ ] API: `src/app/api/servicos/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/servicos/page.tsx`
- [ ] Tempo estimado (minutos)
- [ ] Preço sugerido
- [ ] Comissão percentual

---

## Fase 3: Operações (Semanas 6-9)

### 3.1 Ordens de Serviço

- [ ] API: `src/app/api/ordens-servico/route.ts`
- [ ] API: `src/app/api/ordens-servico/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/ordens-servico/page.tsx`
- [ ] Criar OS: selecionar cliente → veículo → serviços/produtos
- [ ] Itens da OS (produtos e serviços)
- [ ] Status: aberta, em_andamento, aguardando_pecas, concluida, cancelada
- [ ] Cálculo de total (itens + desconto)
- [ ] Vincular mecánico para comissão
- [ ] Impressão/visualização da OS

### 3.2 Vendas (Balcão)

- [ ] API: `src/app/api/vendas/route.ts`
- [ ] API: `src/app/api/vendas/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/vendas/page.tsx`
- [ ] Carrinho de compras
- [ ] Busca de produtos
- [ ] Venda vinculada a OS (opcional)
- [ ] Diversas formas de pagamento

### 3.3 Controle de Estoque

- [ ] API: `src/app/api/estoque/route.ts`
- [ ] Página: `src/app/(dashboard)/estoque/page.tsx`
- [ ] Movimentações de entrada/saída
- [ ] Histórico por produto
- [ ] Alerta de estoque mínimo
- [ ] Ajuste de estoque

### 3.4 Agendamentos

- [ ] API: `src/app/api/agendamentos/route.ts`
- [ ] API: `src/app/api/agendamentos/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/agendamentos/page.tsx`
- [ ] Calendário/schedule view
- [ ] Status: agendado, confirmado, em_andamento, concluido, cancelado
- [ ] Vincular mecánico

### 3.5 Dashboard

- [ ] Página inicial `src/app/(dashboard)/page.tsx`
- [ ] Resumo do dia (OS abertas, vendas, caixa)
- [ ] Gráficos simples
- [ ] Atalhos rápidos

---

## Fase 4: Financeiro (Semanas 10-12)

### 4.1 Contas a Pagar

- [ ] API: `src/app/api/contas-pagar/route.ts`
- [ ] API: `src/app/api/contas-pagar/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/contas-pagar/page.tsx`
- [ ] Cadastro de contas
- [ ] Vincular fornecedor
- [ ] Status: pendente, pago, atrasado, cancelado
- [ ] Juros, multa, desconto
- [ ] Listagem por vencimento

### 4.2 Contas a Receber

- [ ] API: `src/app/api/contas-receber/route.ts`
- [ ] API: `src/app/api/contas-receber/[id]/route.ts`
- [ ] Página: `src/app/(dashboard)/contas-receber/page.tsx`
- [ ] Vincular venda/OS
- [ ] Status: pendente, recebido, atrasado, cancelado
- [ ] Recebimento parcial

### 4.3 Controle de Caixa

- [ ] API: `src/app/api/caixa/route.ts`
- [ ] Página: `src/app/(dashboard)/caixa/page.tsx`
- [ ] Movimentações: entrada, saida, suprimento, sangria
- [ ] Saldo atual
- [ ] Extrato por período

### 4.4 Fluxo de Caixa

- [ ] Página de fluxo de caixa
- [ ] Entradas/saídas por período
- [ ] Gráfico de evolução

---

## Fase 5: Relatórios e Finalização (Semanas 13-15)

### 5.1 Relatórios

- [ ] Página: `src/app/(dashboard)/relatorios/page.tsx`
- [ ] Aniversariantes do mês
- [ ] Serviços efetuados por período
- [ ] OS por período
- [ ] Top produtos vendidos
- [ ] Desempenho de mecânicos

### 5.2 Reajuste de Preços

- [ ] Página de ajuste em bloco
- [ ] Reajuste por percentual
- [ ] Reajuste por valor fixo

### 5.3 PWA

- [ ] Configurar `next-pwa` no next.config.js
- [ ] Ícones e manifest
- [ ] Service Worker
- [ ] Offline support (opcional)

### 5.4 Configurações

- [ ] Upload de logotipo da oficina
- [ ] Dados da empresa
- [ ] Backup/restauração (opcional)

### 5.5 Deploy

- [ ] Conectar repositório à Vercel
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Deploy automático

---

## 🎨 Temas e Personalização

### Cores

| Uso | Cor |
|-----|-----|
| Primária | #2563eb (blue-600) |
| Secundária | #1e293b (slate-800) |
| Sucesso | #22c55e (green-500) |
| Alerta | #eab308 (yellow-500) |
| Erro | #ef4444 (red-500) |

### Fontes

- **Títulos**: Inter (Google Fonts)
- **Corpo**: System UI

---

## 🔧 Configuração Inicial

### Variáveis de Ambiente (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://itueopegwvlqyfznkuws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_LQn4cbK5aZkIjzhV3Nm4Cg_BWRVeJPo
```

### Supabase Client (src/lib/supabase/client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Next.js Config (next.config.js)

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['itueopegwvlqyfznkuws.supabase.co'],
  },
}

module.exports = withPWA(nextConfig)
```

---

## 💾 Modelo de Dados (SQL)

### Tabelas Principais

```sql
-- 1. CLIENTES
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(20) UNIQUE,
  rg_ie VARCHAR(20),
  data_nascimento DATE,
  email VARCHAR(255),
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  complemento TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  foto_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. FORNECEDORES
CREATE TABLE fornecedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(20) UNIQUE,
  inscricao_estadual VARCHAR(20),
  email VARCHAR(255),
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  complemento TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  contato_nome VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. MECÂNICOS
CREATE TABLE mecanicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(20) UNIQUE,
  data_contratacao DATE NOT NULL,
  especialidades TEXT[],
  email VARCHAR(255),
  telefone VARCHAR(20) NOT NULL,
  celular VARCHAR(20),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  salario DECIMAL(10,2),
  comissao_percentual DECIMAL(5,2),
  foto_url TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. VEÍCULOS
CREATE TABLE veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  placa VARCHAR(10) UNIQUE NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano_fabricacao INTEGER,
  ano_modelo INTEGER,
  cor VARCHAR(30),
  chassi VARCHAR(30),
  renavam VARCHAR(30),
  km_atual INTEGER,
  combustivel VARCHAR(20),
  foto_url TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. PRODUTOS
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  codigo_barras VARCHAR(100),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  unidade_medida VARCHAR(10),
  preco_custo DECIMAL(10,2) NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  margem_lucro DECIMAL(5,2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  localizacao TEXT,
  fornecedor_id UUID REFERENCES fornecedores(id),
  ncm VARCHAR(10),
  cest VARCHAR(10),
  origem INTEGER,
  foto_url TEXT[],
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. SERVIÇOS
CREATE TABLE servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  tempo_estimado INTEGER,
  preco_sugerido DECIMAL(10,2),
  comissao_percentual DECIMAL(5,2),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. ORDENS DE SERVIÇO
CREATE TABLE ordens_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os BIGSERIAL UNIQUE,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  veiculo_id UUID REFERENCES veiculos(id) NOT NULL,
  mecanico_id UUID REFERENCES mecanicos(id),
  data_abertura TIMESTAMP DEFAULT NOW(),
  data_previsao DATE,
  data_conclusao TIMESTAMP,
  status VARCHAR(30) DEFAULT 'aberta',
  km_veiculo INTEGER,
  nivel_combustivel VARCHAR(20),
  problemas_relatados TEXT,
  observacoes TEXT,
  valor_total DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) DEFAULT 0,
  forma_pagamento VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. ITENS DA OS
CREATE TABLE os_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo_item VARCHAR(20),
  item_id UUID,
  descricao TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  mecanico_id UUID REFERENCES mecanicos(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. VENDAS
CREATE TABLE vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_venda BIGSERIAL UNIQUE,
  cliente_id UUID REFERENCES clientes(id),
  vendedor_id UUID,
  data_venda TIMESTAMP DEFAULT NOW(),
  tipo_venda VARCHAR(20),
  os_id UUID REFERENCES ordens_servico(id),
  subtotal DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  status VARCHAR(30) DEFAULT 'concluida',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. ITENS DE VENDA
CREATE TABLE venda_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. CONTAS A PAGAR
CREATE TABLE contas_pagar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id UUID REFERENCES fornecedores(id),
  descricao TEXT NOT NULL,
  documento VARCHAR(50),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2),
  juros DECIMAL(10,2) DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pendente',
  categoria VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. CONTAS A RECEBER
CREATE TABLE contas_receber (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  venda_id UUID REFERENCES vendas(id),
  os_id UUID REFERENCES ordens_servico(id),
  descricao TEXT NOT NULL,
  documento VARCHAR(50),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  valor DECIMAL(10,2) NOT NULL,
  valor_recebido DECIMAL(10,2),
  juros DECIMAL(10,2) DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pendente',
  forma_recebimento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. CAIXA
CREATE TABLE caixa_movimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_movimento TIMESTAMP DEFAULT NOW(),
  tipo_movimento VARCHAR(20),
  categoria VARCHAR(100),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  venda_id UUID REFERENCES vendas(id),
  conta_pagar_id UUID REFERENCES contas_pagar(id),
  conta_receber_id UUID REFERENCES contas_receber(id),
  saldo_anterior DECIMAL(10,2),
  saldo_atual DECIMAL(10,2),
  usuario_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. AGENDAMENTOS
CREATE TABLE agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  veiculo_id UUID REFERENCES veiculos(id) NOT NULL,
  servico_id UUID REFERENCES servicos(id),
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  mecanico_id UUID REFERENCES mecanicos(id),
  status VARCHAR(30) DEFAULT 'agendado',
  observacoes TEXT,
  lembrete_enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 15. MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE estoque_movimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) NOT NULL,
  tipo_movimento VARCHAR(20),
  quantidade INTEGER NOT NULL,
  saldo_anterior INTEGER NOT NULL,
  saldo_atual INTEGER NOT NULL,
  documento VARCHAR(50),
  documento_id UUID,
  observacoes TEXT,
  usuario_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices

```sql
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_ordens_servico_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX idx_ordens_servico_veiculo_id ON ordens_servico(veiculo_id);
CREATE INDEX idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
```

### Triggers

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em cada tabela com updated_at
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 🔌 Exemplo de API Route

```typescript
// src/app/api/clientes/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  
  let query = supabase
    .from('clientes')
    .select('*', { count: 'exact' })
    
  if (search) {
    query = query.ilike('nome', `%${search}%`)
  }
  
  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('nome')
    
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('clientes')
    .insert([body])
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
```

---

## 🖼️ Upload de Imagens

```typescript
// src/lib/supabase/storage.ts
import { createClient } from './client'

export async function uploadImage(
  bucket: string,
  file: File,
  path: string
): Promise<string | null> {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${path}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .bucket(bucket)
    .upload(fileName, file)
    
  if (error) {
    console.error('Erro no upload:', error)
    return null
  }
  
  const { data: urlData } = supabase.storage
    .bucket(bucket)
    .getPublicUrl(fileName)
    
  return urlData.publicUrl
}
```

---

## 📊 Consultas Úteis

### Aniversariantes do Mês

```sql
SELECT 
  nome,
  EXTRACT(DAY FROM data_nascimento) as dia,
  TO_CHAR(data_nascimento, 'DD/MM') as data_formatada,
  telefone1,
  email
FROM clientes
WHERE 
  EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND data_nascimento IS NOT NULL
ORDER BY EXTRACT(DAY FROM data_nascimento);
```

---

## ✅ Checklist Resumido

- [ ] **Fase 1**: Projeto, Supabase, Auth, Layout, Componentes UI
- [ ] **Fase 2**: Banco de dados, Clientes, Fornecedores, Mecânicos, Veículos, Produtos, Serviços
- [ ] **Fase 3**: Ordens de Serviço, Vendas, Estoque, Agendamentos, Dashboard
- [ ] **Fase 4**: Contas a Pagar, Contas a Receber, Caixa, Fluxo de Caixa
- [ ] **Fase 5**: Relatórios, Reajuste preços, PWA, Deploy
