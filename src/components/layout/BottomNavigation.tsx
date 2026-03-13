'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Car, 
  Wrench, 
  ShoppingCart,
  Menu,
  Package,
  ClipboardList,
  Calendar,
  Wallet,
  CreditCard,
  Receipt,
  BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Role, PERMISSOES_POR_ROLE } from '@/lib/utils/usuario'

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  key: string
  action?: 'menu'
}

const allMenuItems: MenuItem[] = [
  { name: 'Início', href: '/dashboard', icon: Home, key: 'dashboard' },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users, key: 'clientes' },
  { name: 'Veículos', href: '/dashboard/veiculos', icon: Car, key: 'veiculos' },
  { name: 'Mecânicos', href: '/dashboard/mecanicos', icon: Wrench, key: 'mecanicos' },
  { name: 'Produtos', href: '/dashboard/produtos', icon: ShoppingCart, key: 'produtos' },
]

const allExpandedItems: MenuItem[] = [
  { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: Package, key: 'fornecedores' },
  { name: 'Serviços', href: '/dashboard/servicos', icon: ClipboardList, key: 'servicos' },
  { name: 'OS', href: '/dashboard/ordens-servico', icon: ClipboardList, key: 'ordens-servico' },
  { name: 'Vendas', href: '/dashboard/vendas', icon: ShoppingCart, key: 'vendas' },
  { name: 'Estoque', href: '/dashboard/estoque', icon: ShoppingCart, key: 'estoque' },
  { name: 'Agenda', href: '/dashboard/agendamentos', icon: Calendar, key: 'agendamentos' },
  { name: 'Caixa', href: '/dashboard/caixa', icon: Wallet, key: 'caixa' },
  { name: 'Contas', href: '/dashboard/contas-pagar', icon: CreditCard, key: 'contas-pagar' },
  { name: 'Receber', href: '/dashboard/contas-receber', icon: Receipt, key: 'contas-receber' },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3, key: 'relatorios' },
  { name: 'Usuários', href: '/dashboard/usuarios', icon: Users, key: 'usuarios' },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [role, setRole] = useState<Role>('comum')
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
  const expandedItems = allExpandedItems.filter(item => permissoes.includes(item.key))

  const bottomNavItems = [
    { name: 'Mais', href: '#', icon: Menu, action: 'menu' as const },
  ]

  const allItems = [...menuItems, ...bottomNavItems]

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <ul className="flex justify-around py-2">
          {allItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
            
            if (item.action === 'menu') {
              return (
                <li key={item.name}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex flex-col items-center px-4 py-1 text-gray-600"
                  >
                    <Icon size={24} />
                    <span className="text-xs mt-1">{item.name}</span>
                  </button>
                </li>
              )
            }
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center px-4 py-1 ${
                    isActive ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {showMenu && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setShowMenu(false)}>
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-lg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-4">
              {expandedItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={`flex flex-col items-center p-2 rounded ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-xs mt-1 text-center">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
