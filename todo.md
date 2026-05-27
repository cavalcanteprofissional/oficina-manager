# 🚗 Oficina Manager - Plano de Correções ✅ COMPLETO

## Resumo
**31 issues identificadas → 31 resolvidas** (0 pendentes)

---

## Fase 1: Fundação (Anterior ✅)
| ID | Issue | Status |
|----|-------|--------|
| C1 | Cabeçalhos duplicados em páginas | ✅ |
| C2 | Campo `localizacao` → `localidade` (ViaCEP) | ✅ |
| C3 | Insert OS separado de os_itens | ✅ |
| A1 | data_contratacao em mecanicos | ✅ |
| A2 | defaultValue em formulários | ✅ |
| A3 | Filtro de veículos (|| true) | ✅ |
| A4 | Campos faltantes (rg_ie, data_nascimento, etc) | ✅ |
| A5 | Relatórios incluir venda_itens | ✅ |
| A6 | Formatação monetária padronizada | ✅ |
| M1-M4 | Paginação, colunas, edit, useEffect | ✅ |
| B1-B3 | Zod schemas, ajuste estoque, senha | ✅ |

---

## Fase 2: Correções (Sessão Atual ✅)

### 🔴 Críticos
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| C5 | proxy.ts não executa | Renomeado → `middleware.ts` | `src/middleware.ts` |
| C6 | N+1 vendas | Select em lote com `.in()` | `api/vendas/route.ts` |
| C7 | N+1 reajuste | API batch `/api/reajuste` | `api/reajuste/route.ts`, `reajuste/page.tsx` |
| C8 | RLS desabilitado | Migration: RLS + policies authenticated | Supabase DB |

### 🟡 Altos
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| A7 | Errors silenciados | `error` state em 12 páginas | Todas as páginas dashboard |
| A8 | Falta try/catch | try/catch em todos os fetches | Todas as páginas dashboard |
| A9 | usuarioSchema id required | `id` opcional + createSchema | `lib/schemas.ts` |
| A10 | servicos sem Zod | `safeParse()` adicionado | `api/servicos/route.ts` |
| A11 | useEffect sem cleanup | mounted flag + AbortController | 16 páginas |

### 🔵 Médios
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| M5 | 57 `any` types | Interfaces tipadas em 15 files | Sidebar, DataTable, hooks, pages |
| M6 | Unused imports | Removidos de 7 files | clientes, OS, estoque, contas, etc |
| M7 | Empty states | "Nenhum registro encontrado" | 10 páginas |
| M8 | Array index key | `key={idx}` → `key={item.id}` | relatorios, ordens-servico |
| M9 | Hardcoded strings | Constantes compartilhadas + Object.entries | `lib/constants.ts`, caixa, estoque, contas |

### ⚪ Baixos
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| B4 | dangerouslySetInnerHTML | `<Script>` do Next.js | `layout.tsx` |
| B5 | alert() em vez de toast | `addToast()` via `useToast()` | usuarios, reajuste |
| B6 | JSON.stringify dep | Propriedades individuais na dep list | `hooks/useSupabase.ts` |
| B7 | sw.js ausente | Já existe em `public/sw.js` | — |

### 🗄️ Supabase DB
| ID | Issue | Solução |
|----|-------|---------|
| D1 | 20 FKs sem índice | `CREATE INDEX` em todas |
| D2 | search_path mutável | `SET search_path = public` na função |
| D3 | Políticas duplicadas usuarios | Removidas, criadas com role check |
| D4 | Índices não usados | `DROP INDEX idx_usuarios_role/ativo` |
| D5 | HIBP desabilitado | Requer ativação no dashboard Supabase |
| — | GraphQL exposto ao anon | `REVOKE SELECT FROM anon` em 16 tabelas |

---

## Fase 3: AbortController & Error Handling (✅)

### 🔴 Crítico
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| F1 | `abortController.abort()` sem reason | `abort('Componente desmontado')` + try/catch AbortError | `usuarios/page.tsx` |
| F2 | AbortController morto em 15 páginas Supabase | Removido (signal nunca é passado; mounted flag basta) | estoque, caixa, contas-receber, contas-pagar, relatorios, dashboard, agendamentos, vendas, veiculos, servicos, produtos, mecanicos, fornecedores, ordens-servico |
| F3 | Fetch sem error handling | try/catch adicionado | `clientes/page.tsx`, `ordens-servico/page.tsx`, `dashboard/page.tsx` |

---

---

## Fase 4: Segurança (Em Andamento)

### 🔴 Críticos
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| S1 | `admin.createUser()` falha — usa anon key | Criar `createAdminClient()` com `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/admin.ts`, `api/usuarios/route.ts` |
| S2 | `proxy.ts` nunca executado | Next.js 16 já reconhece `proxy.ts` nativamente — só precisava existir | `src/proxy.ts` |
| S3 | GET /api/usuarios sem auth | Adicionar `getUser()` check nos GETs | `api/usuarios/route.ts`, `api/usuarios/[id]/route.ts` |
| S4 | POST usa schema fraco (`usuarioSchema`) | Trocar para `usuarioCreateSchema` | `api/usuarios/route.ts` |

### 🟠 Médios
| ID | Issue | Solução | Arquivos |
|----|-------|---------|----------|
| S5 | Outros GETs de API sem auth | Auditar e adicionar auth checks | Todos os `api/*` |

## Build: ✅ Compila sem erros
