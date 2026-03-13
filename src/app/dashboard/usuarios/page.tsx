'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2, UserPlus, RefreshCw } from 'lucide-react'
import { Usuario, Role, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils/usuario'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ROLES: Role[] = ['admin', 'gerente', 'mecanico', 'caixa', 'comum']

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchUsuarios = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', pagination.page.toString())
    params.set('limit', pagination.limit.toString())
    if (search) params.set('search', search)

    const response = await fetch(`/api/usuarios?${params}`)
    const result = await response.json()

    if (result.data) {
      setUsuarios(result.data)
      setPagination(prev => ({ ...prev, ...result.pagination }))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [search, pagination.page])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    
    const formData = new FormData(e.currentTarget)
    const usuarioData = {
      nome: formData.get('nome'),
      cpf: formData.get('cpf') || null,
      telefone: formData.get('telefone') || null,
      role: formData.get('role'),
      ativo: formData.get('ativo') === 'on',
    }

    const url = editingUsuario ? `/api/usuarios/${editingUsuario.id}` : '/api/usuarios'
    const method = editingUsuario ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioData)
    })

    const result = await response.json()

    setSaving(false)

    if (!response.ok) {
      alert(result.error || 'Erro ao salvar usuário')
      return
    }

    setShowModal(false)
    setEditingUsuario(null)
    fetchUsuarios()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    if (response.ok) {
      fetchUsuarios()
    } else {
      const result = await response.json()
      alert(result.error || 'Erro ao excluir usuário')
    }
  }

  const handleToggleAtivo = async (usuario: Usuario) => {
    const response = await fetch(`/api/usuarios/${usuario.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...usuario, ativo: !usuario.ativo })
    })

    if (response.ok) {
      fetchUsuarios()
    }
  }

  const openEditModal = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingUsuario(null)
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <Button onClick={openNewModal}>
          <Plus size={18} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Criado em</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{usuario.nome}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[usuario.role as Role]}`}>
                            {ROLE_LABELS[usuario.role as Role]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleAtivo(usuario)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              usuario.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openEditModal(usuario)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.id)}
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
              {usuarios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <Input
                label="Nome *"
                name="nome"
                required
                defaultValue={editingUsuario?.nome}
              />
              <Input
                label="CPF"
                name="cpf"
                defaultValue={editingUsuario?.cpf || ''}
              />
              <Input
                label="Telefone"
                name="telefone"
                defaultValue={editingUsuario?.telefone || ''}
              />
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue={editingUsuario?.role || 'comum'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  defaultChecked={editingUsuario?.ativo ?? true}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="ativo" className="text-sm text-gray-700">
                  Usuário ativo
                </label>
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
