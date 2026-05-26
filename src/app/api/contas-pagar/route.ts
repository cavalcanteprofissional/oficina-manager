import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { contaPagarSchema } from '@/lib/schemas'

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
  
  const parsed = contaPagarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error } = await supabase.from('contas_pagar').insert([{
    fornecedor_id: parsed.data.fornecedor_id || null,
    descricao: parsed.data.descricao,
    documento: parsed.data.documento || null,
    data_emissao: parsed.data.data_emissao,
    data_vencimento: parsed.data.data_vencimento,
    valor: parsed.data.valor,
    juros: parsed.data.juros || 0,
    multa: parsed.data.multa || 0,
    desconto: parsed.data.desconto || 0,
    categoria: parsed.data.categoria || null,
    observacoes: parsed.data.observacoes || null,
    status: 'pendente',
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
