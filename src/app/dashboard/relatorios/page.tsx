'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, Users, Wrench, ShoppingCart, TrendingUp, Calendar, Car } from 'lucide-react'

interface Aniversariante {
  nome: string
  data_nascimento: string
  telefone1: string
}

interface RelatorioData {
  clientes: number
  veiculos: number
  mecanicos: number
  produtos: number
  osAbertas: number
  osConcluidas: number
  vendasMes: number
  receitaMes: number
  topProdutos: { nome: string; qtd: number }[]
  topServicos: { nome: string; qtd: number }[]
  aniversariantes: Aniversariante[]
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatorio, setRelatorio] = useState<RelatorioData>({
    clientes: 0,
    veiculos: 0,
    mecanicos: 0,
    produtos: 0,
    osAbertas: 0,
    osConcluidas: 0,
    vendasMes: 0,
    receitaMes: 0,
    topProdutos: [],
    topServicos: [],
    aniversariantes: [],
  })
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    fetchRelatorios()
    return () => {
      mounted = false
    }
  }, [])

  const fetchRelatorios = async () => {
    setLoading(true)
    setError(null)
    try {
      const hoje = new Date()
      const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

      const results = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('veiculos').select('*', { count: 'exact', head: true }),
        supabase.from('mecanicos').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).eq('status', 'aberta'),
        supabase.from('ordens_servico').select('*', { count: 'exact', head: true }).eq('status', 'concluida'),
        supabase.from('vendas').select('*').gte('data_venda', primeiroDia).lte('data_venda', ultimoDia),
        supabase.from('clientes').select('nome, data_nascimento, telefone1').not('data_nascimento', 'is', null),
        supabase.from('os_itens').select('*'),
        supabase.from('venda_itens').select('*, produtos(nome)'),
      ])

      for (const result of results) {
        if (result.error) { setError(result.error.message); setLoading(false); return }
      }

      const clientes = results[0].count
      const veiculos = results[1].count
      const mecanicos = results[2].count
      const produtos = results[3].count
      const osAbertas = results[4].count
      const osConcluidas = results[5].count
      const vendas = results[6].data
      const aniversariantes = results[7].data
      const osItens = results[8].data
      const vendaItens = results[9].data

      const receitaMes = vendas?.reduce((acc: number, v: { total: number }) => acc + (v.total || 0), 0) || 0

    // Aniversariantes do mês
    const mesAtual = hoje.getMonth() + 1
    const aniversariantesMes = aniversariantes?.filter((c: Aniversariante) => {
      if (!c.data_nascimento) return false
      const mes = new Date(c.data_nascimento).getMonth() + 1
      return mes === mesAtual
    }) || []

    // Top produtos vendidos (OS + Vendas)
    const produtosCount: Record<string, { nome: string; qtd: number }> = {}
    osItens?.filter((i: { tipo_item: string; item_id: string; descricao: string; quantidade: number; valor_unitario: number }) => i.tipo_item === 'produto').forEach((item: { quantidade: number; valor_unitario: number; descricao: string }) => {
      if (produtosCount[item.descricao]) {
        produtosCount[item.descricao].qtd += item.quantidade
      } else {
        produtosCount[item.descricao] = { nome: item.descricao, qtd: item.quantidade }
      }
    })
    vendaItens?.forEach((item: { quantidade: number; valor_unitario: number; produtos?: { nome: string } }) => {
      const nome = item.produtos?.nome || 'Produto'
      if (produtosCount[nome]) {
        produtosCount[nome].qtd += item.quantidade
      } else {
        produtosCount[nome] = { nome, qtd: item.quantidade }
      }
    })
    const topProdutos = Object.values(produtosCount).sort((a: { nome: string; qtd: number }, b: { nome: string; qtd: number }) => b.qtd - a.qtd).slice(0, 5)

    // Top serviços
    const servicosCount: Record<string, { nome: string; qtd: number }> = {}
    osItens?.filter((i: { tipo_item: string; item_id: string; descricao: string; quantidade: number; valor_unitario: number }) => i.tipo_item === 'servico').forEach((item: { quantidade: number; descricao: string }) => {
      if (servicosCount[item.descricao]) {
        servicosCount[item.descricao].qtd += item.quantidade
      } else {
        servicosCount[item.descricao] = { nome: item.descricao, qtd: item.quantidade }
      }
    })
    const topServicos = Object.values(servicosCount).sort((a: { nome: string; qtd: number }, b: { nome: string; qtd: number }) => b.qtd - a.qtd).slice(0, 5)

    setRelatorio({
      clientes: clientes || 0,
      veiculos: veiculos || 0,
      mecanicos: mecanicos || 0,
      produtos: produtos || 0,
      osAbertas: osAbertas || 0,
      osConcluidas: osConcluidas || 0,
      vendasMes: vendas?.length || 0,
      receitaMes,
      topProdutos,
      topServicos,
      aniversariantes: aniversariantesMes,
    })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios')
    }
    setLoading(false)
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Relatórios</h1>

      {/* Resumo Geral */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg"><Users className="text-blue-600" size={20} /></div>
              <div>
                <p className="text-sm text-gray-900">Clientes</p>
                <p className="text-xl font-bold">{relatorio.clientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-lg"><Car className="text-cyan-600" size={20} /></div>
              <div>
                <p className="text-sm text-gray-900">Veículos</p>
                <p className="text-xl font-bold">{relatorio.veiculos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg"><ShoppingCart className="text-green-600" size={20} /></div>
              <div>
                <p className="text-sm text-gray-900">Produtos</p>
                <p className="text-xl font-bold">{relatorio.produtos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg"><Wrench className="text-purple-600" size={20} /></div>
              <div>
                <p className="text-sm text-gray-900">Mecânicos</p>
                <p className="text-xl font-bold">{relatorio.mecanicos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg"><TrendingUp className="text-orange-600" size={20} /></div>
              <div>
                <p className="text-sm text-gray-900">Receita Mês</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(relatorio.receitaMes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aniversariantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} /> Aniversariantes do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatorio.aniversariantes.length === 0 ? (
              <p className="text-gray-700 text-center py-4">Nenhum aniversariante este mês</p>
            ) : (
              <div className="space-y-3">
                {relatorio.aniversariantes.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-sm text-gray-700">{c.telefone1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700">
                        {new Date(c.data_nascimento).getDate()}/
                        {new Date(c.data_nascimento).getMonth() + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {relatorio.topProdutos.length === 0 ? (
              <p className="text-gray-700 text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-3">
                {relatorio.topProdutos.map((p: { nome: string; qtd: number }, idx: number) => (
                  <div key={p.nome} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span>{p.nome}</span>
                    </div>
                    <span className="font-medium">{p.qtd} un</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>Top Serviços Mais Executados</CardTitle>
          </CardHeader>
          <CardContent>
            {relatorio.topServicos.length === 0 ? (
              <p className="text-gray-700 text-center py-4">Nenhum serviço registrado</p>
            ) : (
              <div className="space-y-3">
                {relatorio.topServicos.map((s: { nome: string; qtd: number }, idx: number) => (
                  <div key={s.nome} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span>{s.nome}</span>
                    </div>
                    <span className="font-medium">{s.qtd}x</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo OS */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{relatorio.osAbertas}</p>
                <p className="text-sm text-gray-900">Abertas</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{relatorio.osConcluidas}</p>
                <p className="text-sm text-gray-900">Concluídas</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg">
                <span className="text-gray-900">Vendas este mês: </span>
                <span className="font-bold">{relatorio.vendasMes}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
