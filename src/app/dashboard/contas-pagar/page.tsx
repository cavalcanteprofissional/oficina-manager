'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Loader2, X, Search, CheckCircle, AlertCircle } from 'lucide-react'

interface Fornecedor {
  id: string
  razao_social: string
}

interface ContaPagar {
  id: string
  fornecedor_id: string | null
  descricao: string
  documento: string | null
  data_emissao: string
  data_vencimento: string
  data_pagamento: string | null
  valor: number
  valor_pago: number | null
  juros: number
  multa: number
  desconto: number
  status: string
  categoria: string | null
  fornecedores?: Fornecedor
}

export default function ContasPagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<ContaPagar | null>(null)
  const supabase = createClient()

  const fetchContas = async () => {
    setLoading(true)
    let query = supabase
      .from('contas_pagar')
      .select('*, fornecedores(razao_social)')
      .order('data_vencimento')

    if (statusFilter) query = query.eq('status', statusFilter)

    const { data } = await query
    if (data) setContas(data)
    setLoading(false)
  }

  const fetchFornecedores = async () => {
    const { data } = await supabase.from('fornecedores').select('id, razao_social').order('razao_social')
    if (data) setFornecedores(data)
  }

  useEffect(() => { fetchContas() }, [statusFilter])
  useEffect(() => { if (showModal) fetchFornecedores() }, [showModal])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      fornecedor_id: formData.get('fornecedor_id') || null,
      descricao: formData.get('descricao'),
      documento: formData.get('documento') || null,
      data_emissao: formData.get('data_emissao'),
      data_vencimento: formData.get('data_vencimento'),
      valor: parseFloat(formData.get('valor') as string),
      juros: parseFloat(formData.get('juros') as string) || 0,
      multa: parseFloat(formData.get('multa') as string) || 0,
      desconto: parseFloat(formData.get('desconto') as string) || 0,
      categoria: formData.get('categoria') || null,
    }

    if (editing) {
      await supabase.from('contas_pagar').update(data).eq('id', editing.id)
    } else {
      await supabase.from('contas_pagar').insert([data])
    }

    setSaving(false)
    setShowModal(false)
    setEditing(null)
    fetchContas()
  }

  const pagarConta = async (conta: ContaPagar) => {
    const valorPago = conta.valor + conta.juros + conta.multa - conta.desconto
    await supabase.from('contas_pagar').update({
      status: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: valorPago
    }).eq('id', conta.id)
    fetchContas()
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const hoje = new Date().toISOString().split('T')[0]
  const contasAtrasadas = contas.filter(c => c.status === 'pendente' && c.data_vencimento < hoje)
  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="text-gray-600">
            Total pendente: <span className="font-bold">{formatCurrency(totalPendente)}</span>
            {contasAtrasadas.length > 0 && (
              <span className="ml-4 text-red-600">
                <AlertCircle size={14} className="inline" /> {contasAtrasadas.length} atrasada(s)
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={18} className="mr-2" /> Nova Conta
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'pendente', 'pago', 'atrasado'].map((status) => (
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
                    <th className="text-left py-3 px-4">Fornecedor</th>
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
                        <td className="py-3 px-4">{(conta as any).fornecedores?.razao_social || '-'}</td>
                        <td className="py-3 px-4">
                          {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(conta.valor)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            conta.status === 'pago' ? 'bg-green-100 text-green-800' :
                            isAtrasado ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conta.status === 'pago' ? 'Pago' : isAtrasado ? 'Atrasado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {conta.status === 'pendente' && (
                            <Button size="sm" variant="outline" onClick={() => pagarConta(conta)}>
                              <CheckCircle size={14} className="mr-1" /> Pagar
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
              <h2 className="text-lg font-semibold">{editing ? 'Editar' : 'Nova'} Conta a Pagar</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <select name="fornecedor_id" defaultValue={editing?.fornecedor_id || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social}</option>)}
                </select>
              </div>
              <Input label="Descrição *" name="descricao" required defaultValue={editing?.descricao} />
              <Input label="Documento" name="documento" defaultValue={editing?.documento || ''} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data Emissão *" name="data_emissao" type="date" required defaultValue={editing?.data_emissao || new Date().toISOString().split('T')[0]} />
                <Input label="Data Vencimento *" name="data_vencimento" type="date" required defaultValue={editing?.data_vencimento} />
              </div>
              <Input label="Valor *" name="valor" type="number" step="0.01" required defaultValue={editing?.valor} />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Juros" name="juros" type="number" step="0.01" defaultValue={editing?.juros || '0'} />
                <Input label="Multa" name="multa" type="number" step="0.01" defaultValue={editing?.multa || '0'} />
                <Input label="Desconto" name="desconto" type="number" step="0.01" defaultValue={editing?.desconto || '0'} />
              </div>
              <Input label="Categoria" name="categoria" defaultValue={editing?.categoria || ''} />
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
