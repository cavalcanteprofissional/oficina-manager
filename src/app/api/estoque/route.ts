import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { estoqueSchema } from '@/lib/schemas'

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
  
  const parsed = estoqueSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Buscar produto atual
  const { data: produto } = await supabase.from('produtos').select('estoque_atual').eq('id', parsed.data.produto_id).single()
  
  if (!produto) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const saldoAnterior = produto.estoque_atual || 0
  const saldoAtual = parsed.data.tipo_movimento === 'entrada' 
    ? saldoAnterior + parsed.data.quantidade 
    : saldoAnterior - parsed.data.quantidade

  // Atualizar estoque do produto
  await supabase.from('produtos').update({ estoque_atual: saldoAtual }).eq('id', parsed.data.produto_id)

  // Registrar movimento
  const { data, error } = await supabase.from('estoque_movimentos').insert([{
    produto_id: parsed.data.produto_id,
    tipo_movimento: parsed.data.tipo_movimento,
    quantidade: parsed.data.quantidade,
    saldo_anterior: saldoAnterior,
    saldo_atual: saldoAtual,
    documento: parsed.data.documento || null,
    observacoes: parsed.data.observacoes || null,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
