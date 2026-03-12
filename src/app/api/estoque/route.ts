import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  let query = supabase
    .from('produtos')
    .select('*, fornecedores(razao_social)', { count: 'exact' })
    .eq('ativo', true)

  if (search) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
  }

  const { data, error } = await query.order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Buscar produto atual
  const { data: produto } = await supabase.from('produtos').select('estoque_atual').eq('id', body.produto_id).single()
  
  if (!produto) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const saldoAnterior = produto.estoque_atual || 0
  const saldoAtual = body.tipo_movimento === 'entrada' 
    ? saldoAnterior + body.quantidade 
    : saldoAnterior - body.quantidade

  // Atualizar estoque do produto
  await supabase.from('produtos').update({ estoque_atual: saldoAtual }).eq('id', body.produto_id)

  // Registrar movimento
  const { data, error } = await supabase.from('estoque_movimentos').insert([{
    produto_id: body.produto_id,
    tipo_movimento: body.tipo_movimento,
    quantidade: body.quantidade,
    saldo_anterior: saldoAnterior,
    saldo_atual: saldoAtual,
    documento: body.documento || null,
    observacoes: body.observacoes || null,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
