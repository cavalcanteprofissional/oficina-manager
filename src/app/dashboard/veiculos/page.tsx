'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
}

interface Veiculo {
  id: string
  placa: string
  marca: string
  modelo: string
  ano_fabricacao: number | null
  ano_modelo: number | null
  cor: string | null
  chassi: string | null
  renavam: string | null
  km_atual: number | null
  combustivel: string | null
  observacoes: string | null
  cliente_id: string
  clientes?: Cliente
}

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchVeiculos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('veiculos')
      .select('*, clientes(nome)')
      .or(`placa.ilike.%${search}%,marca.ilike.%${search}%,modelo.ilike.%${search}%`)
      .order('placa')
    if (data) setVeiculos(data)
    setLoading(false)
  }

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    if (data) setClientes(data)
  }

  useEffect(() => { fetchVeiculos() }, [search])
  useEffect(() => { if (showModal) fetchClientes() }, [showModal])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      cliente_id: formData.get('cliente_id'),
      placa: formData.get('placa'),
      marca: formData.get('marca'),
      modelo: formData.get('modelo'),
      ano_fabricacao: parseInt(formData.get('ano_fabricacao') as string) || null,
      ano_modelo: parseInt(formData.get('ano_modelo') as string) || null,
      cor: formData.get('cor') || null,
      chassi: formData.get('chassi') || null,
      renavam: formData.get('renavam') || null,
      km_atual: parseInt(formData.get('km_atual') as string) || null,
      combustivel: formData.get('combustivel') || null,
      observacoes: formData.get('observacoes') || null,
    }
    if (editing) await supabase.from('veiculos').update(data).eq('id', editing.id)
    else await supabase.from('veiculos').insert([data])
    setSaving(false)
    setShowModal(false)
    setEditing(null)
    fetchVeiculos()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('veiculos').delete().eq('id', id)
      fetchVeiculos()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
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
              placeholder="Buscar por placa, marca ou modelo..."
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
                    <th className="text-left py-3 px-4">Placa</th>
                    <th className="text-left py-3 px-4">Marca/Modelo</th>
                    <th className="text-left py-3 px-4">Ano</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {veiculos.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{v.placa}</td>
                      <td className="py-3 px-4">{v.marca} {v.modelo}</td>
                      <td className="py-3 px-4">{v.ano_fabricacao}/{v.ano_modelo}</td>
                      <td className="py-3 px-4">{(v as any).clientes?.nome || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditing(v); setShowModal(true) }} className="text-blue-600 mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(v.id)} className="text-red-600"><Trash2 size={18} /></button>
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
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Novo'} Veículo</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select name="cliente_id" required defaultValue={editing?.cliente_id} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Selecione</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <Input label="Placa *" name="placa" required defaultValue={editing?.placa} />
                <Input label="Marca *" name="marca" required defaultValue={editing?.marca} />
                <Input label="Modelo *" name="modelo" required defaultValue={editing?.modelo} />
                <Input label="Ano Fabricação" name="ano_fabricacao" type="number" defaultValue={editing?.ano_fabricacao || ''} />
                <Input label="Ano Modelo" name="ano_modelo" type="number" defaultValue={editing?.ano_modelo || ''} />
                <Input label="Cor" name="cor" defaultValue={editing?.cor || ''} />
                <Input label="Chassi" name="chassi" defaultValue={''} />
                <Input label="Renavam" name="renavam" defaultValue={''} />
                <Input label="Km Atual" name="km_atual" type="number" defaultValue={editing?.km_atual || ''} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
                  <select name="combustivel" defaultValue={editing?.combustivel || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Selecione</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Flex">Flex</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
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
