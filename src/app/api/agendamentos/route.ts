import { NextResponse } from 'next/server'
import { agendamentoSchema } from '@/lib/schemas'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase

  const { searchParams } = new URL(request.url)
  const dataInicio = searchParams.get('data_inicio')
  const dataFim = searchParams.get('data_fim')

  let query = supabase
    .from('agendamentos')
    .select('id, cliente_id, veiculo_id, servico_id, data_agendamento, hora_agendamento, mecanico_id, status, observacoes, created_at, clientes(nome), veiculos(placa, modelo), servicos(nome), mecanicos(nome)')

  if (dataInicio) query = query.gte('data_agendamento', dataInicio)
  if (dataFim) query = query.lte('data_agendamento', dataFim)

  const { data, error } = await query.order('data_agendamento').order('hora_agendamento')

  if (error) return handleError(error, 'agendamentos')
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase

  const body = await request.json()
  
  const parsed = agendamentoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error } = await supabase.from('agendamentos').insert([{
    cliente_id: parsed.data.cliente_id,
    veiculo_id: parsed.data.veiculo_id,
    servico_id: parsed.data.servico_id || null,
    data_agendamento: parsed.data.data_agendamento,
    hora_agendamento: parsed.data.hora_agendamento,
    mecanico_id: parsed.data.mecanico_id || null,
    status: 'agendado',
    observacoes: parsed.data.observacoes || null,
  }]).select('id, cliente_id, veiculo_id, servico_id, data_agendamento, hora_agendamento, mecanico_id, status, observacoes, created_at').single()

  if (error) return handleError(error, 'agendamentos')
  return NextResponse.json(data, { status: 201 })
}
