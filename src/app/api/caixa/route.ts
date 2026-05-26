import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { caixaSchema } from '@/lib/schemas'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const dataInicio = searchParams.get('data_inicio')
  const dataFim = searchParams.get('data_fim')

  let query = supabase
    .from('caixa_movimentos')
    .select('*')
    .order('data_movimento', { ascending: false })

  if (dataInicio) query = query.gte('data_movimento', dataInicio)
  if (dataFim) query = query.lte('data_movimento', dataFim + 'T23:59:59')

  const { data, error } = await query.limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Calcular saldo
  const entradas = data?.filter(m => m.tipo_movimento === 'entrada' || m.tipo_movimento === 'suprimento').reduce((acc, m) => acc + m.valor, 0) || 0
  const saidas = data?.filter(m => m.tipo_movimento === 'saida' || m.tipo_movimento === 'sangria').reduce((acc, m) => acc + m.valor, 0) || 0
  const saldo = entradas - saidas

  return NextResponse.json({ data, entradas, saidas, saldo })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const parsed = caixaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // Buscar último movimento para calcular saldo
  const { data: ultimo } = await supabase
    .from('caixa_movimentos')
    .select('saldo_atual')
    .order('data_movimento', { ascending: false })
    .limit(1)
    .single()

  const saldoAnterior = ultimo?.saldo_atual || 0
  const saldoAtual = parsed.data.tipo_movimento === 'entrada' || parsed.data.tipo_movimento === 'suprimento'
    ? saldoAnterior + parsed.data.valor
    : saldoAnterior - parsed.data.valor

  const { data, error } = await supabase.from('caixa_movimentos').insert([{
    tipo_movimento: parsed.data.tipo_movimento,
    categoria: parsed.data.categoria || null,
    descricao: parsed.data.descricao,
    valor: parsed.data.valor,
    forma_pagamento: parsed.data.forma_pagamento || null,
    saldo_anterior: saldoAnterior,
    saldo_atual: saldoAtual,
    observacoes: parsed.data.observacoes || null,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
