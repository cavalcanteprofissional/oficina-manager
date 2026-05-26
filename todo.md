# TODO - Migração middleware.ts → proxy.ts (Next.js 16)

## Objetivo
Migrar o arquivo `middleware.ts` (deprecado no Next.js 16) para a nova convenção `proxy.ts`.

## Alterações

### 1. Renomear arquivo
- `src/middleware.ts` → `src/proxy.ts`

### 2. Renomear função exportada
- `export async function middleware(...)` → `export async function proxy(...)`

### 3. Verificar build
- Rodar `npm run build` para garantir que não há erros
- Verificar se o warning `middleware-to-proxy` sumiu

## Detalhes técnicos

| Item | Antes | Depois |
|------|-------|--------|
| Arquivo | `src/middleware.ts` | `src/proxy.ts` |
| Função | `middleware()` | `proxy()` |
| Runtime | Edge (padrão) | Node.js (padrão no Next.js 16) |
| API | NextRequest/NextResponse | idêntica |
| Config matcher | Mesmo | mesmo |

## Status
- [x] Planejamento concluído
- [x] Renomear arquivo
- [x] Renomear função
- [x] Verificar build
