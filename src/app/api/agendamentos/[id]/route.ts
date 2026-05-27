import { NextResponse } from 'next/server'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase

  const { id } = await params
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id, cliente_id, veiculo_id, servico_id, data_agendamento, hora_agendamento, mecanico_id, status, observacoes, created_at, clientes(id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at), veiculos(id, placa, marca, modelo, ano_fabricacao, ano_modelo, cor, chassi, renavam, km_atual, combustivel, cliente_id, foto_url, observacoes, created_at), servicos(id, codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo, created_at), mecanicos(id, nome, cpf, email, telefone, celular, especialidades, salario, comissao_percentual, foto_url, observacoes, ativo, created_at)')
    .eq('id', id)
    .single()
  if (error) return handleError(error, 'agendamentos-[id]')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase

  const { id } = await params
  const body = await request.json()
  const { status, observacoes } = body

  const { data, error } = await supabase
    .from('agendamentos')
    .update({ status, observacoes })
    .eq('id', id)
    .select('id, cliente_id, veiculo_id, servico_id, data_agendamento, hora_agendamento, mecanico_id, status, observacoes, created_at')
    .single()

  if (error) return handleError(error, 'agendamentos-[id]')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase

  const { id } = await params
  const { error } = await supabase.from('agendamentos').delete().eq('id', id)
  if (error) return handleError(error, 'agendamentos-[id]')
  return NextResponse.json({ success: true })
}
