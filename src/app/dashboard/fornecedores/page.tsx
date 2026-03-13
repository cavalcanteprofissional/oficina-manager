'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react'

interface Fornecedor {
  id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  telefone1: string
  email: string | null
  cidade: string | null
  estado: string | null
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Fornecedor | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchFornecedores = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('fornecedores')
      .select('*')
      .or(`razao_social.ilike.%${search}%,cnpj.ilike.%${search}%`)
      .order('razao_social')
    if (data) setFornecedores(data)
    setLoading(false)
  }

  useEffect(() => { fetchFornecedores() }, [search])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      razao_social: formData.get('razao_social'),
      nome_fantasia: formData.get('nome_fantasia') || null,
      cnpj: formData.get('cnpj') || null,
      inscricao_estadual: formData.get('inscricao_estadual') || null,
      email: formData.get('email') || null,
      telefone1: formData.get('telefone1'),
      telefone2: formData.get('telefone2') || null,
      cep: formData.get('cep') || null,
      endereco: formData.get('endereco') || null,
      numero: formData.get('numero') || null,
      complemento: formData.get('complemento') || null,
      bairro: formData.get('bairro') || null,
      cidade: formData.get('cidade') || null,
      estado: formData.get('estado') || null,
      contato_nome: formData.get('contato_nome') || null,
      observacoes: formData.get('observacoes') || null,
    }
    if (editing) await supabase.from('fornecedores').update(data).eq('id', editing.id)
    else await supabase.from('fornecedores').insert([data])
    setSaving(false)
    setShowModal(false)
    setEditing(null)
    fetchFornecedores()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('fornecedores').delete().eq('id', id)
      fetchFornecedores()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
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
                    <th className="text-left py-3 px-4">Razão Social</th>
                    <th className="text-left py-3 px-4">CNPJ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Razão Social</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">CNPJ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cidade</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{f.razao_social}</td>
                      <td className="py-3 px-4 text-gray-900">{f.cnpj || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{f.telefone1}</td>
                      <td className="py-3 px-4 text-gray-900">{f.cidade || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditing(f); setShowModal(true) }} className="text-blue-600 mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(f.id)} className="text-red-600"><Trash2 size={18} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Novo'} Fornecedor</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Razão Social *" name="razao_social" required defaultValue={editing?.razao_social} />
                <Input label="Nome Fantasia" name="nome_fantasia" defaultValue={editing?.nome_fantasia || ''} />
                <Input label="CNPJ" name="cnpj" defaultValue={editing?.cnpj || ''} />
                <Input label="Inscrição Estadual" name="inscricao_estadual" defaultValue={''} />
                <Input label="E-mail" name="email" type="email" defaultValue={editing?.email || ''} />
                <Input label="Telefone 1 *" name="telefone1" required defaultValue={editing?.telefone1} />
                <Input label="Telefone 2" name="telefone2" defaultValue={''} />
                <Input label="CEP" name="cep" defaultValue={''} />
                <Input label="Endereço" name="endereco" className="md:col-span-2" defaultValue={''} />
                <Input label="Número" name="numero" defaultValue={''} />
                <Input label="Complemento" name="complemento" defaultValue={''} />
                <Input label="Bairro" name="bairro" defaultValue={''} />
                <Input label="Cidade" name="cidade" defaultValue={editing?.cidade || ''} />
                <Input label="Estado" name="estado" maxLength={2} defaultValue={editing?.estado || ''} />
                <Input label="Contato" name="contato_nome" defaultValue={''} />
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
