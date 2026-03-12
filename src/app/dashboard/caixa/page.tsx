'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Loader2, X, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface Movimento {
  id: string
  data_movimento: string
  tipo_movimento: string
  categoria: string | null
  descricao: string
  valor: number
  forma_pagamento: string | null
  saldo_anterior: number
  saldo_atual: number
}

export default function CaixaPage() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saldo, setSaldo] = useState(0)
  const [entradas, setEntradas] = useState(0)
  const [saidas, setSaidas] = useState(0)
  const supabase = createClient()

  const fetchMovimentos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('caixa_movimentos')
      .select('*')
      .order('data_movimento', { ascending: false })
      .limit(50)
    
    if (data) {
      setMovimentos(data)
      const ent = data.filter(m => m.tipo_movimento === 'entrada' || m.tipo_movimento === 'suprimento').reduce((acc, m) => acc + m.valor, 0)
      const sai = data.filter(m => m.tipo_movimento === 'saida' || m.tipo_movimento === 'sangria').reduce((acc, m) => acc + m.valor, 0)
      setEntradas(ent)
      setSaidas(sai)
      setSaldo(ent - sai)
    }
    setLoading(false)
  }

  useEffect(() => { fetchMovimentos() }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('caixa_movimentos').insert([{
      tipo_movimento: formData.get('tipo_movimento'),
      descricao: formData.get('descricao'),
      valor: parseFloat(formData.get('valor') as string),
      forma_pagamento: formData.get('forma_pagamento') || null,
      categoria: formData.get('categoria') || null,
    }])

    setSaving(false)
    setShowModal(false)
    fetchMovimentos()
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Nova Movimentação
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Entradas</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(entradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saídas</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(saidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className={`text-xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(saldo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-left py-3 px-4">Descrição</th>
                    <th className="text-right py-3 px-4">Valor</th>
                    <th className="text-right py-3 px-4">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(m.data_movimento).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          m.tipo_movimento === 'entrada' || m.tipo_movimento === 'suprimento'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {m.tipo_movimento === 'entrada' ? 'Entrada' :
                           m.tipo_movimento === 'saida' ? 'Saída' :
                           m.tipo_movimento === 'suprimento' ? 'Suprimento' : 'Sangria'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{m.descricao}</td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        m.tipo_movimento === 'entrada' || m.tipo_movimento === 'suprimento'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {m.tipo_movimento === 'entrada' || m.tipo_movimento === 'suprimento' ? '+' : '-'}
                        {formatCurrency(m.valor)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(m.saldo_atual)}
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
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Nova Movimentação</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select name="tipo_movimento" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="suprimento">Suprimento</option>
                  <option value="sangria">Sangria</option>
                </select>
              </div>
              <Input label="Descrição *" name="descricao" required />
              <Input label="Valor *" name="valor" type="number" step="0.01" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select name="forma_pagamento" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Débito">Cartão Débito</option>
                  <option value="Crédito">Cartão Crédito</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>
              <Input label="Categoria" name="categoria" />
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
