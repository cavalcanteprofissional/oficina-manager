# 📋 TODO - Melhorias de Legibilidade (Escopo Expandido)

## Problema
Textos muito claros (gray-500/600/700) em formulários, tabelas e modais em **todas** as páginas do dashboard. Os labels e informações secundárias não têm contraste suficiente.

## Plano
Substituir classes de texto claro em todos os arquivos:

| Classe original | Nova classe | Onde |
|----------------|-------------|------|
| `text-gray-700` | `text-gray-900` | Labels de formulário, cabeçalhos de tabela |
| `text-gray-600` | `text-gray-900` | Labels secundários, descrições |
| `text-gray-500` | `text-gray-800` | Informações secundárias, estados vazios |
| `text-gray-400` | Manter | Ícones decorativos e placeholders |

## Arquivos afetados (33 arquivos, ~155 ocorrências)

### Páginas Dashboard (todos concluídos)
- [x] vendas/page.tsx — gray-400(1), gray-500(3), gray-600(2), gray-700(5)
- [x] clientes/page.tsx — gray-400(1), gray-500(2), gray-700(6)
- [x] veiculos/page.tsx — gray-400(1), gray-700(7)
- [x] produtos/page.tsx — gray-400(1), gray-700(7)
- [x] servicos/page.tsx — gray-400(1), gray-700(8)
- [x] mecanicos/page.tsx — gray-400(1), gray-700(6)
- [x] fornecedores/page.tsx — gray-400(1), gray-700(5)
- [x] estoque/page.tsx — gray-400(1), gray-500(2), gray-600(4)
- [x] contas-pagar/page.tsx — gray-500(1), gray-600(1), gray-700(2)
- [x] contas-receber/page.tsx — gray-500(1), gray-600(1), gray-700(3)
- [x] agendamentos/page.tsx — gray-400(1), gray-500(4), gray-600(1), gray-700(7)
- [x] caixa/page.tsx — gray-600(3), gray-700(2)
- [x] relatorios/page.tsx — gray-500(5), gray-600(7)
- [x] usuarios/page.tsx — gray-400(1), gray-500(2), gray-700(8)
- [x] reajuste/page.tsx — gray-400(1), gray-700(4)
- [x] dashboard/page.tsx — gray-600(2)
- [x] ordens-servico/page.tsx — gray-600(2), gray-700(vários)

### Componentes (todos concluídos)
- [x] DataTable.tsx — gray-400(2), gray-500(2), gray-600(1), gray-700(2)
- [x] Button.tsx — gray-700(2) (mantido intencionalmente - variantes de botão)
- [x] BottomNavigation.tsx — gray-600(2), gray-700(1)
- [x] Sidebar.tsx — gray-700(1) (mantido intencionalmente - ícone menu)
- [x] AuthCheck.tsx — gray-600(1)

### Autenticação (todos concluídos)
- [x] login/page.tsx — gray-600(2), gray-700(2)
- [x] register/page.tsx — gray-600(2), gray-700(3)
