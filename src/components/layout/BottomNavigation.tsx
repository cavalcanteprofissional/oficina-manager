'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Car, 
  Wrench, 
  ShoppingCart,
  Menu
} from 'lucide-react'
import { useState } from 'react'

import { LucideIcon } from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  action?: 'menu'
}

const menuItems: MenuItem[] = [
  { name: 'Início', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Veículos', href: '/dashboard/veiculos', icon: Car },
  { name: 'Mecânicos', href: '/dashboard/mecanicos', icon: Wrench },
  { name: 'Produtos', href: '/dashboard/produtos', icon: ShoppingCart },
]

const bottomNavItems: MenuItem[] = [
  { name: 'Mais', href: '#', icon: Menu, action: 'menu' },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  const allItems = [...menuItems, ...bottomNavItems]

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <ul className="flex justify-around py-2">
          {allItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
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
              {[
                { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: Users },
                { name: 'Serviços', href: '/dashboard/servicos', icon: Wrench },
                { name: 'OS', href: '/dashboard/ordens-servico', icon: ShoppingCart },
                { name: 'Vendas', href: '/dashboard/vendas', icon: ShoppingCart },
                { name: 'Estoque', href: '/dashboard/estoque', icon: ShoppingCart },
                { name: 'Agenda', href: '/dashboard/agendamentos', icon: Home },
                { name: 'Caixa', href: '/dashboard/caixa', icon: Home },
                { name: 'Contas', href: '/dashboard/contas-pagar', icon: Home },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
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
