import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('contas_pagar')
    .select('*, fornecedores(razao_social)', { count: 'exact' })
    .order('data_vencimento')

  if (status) query = query.eq('status', status)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, pagination: { total: count || 0 } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase.from('contas_pagar').insert([{
    fornecedor_id: body.fornecedor_id || null,
    descricao: body.descricao,
    documento: body.documento || null,
    data_emissao: body.data_emissao,
    data_vencimento: body.data_vencimento,
    valor: body.valor,
    juros: body.juros || 0,
    multa: body.multa || 0,
    desconto: body.desconto || 0,
    categoria: body.categoria || null,
    observacoes: body.observacoes || null,
    status: 'pendente',
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
