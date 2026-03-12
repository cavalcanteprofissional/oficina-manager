import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const { data, count, error } = await supabase
    .from('vendas')
    .select('*, clientes(nome)', { count: 'exact' })
    .order('data_venda', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const subtotal = body.itens?.reduce((acc: number, item: any) => acc + (item.valor_total || 0), 0) || 0
  const desconto = body.desconto || 0

  const { data: venda, error } = await supabase.from('vendas').insert([{
    cliente_id: body.cliente_id || null,
    tipo_venda: body.tipo_venda || 'balcao',
    os_id: body.os_id || null,
    subtotal,
    desconto,
    total: subtotal - desconto,
    forma_pagamento: body.forma_pagamento || null,
    status: 'concluida',
    observacoes: body.observacoes || null,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Inserir itens e atualizar estoque
  if (body.itens && body.itens.length > 0) {
    const itensData = body.itens.map((item: any) => ({
      venda_id: venda.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      desconto: item.desconto || 0,
      valor_total: item.valor_total,
    }))
    await supabase.from('venda_itens').insert(itensData)

    // Atualizar estoque
    for (const item of body.itens) {
      if (item.produto_id) {
        const { data: produto } = await supabase.from('produtos').select('estoque_atual').eq('id', item.produto_id).single()
        if (produto) {
          await supabase.from('produtos').update({ 
            estoque_atual: (produto.estoque_atual || 0) - item.quantidade 
          }).eq('id', item.produto_id)
        }
      }
    }
  }

  return NextResponse.json(venda, { status: 201 })
}
