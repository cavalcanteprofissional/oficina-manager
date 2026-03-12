'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Plus, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
}

interface ContaReceber {
  id: string
  cliente_id: string | null
  descricao: string
  documento: string | null
  data_emissao: string
  data_vencimento: string
  data_recebimento: string | null
  valor: number
  valor_recebido: number | null
  juros: number
  multa: number
  desconto: number
  status: string
  forma_recebimento: string | null
  clientes?: Cliente
}

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceber[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchContas = async () => {
    setLoading(true)
    let query = supabase
      .from('contas_receber')
      .select('*, clientes(nome)')
      .order('data_vencimento')

    if (statusFilter) query = query.eq('status', statusFilter)

    const { data } = await query
    if (data) setContas(data)
    setLoading(false)
  }

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    if (data) setClientes(data)
  }

  useEffect(() => { fetchContas() }, [statusFilter])
  useEffect(() => { if (showModal) fetchClientes() }, [showModal])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('contas_receber').insert([{
      cliente_id: formData.get('cliente_id') || null,
      descricao: formData.get('descricao'),
      documento: formData.get('documento') || null,
      data_emissao: formData.get('data_emissao'),
      data_vencimento: formData.get('data_vencimento'),
      valor: parseFloat(formData.get('valor') as string),
      juros: parseFloat(formData.get('juros') as string) || 0,
      multa: parseFloat(formData.get('multa') as string) || 0,
      desconto: parseFloat(formData.get('desconto') as string) || 0,
      forma_recebimento: formData.get('forma_recebimento') || null,
    }])

    setSaving(false)
    setShowModal(false)
    fetchContas()
  }

  const receberConta = async (conta: ContaReceber) => {
    const valorRecebido = conta.valor + conta.juros + conta.multa - conta.desconto
    await supabase.from('contas_receber').update({
      status: 'recebido',
      data_recebimento: new Date().toISOString().split('T')[0],
      valor_recebido: valorRecebido
    }).eq('id', conta.id)
    fetchContas()
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const hoje = new Date().toISOString().split('T')[0]
  const contasAtrasadas = contas.filter(c => c.status === 'pendente' && c.data_vencimento < hoje)
  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor, 0)
  const totalRecebido = contas.filter(c => c.status === 'recebido').reduce((acc, c) => acc + (c.valor_recebido || 0), 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
          <p className="text-gray-600">
            Pendente: <span className="font-bold text-yellow-600">{formatCurrency(totalPendente)}</span>
            <span className="ml-4">Recebido: <span className="font-bold text-green-600">{formatCurrency(totalRecebido)}</span></span>
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Nova Conta
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'pendente', 'recebido', 'atrasado'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-md text-sm ${
              statusFilter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === '' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
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
                    <th className="text-left py-3 px-4">Descrição</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Vencimento</th>
                    <th className="text-right py-3 px-4">Valor</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta) => {
                    const isAtrasado = conta.status === 'pendente' && conta.data_vencimento < hoje
                    return (
                      <tr key={conta.id} className={`border-b hover:bg-gray-50 ${isAtrasado ? 'bg-red-50' : ''}`}>
                        <td className="py-3 px-4">
                          <div>{conta.descricao}</div>
                          {conta.documento && <div className="text-xs text-gray-500">Doc: {conta.documento}</div>}
                        </td>
                        <td className="py-3 px-4">{(conta as any).clientes?.nome || '-'}</td>
                        <td className="py-3 px-4">
                          {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(conta.valor)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            conta.status === 'recebido' ? 'bg-green-100 text-green-800' :
                            isAtrasado ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conta.status === 'recebido' ? 'Recebido' : isAtrasado ? 'Atrasado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {conta.status === 'pendente' && (
                            <Button size="sm" variant="outline" onClick={() => receberConta(conta)}>
                              <CheckCircle size={14} className="mr-1" /> Receber
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Nova Conta a Receber</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select name="cliente_id" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <Input label="Descrição *" name="descricao" required />
              <Input label="Documento" name="documento" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data Emissão *" name="data_emissao" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                <Input label="Data Vencimento *" name="data_vencimento" type="date" required />
              </div>
              <Input label="Valor *" name="valor" type="number" step="0.01" required />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Juros" name="juros" type="number" step="0.01" defaultValue="0" />
                <Input label="Multa" name="multa" type="number" step="0.01" defaultValue="0" />
                <Input label="Desconto" name="desconto" type="number" step="0.01" defaultValue="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma Recebimento</label>
                <select name="forma_recebimento" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Débito">Cartão Débito</option>
                  <option value="Crédito">Cartão Crédito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferência</option>
                </select>
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
