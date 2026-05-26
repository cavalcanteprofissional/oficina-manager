# 🚗 Oficina Manager - Correção de Erros de Exibição

## 🔴 CRÍTICOS ✅

### C1. Cabeçalhos duplicados em tabelas ✅
- **Arquivos**: `mecanicos/page.tsx`, `servicos/page.tsx`, `vendas/page.tsx`
- **Correção**: Removidas linhas de `<th>` duplicadas.

### C2. CEP: `localizacao` → `localidade` ✅
- **Arquivos**: `lib/utils/cep.ts:6`, `clientes/page.tsx:67`, `fornecedores/page.tsx:49`

### C3. Campo `itens` em `ordens_servico` ✅
- **Arquivo**: `ordens-servico/page.tsx:179`

## 🟡 ALTOS ✅

### A1-A6 - Todas corrigidas ✅

## 🔵 MÉDIOS

### M1. Paginação sem controles UI ⏳
- **Arquivo**: `clientes/page.tsx:83`
- **Correção**: Adicionar navegação de páginas.

### M2. Colunas faltando em tabela de fornecedores ⏳
- **Arquivo**: `fornecedores/page.tsx:146-157`
- **Correção**: Adicionar `email`, `nome_fantasia`, `contato_nome`.

### M3. Sem botão "Editar" em contas-pagar/receber ⏳
- **Arquivo**: `contas-pagar/page.tsx:186-191`, `contas-receber/page.tsx:64-85`

### M4. `[supabase]` no useEffect ✅

## ⚪ BAIXOS

### B1. Zod schemas não aplicados nas APIs ⏳
### B2. `ajuste` tratado como saída no estoque ⏳
### B3. Sem campo de senha em usuários ⏳

## Status

- [x] C1-C3, A1-A6, M4
- [ ] M1 - Paginação UI
- [ ] M2 - Colunas fornecedores
- [ ] M3 - Botão editar contas
- [ ] B1 - Zod schemas
- [ ] B2 - ajuste estoque
- [ ] B3 - Senha usuários
