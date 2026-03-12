'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Plus, Search, Eye, Edit2, Trash2, X, Loader2, CheckCircle, XCircle, Clock, Wrench } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
}

interface Veiculo {
  id: string
  placa: string
  modelo: string
  marca: string
}

interface Mecanico {
  id: string
  nome: string
}

interface OS {
  id: string
  numero_os: number
  cliente_id: string
  veiculo_id: string
  mecanico_id: string | null
  data_abertura: string
  data_previsao: string | null
  data_conclusao: string | null
  status: string
  km_veiculo: number | null
  nivel_combustivel: string | null
  problemas_relatados: string | null
  observacoes: string | null
  valor_total: number
  desconto: number
  valor_final: number
  forma_pagamento: string | null
  clientes?: Cliente
  veiculos?: Veiculo
  mecanicos?: Mecanico
  os_itens?: any[]
}

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_pecas: 'bg-orange-100 text-orange-800',
  concluida: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  aguardando_pecas: 'Aguardando Peças',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export default function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<OS[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingOS, setEditingOS] = useState<OS | null>(null)
  const [viewOS, setViewOS] = useState<OS | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Dados para selects
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [servicos, setServicos] = useState<any[]>([])
  
  // Dados do formulário
  const [selectedCliente, setSelectedCliente] = useState('')
  const [selectedVeiculo, setSelectedVeiculo] = useState('')
  const [itens, setItens] = useState<any[]>([])
  
  const supabase = createClient()

  const fetchOrdens = async () => {
    setLoading(true)
    let query = supabase
      .from('ordens_servico')
      .select('*, clientes(nome), veiculos(placa, modelo, marca), mecanicos(nome)')
      .order('data_abertura', { ascending: false })

    if (statusFilter) query = query.eq('status', statusFilter)
    if (search) query = query.ilike('numero_os', `%${search}%`)

    const { data } = await query.limit(50)
    if (data) setOrdens(data)
    setLoading(false)
  }

  const fetchFormData = async () => {
    const [clientesRes, veiculosRes, mecanicosRes, produtosRes, servicosRes] = await Promise.all([
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('veiculos').select('id, placa, modelo, marca').order('placa'),
      supabase.from('mecanicos').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('produtos').select('id, nome, preco_venda, estoque_atual').eq('ativo', true).order('nome'),
      supabase.from('servicos').select('id, nome, preco_sugerido').eq('ativo', true).order('nome'),
    ])
    if (clientesRes.data) setClientes(clientesRes.data)
    if (veiculosRes.data) setVeiculos(veiculosRes.data)
    if (mecanicosRes.data) setMecanicos(mecanicosRes.data)
    if (produtosRes.data) setProdutos(produtosRes.data)
    if (servicosRes.data) setServicos(servicosRes.data)
  }

  useEffect(() => { fetchOrdens() }, [search, statusFilter])
  useEffect(() => { if (showModal) fetchFormData() }, [showModal])

  const handleOpenNew = () => {
    setEditingOS(null)
    setSelectedCliente('')
    setSelectedVeiculo('')
    setItens([])
    setShowModal(true)
  }

  const handleViewOS = async (os: OS) => {
    const { data } = await supabase
      .from('ordens_servico')
      .select('*, clientes(*), veiculos(*), mecanicos(*), os_itens(*)')
      .eq('id', os.id)
      .single()
    if (data) {
      setViewOS(data)
      setShowViewModal(true)
    }
  }

  const handleEditOS = async (os: OS) => {
    const { data } = await supabase
      .from('ordens_servico')
      .select('*, os_itens(*)')
      .eq('id', os.id)
      .single()
    if (data) {
      setEditingOS(data)
      setSelectedCliente(data.cliente_id)
      setSelectedVeiculo(data.veiculo_id)
      setItens(data.os_itens || [])
      setShowModal(true)
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const valorTotal = itens.reduce((acc, item) => acc + (item.valor_total || 0), 0)
    const desconto = parseFloat(formData.get('desconto') as string) || 0

    const osData: any = {
      cliente_id: selectedCliente,
      veiculo_id: selectedVeiculo,
      mecanico_id: formData.get('mecanico_id') || null,
      data_previsao: formData.get('data_previsao') || null,
      km_veiculo: parseInt(formData.get('km_veiculo') as string) || null,
      nivel_combustivel: formData.get('nivel_combustivel') || null,
      problemas_relatados: formData.get('problemas_relatados') || null,
      observacoes: formData.get('observacoes') || null,
      valor_total: valorTotal,
      desconto: desconto,
      valor_final: valorTotal - desconto,
      forma_pagamento: formData.get('forma_pagamento') || null,
      itens: itens,
    }

    if (editingOS) {
      await supabase.from('ordens_servico').update(osData).eq('id', editingOS.id)
    } else {
      await supabase.from('ordens_servico').insert([osData])
    }

    setSaving(false)
    setShowModal(false)
    fetchOrdens()
  }

  const handleStatusChange = async (osId: string, newStatus: string) => {
    const updateData: any = { status: newStatus }
    if (newStatus === 'concluida') {
      updateData.data_conclusao = new Date().toISOString()
    }
    await supabase.from('ordens_servico').update(updateData).eq('id', osId)
    fetchOrdens()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
      await supabase.from('ordens_servico').delete().eq('id', id)
      fetchOrdens()
    }
  }

  const addItem = (tipo: 'produto' | 'servico', item: any) => {
    const valorUnitario = tipo === 'produto' ? item.preco_venda : item.preco_sugerido
    const newItem = {
      tipo_item: tipo,
      item_id: item.id,
      descricao: item.nome,
      quantidade: 1,
      valor_unitario: valorUnitario,
      desconto: 0,
      valor_total: valorUnitario,
    }
    setItens([...itens, newItem])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItens = [...itens]
    updatedItens[index][field] = value
    if (field === 'quantidade' || field === 'valor_unitario' || field === 'desconto') {
      const qtd = field === 'quantidade' ? value : updatedItens[index].quantidade
      const valor = field === 'valor_unitario' ? value : updatedItens[index].valor_unitario
      const desc = field === 'desconto' ? value : updatedItens[index].desconto
      updatedItens[index].valor_total = (qtd * valor) - desc
    }
    setItens(updatedItens)
  }

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const totalItens = itens.reduce((acc, item) => acc + (item.valor_total || 0), 0)

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
        <Button onClick={handleOpenNew}>
          <Plus size={18} className="mr-2" /> Nova OS
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos</option>
          <option value="aberta">Aberta</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="aguardando_pecas">Aguardando Peças</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nº OS</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Veículo</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Valor</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ordens.map((os) => (
                    <tr key={os.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">#{os.numero_os}</td>
                      <td className="py-3 px-4">{new Date(os.data_abertura).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4">{(os as any).clientes?.nome || '-'}</td>
                      <td className="py-3 px-4">{(os as any).veiculos?.placa} - {(os as any).veiculos?.modelo}</td>
                      <td className="py-3 px-4">
                        <select
                          value={os.status}
                          onChange={(e) => handleStatusChange(os.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs ${statusColors[os.status]}`}
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(os.valor_final)}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleViewOS(os)} className="text-gray-600 mr-2"><Eye size={18} /></button>
                        <button onClick={() => handleEditOS(os)} className="text-blue-600 mr-2"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(os.id)} className="text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova/Editar OS */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{editingOS ? 'Editar' : 'Nova'} Ordem de Serviço</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {veiculos.filter(v => v.id === selectedVeiculo || !selectedCliente || true).map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mecânico</label>
                  <select name="mecanico_id" defaultValue={editingOS?.mecanico_id || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Selecione</option>
                    {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previsão</label>
                  <Input type="date" name="data_previsao" defaultValue={editingOS?.data_previsao || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KM</label>
                  <Input type="number" name="km_veiculo" defaultValue={editingOS?.km_veiculo || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
                  <select name="nivel_combustivel" defaultValue={editingOS?.nivel_combustivel || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Selecione</option>
                    <option value="1/4">1/4</option>
                    <option value="1/2">1/2</option>
                    <option value="3/4">3/4</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problemas Relatados</label>
                <textarea name="problemas_relatados" rows={2} defaultValue={editingOS?.problemas_relatados || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              {/* Itens da OS */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Itens da OS</h3>
                  <div className="flex gap-2">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          const item = [...produtos, ...servicos].find(i => i.id === e.target.value)
                          if (item) addItem(produtos.find(p => p.id === e.target.value) ? 'produto' : 'servico', item)
                          e.target.value = ''
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Adicionar...</option>
                      <optgroup label="Produtos">
                        {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - {formatCurrency(p.preco_venda)}</option>)}
                      </optgroup>
                      <optgroup label="Serviços">
                        {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} - {formatCurrency(s.preco_sugerido || 0)}</option>)}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {itens.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Descrição</th>
                        <th className="text-right py-2 w-20">Qtd</th>
                        <th className="text-right py-2 w-24">Valor Unit.</th>
                        <th className="text-right py-2 w-24">Desconto</th>
                        <th className="text-right py-2 w-28">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{item.descricao}</td>
                          <td className="py-2">
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantidade}
                              onChange={(e) => updateItem(idx, 'quantidade', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 border rounded text-right"
                            />
                          </td>
                          <td className="py-2">
                            <input 
                              type="number" 
                              step="0.01"
                              value={item.valor_unitario}
                              onChange={(e) => updateItem(idx, 'valor_unitario', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border rounded text-right"
                            />
                          </td>
                          <td className="py-2">
                            <input 
                              type="number" 
                              step="0.01"
                              value={item.desconto}
                              onChange={(e) => updateItem(idx, 'desconto', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border rounded text-right"
                            />
                          </td>
                          <td className="py-2 text-right">{formatCurrency(item.valor_total)}</td>
                          <td className="py-2">
                            <button type="button" onClick={() => removeItem(idx)} className="text-red-600"><X size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="text-right py-2 font-semibold">Total:</td>
                        <td className="text-right py-2 font-bold">{formatCurrency(totalItens)}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum item adicionado</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Desconto" name="desconto" type="number" step="0.01" defaultValue={editingOS?.desconto || '0'} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                  <select name="forma_pagamento" defaultValue={editingOS?.forma_pagamento || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Selecione</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Débito">Cartão Débito</option>
                    <option value="Crédito">Cartão Crédito</option>
                    <option value="Boleto">Boleto</option>
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

      {/* Modal de Visualização */}
      {showViewModal && viewOS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">OS #{viewOS.numero_os}</h2>
              <button onClick={() => setShowViewModal(false)}><X size={24} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{(viewOS as any).clientes?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Veículo</p>
                  <p className="font-medium">{(viewOS as any).veiculos?.placa} - {(viewOS as any).veiculos?.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mecânico</p>
                  <p className="font-medium">{(viewOS as any).mecanicos?.nome || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[viewOS.status]}`}>
                    {statusLabels[viewOS.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Abertura</p>
                  <p className="font-medium">{new Date(viewOS.data_abertura).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Previsão</p>
                  <p className="font-medium">{viewOS.data_previsao ? new Date(viewOS.data_previsao).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
              </div>
              
              {viewOS.problemas_relatados && (
                <div>
                  <p className="text-sm text-gray-500">Problemas Relatados</p>
                  <p>{viewOS.problemas_relatados}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Itens</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Descrição</th>
                      <th className="text-right py-2">Qtd</th>
                      <th className="text-right py-2">Valor</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewOS as any).os_itens?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{item.descricao}</td>
                        <td className="py-2 text-right">{item.quantidade}</td>
                        <td className="py-2 text-right">{formatCurrency(item.valor_unitario)}</td>
                        <td className="py-2 text-right">{formatCurrency(item.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(viewOS.valor_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(viewOS.desconto)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(viewOS.valor_final)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
