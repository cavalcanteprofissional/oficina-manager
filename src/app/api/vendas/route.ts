import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'
import { vendaSchema } from '@/lib/schemas'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const { data, count, error } = await supabase
    .from('vendas')
    .select('id, numero_venda, cliente_id, data_venda, tipo_venda, subtotal, desconto, total, forma_pagamento, status, created_at, clientes(nome)', { count: 'exact' })
    .order('data_venda', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) return handleError(error, 'vendas')
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente', 'caixa')
  if (auth.error) return auth.error
  const supabase = auth.supabase
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
  }]).select('id, numero_venda, cliente_id, data_venda, tipo_venda, subtotal, desconto, total, forma_pagamento, status, created_at').single()

  if (error) return handleError(error, 'vendas')

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
            const saldoAnterior = produto.estoque_atual || 0
            const quantidade = item.quantidade
            const saldoAtual = saldoAnterior - quantidade

            await supabase.from('produtos').update({
              estoque_atual: saldoAtual
            }).eq('id', produto.id)

            await supabase.from('estoque_movimentos').insert({
              produto_id: produto.id,
              tipo_movimento: 'saida',
              quantidade,
              saldo_anterior: saldoAnterior,
              saldo_atual: saldoAtual,
              documento: `Venda #${venda.numero_venda}`,
              documento_id: venda.id,
            })
          }
        }
      }
    }
  }

  return NextResponse.json(venda, { status: 201 })
}
