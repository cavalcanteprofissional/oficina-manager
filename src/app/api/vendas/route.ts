import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { vendaSchema } from '@/lib/schemas'

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

  const parsed = vendaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { itens, desconto = 0, ...vendaData } = parsed.data
  const subtotal = itens?.reduce((acc, item) => acc + (item.valor_total || 0), 0) || 0

  const { data: venda, error } = await supabase.from('vendas').insert([{
    ...vendaData,
    subtotal,
    total: subtotal - desconto,
    status: 'concluida',
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (itens && itens.length > 0) {
    const itensData = itens.map(item => ({
      venda_id: venda.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      desconto: item.desconto || 0,
      valor_total: item.valor_total,
    }))
    await supabase.from('venda_itens').insert(itensData)

    const produtoIds = itens.filter(i => i.produto_id).map(i => i.produto_id!)
    if (produtoIds.length > 0) {
      const { data: produtos } = await supabase
        .from('produtos')
        .select('id, estoque_atual')
        .in('id', produtoIds)

      if (produtos) {
        for (const produto of produtos) {
          const item = itens.find(i => i.produto_id === produto.id)
          if (item) {
            await supabase.from('produtos').update({
              estoque_atual: (produto.estoque_atual || 0) - item.quantidade
            }).eq('id', produto.id)
          }
        }
      }
    }
  }

  return NextResponse.json(venda, { status: 201 })
}
