'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react'

interface Mecanico {
  id: string
  nome: string
  cpf: string | null
  telefone: string
  email: string | null
  cidade: string | null
  ativo: boolean
  comissao_percentual: number | null
}

export default function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Mecanico | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchMecanicos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('mecanicos')
      .select('*')
      .or(`nome.ilike.%${search}%,cpf.ilike.%${search}%`)
      .order('nome')
    if (data) setMecanicos(data)
    setLoading(false)
  }

  useEffect(() => { fetchMecanicos() }, [search])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome'),
      cpf: formData.get('cpf') || null,
      data_contratacao: formData.get('data_contratacao') || new Date().toISOString().split('T')[0],
      email: formData.get('email') || null,
      telefone: formData.get('telefone'),
      celular: formData.get('celular') || null,
      cep: formData.get('cep') || null,
      endereco: formData.get('endereco') || null,
      numero: formData.get('numero') || null,
      bairro: formData.get('bairro') || null,
      cidade: formData.get('cidade') || null,
      estado: formData.get('estado') || null,
      comissao_percentual: parseFloat(formData.get('comissao_percentual') as string) || 0,
      ativo: true,
    }
    if (editing) await supabase.from('mecanicos').update(data).eq('id', editing.id)
    else await supabase.from('mecanicos').insert([data])
    setSaving(false)
    setShowModal(false)
    setEditing(null)
    fetchMecanicos()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('mecanicos').delete().eq('id', id)
      fetchMecanicos()
    }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('mecanicos').update({ ativo: !ativo }).eq('id', id)
    fetchMecanicos()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mecânicos</h1>
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
              placeholder="Buscar..."
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
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">CPF</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">CPF</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Comissão %</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mecanicos.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{m.nome}</td>
                      <td className="py-3 px-4 text-gray-900">{m.cpf || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{m.telefone}</td>
                      <td className="py-3 px-4 text-gray-900">{m.comissao_percentual || 0}%</td>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleAtivo(m.id, m.ativo)} className={`px-2 py-1 rounded text-xs ${m.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {m.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditing(m); setShowModal(true) }} className="text-blue-600 mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-600"><Trash2 size={18} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Novo'} Mecânico</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome *" name="nome" required defaultValue={editing?.nome} />
                <Input label="CPF" name="cpf" defaultValue={editing?.cpf || ''} />
                <Input label="E-mail" name="email" type="email" defaultValue={editing?.email || ''} />
                <Input label="Telefone *" name="telefone" required defaultValue={editing?.telefone} />
                <Input label="Celular" name="celular" defaultValue={''} />
                <Input label="CEP" name="cep" defaultValue={''} />
                <Input label="Endereço" name="endereco" className="md:col-span-2" defaultValue={''} />
                <Input label="Número" name="numero" defaultValue={''} />
                <Input label="Bairro" name="bairro" defaultValue={''} />
                <Input label="Cidade" name="cidade" defaultValue={editing?.cidade || ''} />
                <Input label="Estado" name="estado" maxLength={2} defaultValue={''} />
                <Input label="Comissão %" name="comissao_percentual" type="number" step="0.01" defaultValue={editing?.comissao_percentual || ''} />
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
