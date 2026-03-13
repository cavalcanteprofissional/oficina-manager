export type Role = 'admin' | 'gerente' | 'mecanico' | 'caixa' | 'comum'

export interface Usuario {
  id: string
  nome: string
  cpf?: string
  telefone?: string
  role: Role
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Aba {
  key: string
  label: string
  href: string
  icon: string
}

export const ABAS: Aba[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'TrendingUp' },
  { key: 'clientes', label: 'Clientes', href: '/dashboard/clientes', icon: 'Users' },
  { key: 'veiculos', label: 'Veículos', href: '/dashboard/veiculos', icon: 'Car' },
  { key: 'mecanicos', label: 'Mecânicos', href: '/dashboard/mecanicos', icon: 'Wrench' },
  { key: 'fornecedores', label: 'Fornecedores', href: '/dashboard/fornecedores', icon: 'Package' },
  { key: 'produtos', label: 'Produtos', href: '/dashboard/produtos', icon: 'ShoppingCart' },
  { key: 'servicos', label: 'Serviços', href: '/dashboard/servicos', icon: 'ClipboardList' },
  { key: 'ordens-servico', label: 'Ordens de Serviço', href: '/dashboard/ordens-servico', icon: 'ClipboardList' },
  { key: 'vendas', label: 'Vendas', href: '/dashboard/vendas', icon: 'ShoppingCart' },
  { key: 'estoque', label: 'Estoque', href: '/dashboard/estoque', icon: 'Box' },
  { key: 'agendamentos', label: 'Agendamentos', href: '/dashboard/agendamentos', icon: 'Calendar' },
  { key: 'caixa', label: 'Caixa', href: '/dashboard/caixa', icon: 'Wallet' },
  { key: 'contas-pagar', label: 'Contas a Pagar', href: '/dashboard/contas-pagar', icon: 'CreditCard' },
  { key: 'contas-receber', label: 'Contas a Receber', href: '/dashboard/contas-receber', icon: 'Receipt' },
  { key: 'relatorios', label: 'Relatórios', href: '/dashboard/relatorios', icon: 'BarChart3' },
  { key: 'usuarios', label: 'Usuários', href: '/dashboard/usuarios', icon: 'Users' },
  { key: 'reajuste', label: 'Reajuste de Preços', href: '/dashboard/reajuste', icon: 'TrendingUp' },
]

export const PERMISSOES_POR_ROLE: Record<Role, string[]> = {
  admin: ABAS.map(aba => aba.key),
  
  gerente: [
    'dashboard',
    'clientes',
    'veiculos',
    'ordens-servico',
    'vendas',
    'estoque',
    'relatorios',
    'reajuste',
  ],
  
  mecanico: [
    'dashboard',
    'ordens-servico',
    'veiculos',
    'agendamentos',
  ],
  
  caixa: [
    'dashboard',
    'vendas',
    'caixa',
    'contas-receber',
  ],
  
  comum: [
    'dashboard',
  ],
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  mecanico: 'Mecânico',
  caixa: 'Caixa',
  comum: 'Comum',
}

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-800',
  gerente: 'bg-blue-100 text-blue-800',
  mecanico: 'bg-green-100 text-green-800',
  caixa: 'bg-yellow-100 text-yellow-800',
  comum: 'bg-gray-100 text-gray-800',
}

export function podeAcessar(role: Role, abaKey: string): boolean {
  const permissoes = PERMISSOES_POR_ROLE[role]
  return permissoes.includes(abaKey)
}

export function getAbasPermitidas(role: Role): Aba[] {
  const permissoes = PERMISSOES_POR_ROLE[role]
  return ABAS.filter(aba => permissoes.includes(aba.key))
}

export function getRoleFromPath(pathname: string): Role | null {
  const aba = ABAS.find(a => pathname.startsWith(a.href))
  if (!aba) return null
  return aba.key as Role
}

export function isAdmin(role: Role): boolean {
  return role === 'admin'
}

export function isRoleValida(role: string): role is Role {
  return ['admin', 'gerente', 'mecanico', 'caixa', 'comum'].includes(role)
}
