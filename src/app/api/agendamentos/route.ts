import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const dataInicio = searchParams.get('data_inicio')
  const dataFim = searchParams.get('data_fim')

  let query = supabase
    .from('agendamentos')
    .select('*, clientes(nome), veiculos(placa, modelo), servicos(nome), mecanicos(nome)')

  if (dataInicio) query = query.gte('data_agendamento', dataInicio)
  if (dataFim) query = query.lte('data_agendamento', dataFim)

  const { data, error } = await query.order('data_agendamento').order('hora_agendamento')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase.from('agendamentos').insert([{
    cliente_id: body.cliente_id,
    veiculo_id: body.veiculo_id,
    servico_id: body.servico_id || null,
    data_agendamento: body.data_agendamento,
    hora_agendamento: body.hora_agendamento,
    mecanico_id: body.mecanico_id || null,
    status: 'agendado',
    observacoes: body.observacoes || null,
  }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
