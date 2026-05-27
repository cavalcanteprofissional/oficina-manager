import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'
import { ordemServicoSchema } from '@/lib/schemas'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''

  let query = supabase
    .from('ordens_servico')
    .select('id, numero_os, cliente_id, veiculo_id, mecanico_id, data_abertura, data_previsao, data_conclusao, status, km_veiculo, problemas_relatados, observacoes, valor_total, desconto, valor_final, forma_pagamento, created_at, clientes(nome), veiculos(placa, modelo, marca), mecanicos(nome)', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('data_abertura', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) return handleError(error, 'ordens-servico-list')
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const body = await request.json()
  
  const parsed = ordemServicoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  
  // Calcular valor total dos itens
  let valorTotal = 0
  if (parsed.data.itens && parsed.data.itens.length > 0) {
    valorTotal = parsed.data.itens.reduce((acc, item) => acc + (item.valor_total || 0), 0)
  }
  
  const osData = {
    cliente_id: parsed.data.cliente_id,
    veiculo_id: parsed.data.veiculo_id,
    mecanico_id: parsed.data.mecanico_id || null,
    data_previsao: parsed.data.data_previsao || null,
    km_veiculo: parsed.data.km_veiculo || null,
    nivel_combustivel: parsed.data.nivel_combustivel || null,
    problemas_relatados: parsed.data.problemas_relatados || null,
    observacoes: parsed.data.observacoes || null,
    valor_total: valorTotal,
    desconto: parsed.data.desconto || 0,
    valor_final: valorTotal - (parsed.data.desconto || 0),
    forma_pagamento: parsed.data.forma_pagamento || null,
  }

  const { data: os, error } = await supabase.from('ordens_servico').insert([osData]).select('id, numero_os, cliente_id, veiculo_id, mecanico_id, data_abertura, data_previsao, data_conclusao, status, km_veiculo, problemas_relatados, observacoes, valor_total, desconto, valor_final, forma_pagamento, created_at').single()

  if (error) return handleError(error, 'ordens-servico-create')

  // Inserir itens da OS
  if (parsed.data.itens && parsed.data.itens.length > 0) {
    const itensData = parsed.data.itens.map(item => ({
      os_id: os.id,
      tipo_item: item.tipo_item,
      item_id: item.item_id,
      descricao: item.descricao,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      desconto: item.desconto || 0,
      valor_total: item.valor_total,
      mecanico_id: item.mecanico_id || null,
    }))
    await supabase.from('os_itens').insert(itensData)
  }

  return NextResponse.json(os, { status: 201 })
}
