'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Users, 
  Car, 
  Wrench, 
  ShoppingCart,
  ClipboardList,
  Wallet,
  Calendar
} from 'lucide-react'

interface Stats {
  clientes: number
  veiculos: number
  mecanicos: number
  produtos: number
  osAbertas: number
  vendasHoje: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    clientes: 0,
    veiculos: 0,
    mecanicos: 0,
    produtos: 0,
    osAbertas: 0,
    vendasHoje: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: clientes },
        { count: veiculos },
        { count: mecanicos },
        { count: produtos },
        { count: osAbertas },
        { data: vendas }
      ] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('veiculos').select('*', { count: 'exact', head: true }),
        supabase.from('mecanicos').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).neq('status', 'concluida').neq('status', 'cancelada'),
        supabase.from('vendas').select('total').gte('data_venda', today)
      ])

      const vendasHoje = vendas?.reduce((acc, v) => acc + (v.total || 0), 0) || 0

      setStats({
        clientes: clientes || 0,
        veiculos: veiculos || 0,
        mecanicos: mecanicos || 0,
        produtos: produtos || 0,
        osAbertas: osAbertas || 0,
        vendasHoje
      })
      setLoading(false)
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    { name: 'Clientes', value: stats.clientes, icon: Users, color: 'bg-blue-500' },
    { name: 'Veículos', value: stats.veiculos, icon: Car, color: 'bg-green-500' },
    { name: 'Mecânicos', value: stats.mecanicos, icon: Wrench, color: 'bg-purple-500' },
    { name: 'Produtos', value: stats.produtos, icon: ShoppingCart, color: 'bg-orange-500' },
    { name: 'OS Abertas', value: stats.osAbertas, icon: ClipboardList, color: 'bg-yellow-500' },
    { name: 'Vendas Hoje', value: `R$ ${stats.vendasHoje.toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{card.name}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bem-vindo ao Oficina Manager</h2>
        <p className="text-gray-600">
          Sistema de gestão completo para sua oficina mecânica. 
          Utilize o menu lateral para navegar entre os módulos.
        </p>
      </div>
    </div>
  )
}
