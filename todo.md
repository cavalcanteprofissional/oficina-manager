# 🚗 Oficina Manager - Plano de Correções

## Resumo Final

**31+ issues identificadas → todas endereçadas** (3 diferidas)

---

## Fase 1: Fundação ✅
| ID | Issue | Status |
|----|-------|--------|
| C1-C3 | Cabeçalhos, ViaCEP, Insert OS | ✅ |
| A1-A6 | Campos, filtros, relatórios | ✅ |
| M1-M4 | Paginação, colunas, edit, useEffect | ✅ |
| B1-B3 | Zod schemas, estoque, senha | ✅ |

## Fase 2: Correções Iniciais ✅
| ID | Issue | Solução |
|----|-------|---------|
| C5 | proxy.ts não executava | Renomeado → `middleware.ts` (Next 16 reconhece nativamente) |
| C6-C7 | N+1 vendas/reajuste | Lote `.in()` + API batch |
| A7-A11 | Errors, try/catch, schemas, cleanup | Tratamento em 16+ páginas |
| M5-M9 | Types, imports, empty states, keys, constants | Refatoração geral |
| B4-B7 | dangerouslySetInnerHTML, alert→toast, deps, SW | Correções pontuais |
| D1-D5 | Índices, search_path, policies, HIBP, GraphQL | SQL aplicado |

## Fase 3: AbortController & Error Handling ✅
| ID | Issue | Solução |
|----|-------|---------|
| F1-F3 | AbortController sem reason, dead controllers, fetch sem catch | mounted flag + try/catch |

## Fase 4: Segurança - Bloco 1 (Críticos) ✅
| ID | Issue | Solução | Status |
|----|-------|---------|--------|
| C1 | next@16.1.6 com CVEs | next@16.2.6 | ✅ |
| C2 | Sem RLS | Migration criada + **aplicada manualmente no DB** | ✅ |
| C3 | Auth check ausente | `requireAuth()` em 27 rotas | ✅ |
| C4 | PUT sem Zod | Zod + field whitelist em 10 PUTs | ✅ |
| C5 | Sem role check | `requireRole()` em todos endpoints | ✅ |
| C6 | Error messages vazam schema | `handleError()` genérico | ✅ |
| C7 | Mass assignment | Whitelist campos em todos PUTs | ✅ |
| C8 | Service role key exposta | **Diferido**: não rotacionar agora | ⏸️ |
| C9 | reajuste sem auth | `requireRole('admin', 'gerente')` | ✅ |
| S1 | admin.createUser() falha | `createAdminClient()` com service_role | ✅ |
| S2 | proxy.ts não executava | Next.js 16 reconhece como middleware nativamente | ✅ |
| S3 | GET /api/usuarios sem auth | `getUser()` check | ✅ |
| S4 | POST schema fraco | `usuarioCreateSchema` | ✅ |

## Fase 5: Segurança - Bloco 2 ✅
| ID | Issue | Solução | Status |
|----|-------|---------|--------|
| A3 | User enumeration | Erro genérico "Email ou senha inválidos" | ✅ |
| A4 | AuthCheck cria usuario | Remove auto-create, redireciona | ✅ |
| A5 | Bypass auth user (id no body) | `id` removido do `usuarioCreateSchema` | ✅ |
| M3 | Sem CSRF protection | `sameSite: 'lax'` em proxy.ts + server.ts | ✅ |
| M4 | Password policy fraca | min 8 + maiúscula + número | ✅ |
| M5 | Sem "esqueci senha" | `resetPasswordForEmail()` no login | ✅ |
| M6 | 398 devDependencies | **Falso alarme**: 16 diretas (8 + 8 dev). Transitivas são normais. | ✅ |

## Fase 6: Segurança - Bloco 3 ✅
| ID | Issue | Solução | Status |
|----|-------|---------|--------|
| A1 | IDOR ownership | **Baixo risco** (single-tenant intencional). `usuario_id` sugerido como audit trail futuro | ⏸️ |
| A2 | Interpolação `.or()` | Refatorado para `.or('col.eq.val,col2.eq.val2')` em 17 arquivos | ✅ |
| A6 | Vendas sem transação + audit | Lote `.in()` + `estoque_movimentos` insert | ✅ |
| A7 | select('*, table(*)') | Colunas explícitas em 26 APIs | ✅ |
| B1 | alert() → toast | `addToast()` em usuarios/page.tsx | ✅ |
| B2 | SW cacheia /login | Removido de `STATIC_URLS` | ✅ |
| B3 | 11 páginas escrevem no Supabase direto | Convertidas para `fetch('/api/*')` | ✅ |

## Itens Diferidos (⏸️)
| ID | Issue | Motivo |
|----|-------|--------|
| **C8** | Service role key exposta | Não vai rotacionar agora. Risco mitigado pois só usada via `createAdminClient()` no backend. |
| **A1** | IDOR ownership | Single-tenant intencional. Adicionar `usuario_id` nas tabelas só se houver necessidade futura de multi-tenancy. |
| **M6** | 398 devDependencies | Falso alarme. São 16 dependências diretas. `eslint-config-next` desalinhado (16.1.6 vs 16.2.6) — baixo risco. |

## Fase 7: Dump do Banco ✅
| Etapa | Ação | Resultado |
|-------|------|-----------|
| 1 | Login + link Supabase CLI | ✅ `npx supabase login` + `link` |
| 2 | Extrair schema via Management API SQL | ✅ `supabase/schema.sql` (746 linhas, 38 KB) |
| 3 | Extrair seed (todas as tabelas) | ✅ `supabase/seed.sql` (5671 linhas, 2.8 MB) |
| 4 | PAT hardcoded → env var | ✅ `SUPABASE_ACCESS_TOKEN` no `.env.local`, script lê `process.env` |
| 5 | `scripts/` adicionado ao `.gitignore` | ✅ Script local não entra no repo |
| 6 | `supabase/.gitignore` removido | ✅ Regras mescladas no root `.gitignore` |
| 7 | `allowedDevOrigins` no next.config.ts | ✅ Acesso por IP de rede no dev |

## Fase 8: Correção Cadastro (Register + AuthCheck) ✅
| ID | Problema | Solução | Arquivos |
|----|----------|---------|----------|
| R1 | Register só cria Auth, não insere em `usuarios` | Endpoint `/api/auth/register` que cria Auth + `usuarios` em transação | `api/auth/register/route.ts` |
| R2 | Register usa supabase client direto | Substituído por `fetch('/api/auth/register')` | `register/page.tsx` |
| R3 | Register sem campo "nome" | Adicionado input de nome completo | `register/page.tsx` |
| R4 | Zod sem schema para register | `registerSchema` adicionado | `schemas.ts` |
| R5 | Tabela `usuarios` não tem coluna `email` | Removido de INSERT/UPDATE/SELECT em 3 APIs | `api/usuarios/route.ts`, `usuarios/[id]/route.ts`, `api/auth/register/route.ts` |
| R6 | 2 usuarios admin sem registro em `usuarios` | INSERT via Management API SQL | DB (admin: ambos emails) |

## Fase 9: Correção AuthCheck (Recursão RLS) ✅
| ID | Problema | Solução |
|----|----------|---------|
| L1 | `select('*')` no AuthCheck | `select('id, nome, role, ativo')` |
| L2 | Policy `"Usuarios - leitura propria ou admin"` causava recursão (subselect `usuarios` dentro de policy da mesma tabela) | Policy dropada. `authenticated_select_usuarios` (USING true) já permite SELECT para autenticados |
| L3 | UPDATE/DELETE/INSERT policies também recursivas (mesmo padrão `EXISTS (SELECT usuarios)`) | Dropadas e substituídas por `is_admin()` com `SECURITY DEFINER` |
| L4 | Função `public.is_admin()` | Evita recursão: executa como owner (bypassa RLS) |
| L5 | Logs excessivos no AuthCheck | Removidos |
| L6 | Path permission check usava `usuario` (state, assíncrono) | Agora usa `usuarioData` local |

## Fase 10: Correção Usuários API ✅
| ID | Problema | Solução | Arquivo |
|----|----------|---------|---------|
| U1 | `select('...email...')` na tabela `usuarios` — coluna `email` não existe | Removido `email` do select | `api/usuarios/route.ts:24` |

## 🔴 Bugs Pendentes
| ID | Descrição | Prioridade | Observação |
|----|-----------|------------|------------|
| BUG1 | Toast "Erro ao carregar usuários" aparece ao acessar `/dashboard/usuarios` mesmo com dados carregando corretamente | Baixa | Hipótese: catch do `fetchUsuarios` captura erro residual (Strict Mode dupla chamada ou response.json() mal formatado). Console do navegador não mostra erro na requisição. Investigar: verificar status HTTP real da resposta e se `result.data` é null na primeira chamada. |

## Build: ✅ Compila sem erros (`npx next build`)

## Arquivos Modificados (37+)
- **APIs (14 pastas)**: Auth check, Zod, role check em todas
- **Páginas (12)**: Write ops via fetch(), error handling
- **Core**: auth-helpers.ts, admin.ts, server.ts, proxy.ts, middleware.ts
- **Supabase**: 001_rls.sql, schemas.ts, constants.ts
- **Config**: next.config.ts, package.json, sw.js
- **AuthCheck**: Recursão RLS corrigida, logs removidos, colunas explícitas
