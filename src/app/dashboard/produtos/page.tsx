'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2, AlertTriangle } from 'lucide-react'

interface Produto {
  id: string
  codigo: string
  codigo_barras: string | null
  nome: string
  descricao: string | null
  preco_custo: number
  preco_venda: number
  estoque_atual: number
  estoque_minimo: number
  categoria: string | null
  marca: string | null
  unidade_medida: string | null
  ativo: boolean
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchProdutos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
      .order('nome')
    if (data) setProdutos(data)
    setLoading(false)
  }

  useEffect(() => { fetchProdutos() }, [search])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const precoCusto = parseFloat(formData.get('preco_custo') as string) || 0
    const precoVenda = parseFloat(formData.get('preco_venda') as string) || 0
    const margemLucro = precoCusto > 0 ? ((precoVenda - precoCusto) / precoCusto) * 100 : 0
    
    const data = {
      codigo: formData.get('codigo'),
      nome: formData.get('nome'),
      descricao: formData.get('descricao') || null,
      categoria: formData.get('categoria') || null,
      marca: formData.get('marca') || null,
      unidade_medida: formData.get('unidade_medida') || 'UN',
      preco_custo: precoCusto,
      preco_venda: precoVenda,
      margem_lucro: margemLucro,
      estoque_minimo: parseInt(formData.get('estoque_minimo') as string) || 0,
      estoque_atual: parseInt(formData.get('estoque_atual') as string) || 0,
      localizacao: formData.get('localizacao') || null,
      ncm: formData.get('ncm') || null,
      ativo: true,
    }
    
    if (editing) await supabase.from('produtos').update(data).eq('id', editing.id)
    else await supabase.from('produtos').insert([data])
    setSaving(false)
    setShowModal(false)
    setEditing(null)
    fetchProdutos()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('produtos').delete().eq('id', id)
      fetchProdutos()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <Button onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={18} className="mr-2" /> Novo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por código ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Código</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Custo</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Venda</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Estoque</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm text-gray-900">{p.codigo}</td>
                      <td className="py-3 px-4 text-gray-900">{p.nome}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(p.preco_custo)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(p.preco_venda)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-gray-900">
                          {p.estoque_atual <= p.estoque_minimo && <AlertTriangle size={14} className="text-yellow-500" />}
                          {p.estoque_atual}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{p.categoria || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditing(p); setShowModal(true) }} className="text-blue-600 mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Novo'} Produto</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Código *" name="codigo" required defaultValue={editing?.codigo} />
                <Input label="Código de Barras" name="codigo_barras" defaultValue={''} />
                <Input label="Nome *" name="nome" required defaultValue={editing?.nome} className="md:col-span-2" />
                <Input label="Descrição" name="descricao" className="md:col-span-2" defaultValue={''} />
                <Input label="Categoria" name="categoria" defaultValue={editing?.categoria || ''} />
                <Input label="Marca" name="marca" defaultValue={editing?.marca || ''} />
                <Input label="Unidade" name="unidade_medida" defaultValue={editing?.unidade_medida || 'UN'} />
                <Input label="NCM" name="ncm" defaultValue={''} />
                <Input label="Preço Custo *" name="preco_custo" type="number" step="0.01" required defaultValue={editing?.preco_custo} />
                <Input label="Preço Venda *" name="preco_venda" type="number" step="0.01" required defaultValue={editing?.preco_venda} />
                <Input label="Estoque Mínimo" name="estoque_minimo" type="number" defaultValue={editing?.estoque_minimo || 0} />
                <Input label="Estoque Atual" name="estoque_atual" type="number" defaultValue={editing?.estoque_atual || 0} />
                <Input label="Localização" name="localizacao" defaultValue={''} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" loading={saving}>Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
