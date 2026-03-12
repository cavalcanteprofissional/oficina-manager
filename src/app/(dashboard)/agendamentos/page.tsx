'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Loader2, X, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
}

interface Veiculo {
  id: string
  placa: string
  modelo: string
}

interface Servico {
  id: string
  nome: string
}

interface Mecanico {
  id: string
  nome: string
}

interface Agendamento {
  id: string
  cliente_id: string
  veiculo_id: string
  servico_id: string | null
  data_agendamento: string
  hora_agendamento: string
  mecanico_id: string | null
  status: string
  observacoes: string | null
  clientes?: Cliente
  veiculos?: Veiculo
  servicos?: Servico
  mecanicos?: Mecanico
}

const statusColors: Record<string, string> = {
  agendado: 'bg-blue-100 text-blue-800',
  confirmado: 'bg-green-100 text-green-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  concluido: 'bg-gray-100 text-gray-800',
  cancelado: 'bg-red-100 text-red-800',
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  
  const [selectedCliente, setSelectedCliente] = useState('')
  const [selectedVeiculo, setSelectedVeiculo] = useState('')
  
  const supabase = createClient()

  const fetchAgendamentos = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome), veiculos(placa, modelo), servicos(nome), mecanicos(nome)')
      .gte('data_agendamento', today)
      .order('data_agendamento')
      .order('hora_agendamento')
    if (data) setAgendamentos(data)
    setLoading(false)
  }

  const fetchFormData = async () => {
    const [clientesRes, veiculosRes, servicosRes, mecanicosRes] = await Promise.all([
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('veiculos').select('id, placa, modelo').order('placa'),
      supabase.from('servicos').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('mecanicos').select('id, nome').eq('ativo', true).order('nome'),
    ])
    if (clientesRes.data) setClientes(clientesRes.data)
    if (veiculosRes.data) setVeiculos(veiculosRes.data)
    if (servicosRes.data) setServicos(servicosRes.data)
    if (mecanicosRes.data) setMecanicos(mecanicosRes.data)
  }

  useEffect(() => { fetchAgendamentos() }, [])
  useEffect(() => { if (showModal) fetchFormData() }, [showModal])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('agendamentos').insert([{
      cliente_id: selectedCliente,
      veiculo_id: selectedVeiculo,
      servico_id: formData.get('servico_id') || null,
      data_agendamento: formData.get('data_agendamento'),
      hora_agendamento: formData.get('hora_agendamento'),
      mecanico_id: formData.get('mecanico_id') || null,
      observacoes: formData.get('observacoes') || null,
    }])

    setSaving(false)
    setShowModal(false)
    setSelectedCliente('')
    setSelectedVeiculo('')
    fetchAgendamentos()
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('agendamentos').update({ status }).eq('id', id)
    fetchAgendamentos()
  }

  const deleteAgendamento = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('agendamentos').delete().eq('id', id)
      fetchAgendamentos()
    }
  }

  // Agrupar por data
  const agendamentosPorData = agendamentos.reduce((acc, ag) => {
    const data = ag.data_agendamento
    if (!acc[data]) acc[data] = []
    acc[data].push(ag)
    return acc
  }, {} as Record<string, Agendamento[]>)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Novo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={32} /></div>
      ) : Object.keys(agendamentosPorData).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum agendamento para hoje</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(agendamentosPorData).map(([data, ags]) => (
          <div key={data} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-3">
              {ags.map((ag) => (
                <Card key={ag.id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="font-medium">{ag.hora_agendamento}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[ag.status]}`}>
                            {ag.status}
                          </span>
                        </div>
                        <p className="font-medium">{(ag as any).clientes?.nome}</p>
                        <p className="text-sm text-gray-600">
                          {(ag as any).veiculos?.placa} - {(ag as any).veiculos?.modelo}
                        </p>
                        {(ag as any).servicos?.nome && (
                          <p className="text-sm text-gray-500">{(ag as any).servicos?.nome}</p>
                        )}
                        {(ag as any).mecanicos?.nome && (
                          <p className="text-sm text-gray-500">Mecânico: {(ag as any).mecanicos?.nome}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {ag.status === 'agendado' && (
                          <button onClick={() => updateStatus(ag.id, 'confirmado')} className="text-green-600" title="Confirmar">
                            <CheckCircle size={20} />
                          </button>
                        )}
                        {ag.status === 'confirmado' && (
                          <button onClick={() => updateStatus(ag.id, 'em_andamento')} className="text-yellow-600" title="Iniciar">
                            <Clock size={20} />
                          </button>
                        )}
                        {ag.status === 'em_andamento' && (
                          <button onClick={() => updateStatus(ag.id, 'concluido')} className="text-green-600" title="Concluir">
                            <CheckCircle size={20} />
                          </button>
                        )}
                        {ag.status !== 'concluido' && ag.status !== 'cancelado' && (
                          <button onClick={() => updateStatus(ag.id, 'cancelado')} className="text-red-600" title="Cancelar">
                            <XCircle size={20} />
                          </button>
                        )}
                        <button onClick={() => deleteAgendamento(ag.id)} className="text-gray-400 hover:text-red-600">
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal de Novo Agendamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Novo Agendamento</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select 
                  value={selectedCliente}
                  onChange={(e) => { setSelectedCliente(e.target.value); setSelectedVeiculo('') }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veículo *</label>
                <select 
                  value={selectedVeiculo}
                  onChange={(e) => setSelectedVeiculo(e.target.value)}
                  required
                  disabled={!selectedCliente}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione</option>
                  {veiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                <select name="servico_id" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione</option>
                  {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data *" name="data_agendamento" type="date" required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                  <Input type="time" name="hora_agendamento" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mecânico</label>
                <select name="mecanico_id" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione</option>
                  {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea name="observacoes" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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
