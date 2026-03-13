'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Wrench, 
  Users, 
  Car, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  TrendingUp,
  Box,
  Wallet,
  CreditCard,
  Receipt,
  Calendar,
  BarChart3,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Role, PERMISSOES_POR_ROLE } from '@/lib/utils/usuario'

interface MenuItem {
  name: string
  href: string
  icon: any
  key: string
}

const allMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: TrendingUp, key: 'dashboard' },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users, key: 'clientes' },
  { name: 'Veículos', href: '/dashboard/veiculos', icon: Car, key: 'veiculos' },
  { name: 'Mecânicos', href: '/dashboard/mecanicos', icon: Wrench, key: 'mecanicos' },
  { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: Package, key: 'fornecedores' },
  { name: 'Produtos', href: '/dashboard/produtos', icon: ShoppingCart, key: 'produtos' },
  { name: 'Serviços', href: '/dashboard/servicos', icon: ClipboardList, key: 'servicos' },
  { name: 'Ordens de Serviço', href: '/dashboard/ordens-servico', icon: ClipboardList, key: 'ordens-servico' },
  { name: 'Vendas', href: '/dashboard/vendas', icon: ShoppingCart, key: 'vendas' },
  { name: 'Estoque', href: '/dashboard/estoque', icon: Box, key: 'estoque' },
  { name: 'Agenda', href: '/dashboard/agendamentos', icon: Calendar, key: 'agendamentos' },
  { name: 'Caixa', href: '/dashboard/caixa', icon: Wallet, key: 'caixa' },
  { name: 'Contas a Pagar', href: '/dashboard/contas-pagar', icon: CreditCard, key: 'contas-pagar' },
  { name: 'Contas a Receber', href: '/dashboard/contas-receber', icon: Receipt, key: 'contas-receber' },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3, key: 'relatorios' },
  { name: 'Usuários', href: '/dashboard/usuarios', icon: Users, key: 'usuarios' },
  { name: 'Reajuste', href: '/dashboard/reajuste', icon: TrendingUp, key: 'reajuste' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<Role>('comum')
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setRole(data.role as Role)
        }
      }
    }
    fetchUserRole()
  }, [supabase])

  const permissoes = PERMISSOES_POR_ROLE[role]
  const menuItems = allMenuItems.filter(item => permissoes.includes(item.key))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Abrir menu"
      >
        {isOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-white shadow-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700 bg-slate-900">
            <h1 className="text-lg font-bold text-white">Oficina Manager</h1>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white font-medium shadow-md'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-slate-700 bg-slate-900">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
