'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react'

interface Servico {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  categoria: string | null
  tempo_estimado: number | null
  preco_sugerido: number | null
  comissao_percentual: number | null
  ativo: boolean
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchServicos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('servicos')
      .select('*')
      .or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
      .order('nome')
    if (data) setServicos(data)
    setLoading(false)
  }

  useEffect(() => { fetchServicos() }, [search])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      codigo: formData.get('codigo'),
      nome: formData.get('nome'),
      descricao: formData.get('descricao') || null,
      categoria: formData.get('categoria') || null,
      tempo_estimado: parseInt(formData.get('tempo_estimado') as string) || null,
      preco_sugerido: parseFloat(formData.get('preco_sugerido') as string) || null,
      comissao_percentual: parseFloat(formData.get('comissao_percentual') as string) || 0,
      ativo: true,
    }
    if (editing) await supabase.from('servicos').update(data).eq('id', editing.id)
    else await supabase.from('servicos').insert([data])
    setSaving(false)
    setShowModal(false)
    setEditing(null)
    fetchServicos()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('servicos').delete().eq('id', id)
      fetchServicos()
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatTime = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}min`
    return `${mins}min`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
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
                    <th className="text-left py-3 px-4">Código</th>
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Categoria</th>
                    <th className="text-right py-3 px-4">Tempo</th>
                    <th className="text-right py-3 px-4">Preço</th>
                    <th className="text-right py-3 px-4">Comissão</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{s.codigo}</td>
                      <td className="py-3 px-4">{s.nome}</td>
                      <td className="py-3 px-4">{s.categoria || '-'}</td>
                      <td className="py-3 px-4 text-right">{formatTime(s.tempo_estimado)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(s.preco_sugerido)}</td>
                      <td className="py-3 px-4 text-right">{s.comissao_percentual || 0}%</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditing(s); setShowModal(true) }} className="text-blue-600 mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600"><Trash2 size={18} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Novo'} Serviço</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Código *" name="codigo" required defaultValue={editing?.codigo} />
                <Input label="Nome *" name="nome" required defaultValue={editing?.nome} />
                <Input label="Categoria" name="categoria" defaultValue={editing?.categoria || ''} />
                <Input label="Tempo Estimado (min)" name="tempo_estimado" type="number" defaultValue={editing?.tempo_estimado || ''} />
                <Input label="Preço Sugerido" name="preco_sugerido" type="number" step="0.01" defaultValue={editing?.preco_sugerido || ''} />
                <Input label="Comissão %" name="comissao_percentual" type="number" step="0.01" defaultValue={editing?.comissao_percentual || ''} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea name="descricao" rows={3} defaultValue={editing?.descricao || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
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
