'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Search, Loader2, AlertTriangle, History } from 'lucide-react'

interface Produto {
  id: string
  codigo: string
  nome: string
  preco_custo: number
  preco_venda: number
  estoque_atual: number
  estoque_minimo: number
  estoque_maximo: number | null
  categoria: string | null
}

interface Movimento {
  id: string
  produto_id: string
  tipo_movimento: string
  quantidade: number
  saldo_anterior: number
  saldo_atual: number
  documento: string | null
  observacoes: string | null
  created_at: string
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [movimentos, setMovimentos] = useState<Movimento[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchProdutos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('produtos')
      .select('*, fornecedores(razao_social)')
      .eq('ativo', true)
      .or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
      .order('nome')
    if (data) setProdutos(data)
    setLoading(false)
  }

  const fetchMovimentos = async (produtoId: string) => {
    const { data } = await supabase
      .from('estoque_movimentos')
      .select('*')
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setMovimentos(data)
  }

  useEffect(() => { fetchProdutos() }, [search])

  const handleOpenMovimento = (produto: Produto) => {
    setSelectedProduto(produto)
    fetchMovimentos(produto.id)
    setShowHistory(true)
  }

  const handleSaveMovimento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('estoque_movimentos').insert([{
      produto_id: selectedProduto!.id,
      tipo_movimento: formData.get('tipo_movimento'),
      quantidade: parseInt(formData.get('quantidade') as string),
      saldo_anterior: selectedProduto!.estoque_atual,
      saldo_atual: formData.get('tipo_movimento') === 'entrada' 
        ? selectedProduto!.estoque_atual + parseInt(formData.get('quantidade') as string)
        : selectedProduto!.estoque_atual - parseInt(formData.get('quantidade') as string),
      documento: formData.get('documento') || null,
      observacoes: formData.get('observacoes') || null,
    }])

    // Atualizar estoque
    const novaQtd = formData.get('tipo_movimento') === 'entrada'
      ? selectedProduto!.estoque_atual + parseInt(formData.get('quantidade') as string)
      : selectedProduto!.estoque_atual - parseInt(formData.get('quantidade') as string)
    
    await supabase.from('produtos').update({ estoque_atual: novaQtd }).eq('id', selectedProduto!.id)

    setSaving(false)
    setShowHistory(false)
    fetchProdutos()
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const estoqueBaixo = produtos.filter(p => p.estoque_atual <= p.estoque_minimo)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
          {estoqueBaixo.length > 0 && (
            <p className="text-yellow-600 text-sm mt-1">
              <AlertTriangle size={14} className="inline mr-1" />
              {estoqueBaixo.length} produto(s) abaixo do estoque mínimo
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">Código</th>
                    <th className="text-left py-3 px-4">Produto</th>
                    <th className="text-right py-3 px-4">Estoque</th>
                    <th className="text-right py-3 px-4">Mín.</th>
                    <th className="text-right py-3 px-4">Custo</th>
                    <th className="text-right py-3 px-4">Venda</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id} className={`border-b hover:bg-gray-50 ${p.estoque_atual <= p.estoque_minimo ? 'bg-yellow-50' : ''}`}>
                      <td className="py-3 px-4 font-mono text-sm">{p.codigo}</td>
                      <td className="py-3 px-4">
                        <div>{p.nome}</div>
                        <div className="text-xs text-gray-500">{p.categoria || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={p.estoque_atual <= p.estoque_minimo ? 'text-yellow-600 font-bold' : ''}>
                          {p.estoque_atual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{p.estoque_minimo}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(p.preco_custo)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(p.preco_venda)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenMovimento(p)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <History size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Movimentação */}
      {showHistory && selectedProduto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Estoque: {selectedProduto.nome}</h2>
              <button onClick={() => setShowHistory(false)}><History size={24} /></button>
            </div>
            
            <div className="p-4">
              {/* Formulário de movimentação */}
              <form onSubmit={handleSaveMovimento} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Nova Movimentação</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                    <select name="tipo_movimento" required className="w-full px-3 py-2 border rounded-md">
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                      <option value="ajuste">Ajuste</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quantidade *</label>
                    <Input type="number" name="quantidade" min="1" required defaultValue="1" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Documento</label>
                    <Input name="documento" placeholder="NF, OS, etc" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Observação</label>
                    <Input name="observacoes" placeholder="Observação" />
                  </div>
                </div>
                <div className="mt-3">
                  <Button type="submit" size="sm" loading={saving}>Registrar</Button>
                </div>
              </form>

              {/* Histórico */}
              <h3 className="font-semibold mb-3">Histórico de Movimentações</h3>
              {movimentos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Data</th>
                        <th className="text-left py-2">Tipo</th>
                        <th className="text-right py-2">Qtd</th>
                        <th className="text-right py-2">Saldo Ant.</th>
                        <th className="text-right py-2">Saldo Final</th>
                        <th className="text-left py-2">Documento</th>
                        <th className="text-left py-2">Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimentos.map((m) => (
                        <tr key={m.id} className="border-b">
                          <td className="py-2">{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              m.tipo_movimento === 'entrada' ? 'bg-green-100 text-green-800' :
                              m.tipo_movimento === 'saida' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {m.tipo_movimento}
                            </span>
                          </td>
                          <td className="py-2 text-right">{m.quantidade}</td>
                          <td className="py-2 text-right">{m.saldo_anterior}</td>
                          <td className="py-2 text-right font-medium">{m.saldo_atual}</td>
                          <td className="py-2">{m.documento || '-'}</td>
                          <td className="py-2">{m.observacoes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
