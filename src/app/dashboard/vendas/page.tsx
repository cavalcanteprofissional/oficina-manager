'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Trash2, X, Loader2, Search, Plus, Minus, ShoppingCart } from 'lucide-react'

interface Produto {
  id: string
  codigo: string
  nome: string
  preco_venda: number
  estoque_atual: number
}

interface Cliente {
  id: string
  nome: string
}

interface VendaItem {
  produto_id: string
  produto?: Produto
  quantidade: number
  valor_unitario: number
  desconto: number
  valor_total: number
}

interface Venda {
  id: string
  numero_venda: number
  data_venda: string
  total: number
  forma_pagamento: string | null
  clientes?: Cliente
}

export default function VendasPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [carrinho, setCarrinho] = useState<VendaItem[]>([])
  const [selectedCliente, setSelectedCliente] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [saving, setSaving] = useState(false)
  const [showVendas, setShowVendas] = useState(false)
  const supabase = createClient()

  const fetchProdutos = async () => {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .gt('estoque_atual', 0)
      .or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
      .order('nome')
    if (data) setProdutos(data)
  }

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    if (data) setClientes(data)
  }

  const fetchVendas = async () => {
    const { data } = await supabase
      .from('vendas')
      .select('*, clientes(nome)')
      .order('data_venda', { ascending: false })
      .limit(20)
    if (data) setVendas(data)
  }

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchProdutos(), fetchClientes(), fetchVendas()])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    fetchProdutos()
  }, [search])

  const adicionarAoCarrinho = (produto: Produto) => {
    const existente = carrinho.find(item => item.produto_id === produto.id)
    if (existente) {
      if (existente.quantidade < produto.estoque_atual) {
        setCarrinho(carrinho.map(item => 
          item.produto_id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1, valor_total: (item.quantidade + 1) * item.valor_unitario }
            : item
        ))
      }
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        produto,
        quantidade: 1,
        valor_unitario: produto.preco_venda,
        desconto: 0,
        valor_total: produto.preco_venda
      }])
    }
  }

  const atualizarQuantidade = (produtoId: string, novaQtd: number) => {
    if (novaQtd <= 0) {
      setCarrinho(carrinho.filter(item => item.produto_id !== produtoId))
    } else {
      const produto = produtos.find(p => p.id === produtoId)
      if (produto && novaQtd <= produto.estoque_atual) {
        setCarrinho(carrinho.map(item => 
          item.produto_id === produtoId 
            ? { ...item, quantidade: novaQtd, valor_total: novaQtd * item.valor_unitario - item.desconto }
            : item
        ))
      }
    }
  }

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId))
  }

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.valor_total, 0)

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return
    setSaving(true)

    const { error } = await supabase.from('vendas').insert([{
      cliente_id: selectedCliente || null,
      tipo_venda: 'balcao',
      subtotal: totalCarrinho,
      desconto: 0,
      total: totalCarrinho,
      forma_pagamento: formaPagamento || null,
      status: 'concluida',
    }])

    if (!error) {
      // Estoque é atualizado pela API
      setCarrinho([])
      setSelectedCliente('')
      setFormaPagamento('')
      fetchProdutos()
      fetchVendas()
    }
    setSaving(false)
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
        <Button variant="outline" onClick={() => setShowVendas(!showVendas)}>
          <ShoppingCart size={18} className="mr-2" />
          {showVendas ? 'Nova Venda' : 'Ver Vendas'}
        </Button>
      </div>

      {showVendas ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nº Venda</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nº</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Forma Pag.</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-900">#{v.numero_venda}</td>
                      <td className="py-3 px-4 text-gray-900">{new Date(v.data_venda).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 text-gray-900">{(v as any).clientes?.nome || '-'}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(v.total)}</td>
                      <td className="py-3 px-4 text-gray-900">{v.forma_pagamento || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {produtos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => adicionarAoCarrinho(p)}
                      className="p-4 border rounded-lg hover:border-primary hover:bg-blue-50 transition-colors text-left"
                    >
                      <p className="font-medium text-sm truncate">{p.nome}</p>
                      <p className="text-xs text-gray-500">{p.estoque_atual} em estoque</p>
                      <p className="text-primary font-bold mt-2">{formatCurrency(p.preco_venda)}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrinho */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Carrinho ({carrinho.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {carrinho.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
                ) : (
                  <div className="space-y-4">
                    {carrinho.map((item) => (
                      <div key={item.produto_id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.produto?.nome}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(item.valor_unitario)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center">{item.quantidade}</span>
                          <button
                            onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            disabled={item.quantidade >= (item.produto?.estoque_atual || 0)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-medium">{formatCurrency(item.valor_total)}</p>
                          <button
                            onClick={() => removerDoCarrinho(item.produto_id)}
                            className="text-red-500 text-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Cliente (opcional)</label>
                        <select
                          value={selectedCliente}
                          onChange={(e) => setSelectedCliente(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Consumidor final</option>
                          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Forma de Pagamento</label>
                        <select
                          value={formaPagamento}
                          onChange={(e) => setFormaPagamento(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Selecione</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Pix">Pix</option>
                          <option value="Débito">Cartão Débito</option>
                          <option value="Crédito">Cartão Crédito</option>
                        </select>
                      </div>
                      <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total:</span>
                        <span>{formatCurrency(totalCarrinho)}</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={finalizarVenda}
                        loading={saving}
                        disabled={!formaPagamento}
                      >
                        Finalizar Venda
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
