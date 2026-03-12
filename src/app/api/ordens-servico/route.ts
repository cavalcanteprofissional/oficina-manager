import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''

  let query = supabase
    .from('ordens_servico')
    .select('*, clientes(nome), veiculos(placa, modelo, marca), mecanicos(nome)', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('data_abertura', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Calcular valor total dos itens
  let valorTotal = 0
  if (body.itens && body.itens.length > 0) {
    valorTotal = body.itens.reduce((acc: number, item: any) => acc + (item.valor_total || 0), 0)
  }
  
  const osData = {
    cliente_id: body.cliente_id,
    veiculo_id: body.veiculo_id,
    mecanico_id: body.mecanico_id || null,
    data_previsao: body.data_previsao || null,
    km_veiculo: body.km_veiculo || null,
    nivel_combustivel: body.nivel_combustivel || null,
    problemas_relatados: body.problemas_relatados || null,
    observacoes: body.observacoes || null,
    valor_total: valorTotal,
    desconto: body.desconto || 0,
    valor_final: valorTotal - (body.desconto || 0),
    forma_pagamento: body.forma_pagamento || null,
  }

  const { data: os, error } = await supabase.from('ordens_servico').insert([osData]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Inserir itens da OS
  if (body.itens && body.itens.length > 0) {
    const itensData = body.itens.map((item: any) => ({
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
