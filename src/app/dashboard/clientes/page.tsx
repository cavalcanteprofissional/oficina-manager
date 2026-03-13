'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CEPInput } from '@/components/ui/CEPInput'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { CEPResponse } from '@/lib/utils/cep'

interface Cliente {
  id: string
  nome: string
  cpf_cnpj: string | null
  rg_ie: string | null
  data_nascimento: string | null
  email: string | null
  telefone1: string
  telefone2: string | null
  cep: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  foto_url: string | null
  observacoes: string | null
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleCepFound = (data: CEPResponse) => {
    const event = new Event('input', { bubbles: true })
    
    const enderecoInput = document.querySelector('input[name="endereco"]') as HTMLInputElement
    const bairroInput = document.querySelector('input[name="bairro"]') as HTMLInputElement
    const cidadeInput = document.querySelector('input[name="cidade"]') as HTMLInputElement
    const estadoInput = document.querySelector('input[name="estado"]') as HTMLInputElement
    
    if (enderecoInput) {
      enderecoInput.value = data.logradouro
      enderecoInput.dispatchEvent(event)
    }
    if (bairroInput) {
      bairroInput.value = data.bairro
      bairroInput.dispatchEvent(event)
    }
    if (cidadeInput) {
      cidadeInput.value = data.localizacao
      cidadeInput.dispatchEvent(event)
    }
    if (estadoInput) {
      estadoInput.value = data.uf
      estadoInput.dispatchEvent(event)
    }
  }

  const fetchClientes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .or(`nome.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,telefone1.ilike.%${search}%`)
      .order('nome')
      .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1)

    if (!error && data) {
      setClientes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClientes()
  }, [search, pagination.page])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData(e.currentTarget)
    const cliente = {
      nome: formData.get('nome'),
      cpf_cnpj: formData.get('cpf_cnpj') || null,
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
      observacoes: formData.get('observacoes') || null,
    }

    if (editingCliente) {
      await supabase.from('clientes').update(cliente).eq('id', editingCliente.id)
    } else {
      await supabase.from('clientes').insert([cliente])
    }

    setSaving(false)
    setShowModal(false)
    setEditingCliente(null)
    fetchClientes()
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await supabase.from('clientes').delete().eq('id', id)
      fetchClientes()
    }
  }

  const openNewModal = () => {
    setEditingCliente(null)
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={openNewModal}>
          <Plus size={18} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">CPF/CNPJ</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Cidade</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{cliente.nome}</td>
                        <td className="py-3 px-4 text-gray-900">{cliente.cpf_cnpj || '-'}</td>
                        <td className="py-3 px-4 text-gray-900">{cliente.telefone1}</td>
                        <td className="py-3 px-4 text-gray-900">{cliente.cidade || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {clientes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum cliente encontrado
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome *"
                  name="nome"
                  required
                  defaultValue={editingCliente?.nome}
                />
                <Input
                  label="CPF/CNPJ"
                  name="cpf_cnpj"
                  defaultValue={editingCliente?.cpf_cnpj || ''}
                />
                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  defaultValue={editingCliente?.email || ''}
                />
                <Input
                  label="Telefone 1 *"
                  name="telefone1"
                  required
                  defaultValue={editingCliente?.telefone1}
                />
                <Input
                  label="Telefone 2"
                  name="telefone2"
                  defaultValue={editingCliente?.telefone2 || ''}
                />
                <CEPInput
                  label="CEP"
                  name="cep"
                  onCepFound={handleCepFound}
                  defaultValue={editingCliente?.cep || ''}
                />
                <Input
                  label="Endereço"
                  name="endereco"
                  className="md:col-span-2"
                  defaultValue={editingCliente?.endereco || ''}
                />
                <Input
                  label="Número"
                  name="numero"
                  defaultValue={editingCliente?.numero || ''}
                />
                <Input
                  label="Complemento"
                  name="complemento"
                  defaultValue={editingCliente?.complemento || ''}
                />
                <Input
                  label="Bairro"
                  name="bairro"
                  defaultValue={editingCliente?.bairro || ''}
                />
                <Input
                  label="Cidade"
                  name="cidade"
                  defaultValue={editingCliente?.cidade || ''}
                />
                <Input
                  label="Estado"
                  name="estado"
                  maxLength={2}
                  defaultValue={editingCliente?.estado || ''}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" loading={saving}>
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
