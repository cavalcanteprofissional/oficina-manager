'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Loader2, RefreshCw, Search } from 'lucide-react'

interface Produto {
  id: string
  codigo: string
  nome: string
  preco_custo: number
  preco_venda: number
  margem_lucro: number
}

export default function ReajustePrecosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [tipoReajuste, setTipoReajuste] = useState<'percentual' | 'valor'>('percentual')
  const [valorReajuste, setValorReajuste] = useState('')
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('produtos')
      .select('id, codigo, nome, preco_custo, preco_venda, margem_lucro')
      .eq('ativo', true)
      .or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
      .order('nome')
    if (data) setProdutos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProdutos()
  }, [search])

  const toggleSelecionado = (id: string) => {
    const novos = new Set(selecionados)
    if (novos.has(id)) {
      novos.delete(id)
    } else {
      novos.add(id)
    }
    setSelecionados(novos)
  }

  const toggleTodos = () => {
    if (selecionados.size === produtos.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(produtos.map(p => p.id)))
    }
  }

  const aplicarReajuste = async () => {
    if (!valorReajuste || selecionados.size === 0) return
    
    setSaving(true)
    const produtosSelecionados = produtos.filter(p => selecionados.has(p.id))
    
    for (const produto of produtosSelecionados) {
      let novoPreco = produto.preco_venda
      
      if (tipoReajuste === 'percentual') {
        const percentual = parseFloat(valorReajuste) / 100
        novoPreco = produto.preco_venda * (1 + percentual)
      } else {
        novoPreco = produto.preco_venda + parseFloat(valorReajuste)
      }
      
      // Arredondar para 2 casas decimais
      novoPreco = Math.round(novoPreco * 100) / 100
      
      // Calcular nova margem
      const novaMargem = produto.preco_custo > 0 
        ? ((novoPreco - produto.preco_custo) / produto.preco_custo) * 100 
        : 0
      
      await supabase.from('produtos').update({
        preco_venda: novoPreco,
        margem_lucro: novaMargem
      }).eq('id', produto.id)
    }
    
    setSaving(false)
    setSelecionados(new Set())
    setValorReajuste('')
    fetchProdutos()
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reajuste de Preços</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Reajuste */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Configurar Reajuste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reajuste</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipoReajuste('percentual')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm ${
                      tipoReajuste === 'percentual' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Por Percentual
                  </button>
                  <button
                    onClick={() => setTipoReajuste('valor')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm ${
                      tipoReajuste === 'valor' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Por Valor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tipoReajuste === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
                </label>
                <input
                  type="number"
                  step={tipoReajuste === 'percentual' ? '0.1' : '0.01'}
                  value={valorReajuste}
                  onChange={(e) => setValorReajuste(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={tipoReajuste === 'percentual' ? 'Ex: 10 para 10%' : 'Ex: 5.00'}
                />
              </div>

              {valorReajuste && selecionados.size > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {selecionados.size} produto(s) serão atualizados
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={aplicarReajuste}
                loading={saving}
                disabled={!valorReajuste || selecionados.size === 0}
              >
                <RefreshCw size={18} className="mr-2" />
                Aplicar Reajuste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Produtos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Produtos ({produtos.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={toggleTodos}>
                  {selecionados.size === produtos.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                </Button>
              </div>
              <div className="mt-4 relative">
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
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={32} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="w-10 py-3 px-4"></th>
                        <th className="text-left py-3 px-4">Código</th>
                        <th className="text-left py-3 px-4">Produto</th>
                        <th className="text-right py-3 px-4">Custo</th>
                        <th className="text-right py-3 px-4">Venda</th>
                        <th className="text-right py-3 px-4">Margem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map((p) => (
                        <tr key={p.id} className={`border-b hover:bg-gray-50 ${selecionados.has(p.id) ? 'bg-blue-50' : ''}`}>
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selecionados.has(p.id)}
                              onChange={() => toggleSelecionado(p.id)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{p.codigo}</td>
                          <td className="py-3 px-4">{p.nome}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(p.preco_custo)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(p.preco_venda)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.margem_lucro >= 30 ? 'bg-green-100 text-green-800' :
                              p.margem_lucro >= 15 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.margem_lucro?.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
