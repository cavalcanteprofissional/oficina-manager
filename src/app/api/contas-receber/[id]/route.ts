import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase
    .from('contas_receber')
    .select('id, cliente_id, venda_id, os_id, descricao, documento, data_emissao, data_vencimento, data_recebimento, valor, valor_recebido, juros, multa, desconto, status, forma_recebimento, created_at, clientes(id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at), vendas(id, numero_venda, cliente_id, data_venda, tipo_venda, subtotal, desconto, total, forma_pagamento, status, created_at), ordens_servico(id, numero_os, cliente_id, veiculo_id, mecanico_id, data_abertura, data_previsao, data_conclusao, status, km_veiculo, problemas_relatados, observacoes, valor_total, desconto, valor_final, forma_pagamento, created_at)')
    .eq('id', id)
    .single()
  if (error) return handleError(error, 'contas-receber-id')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()
  const { cliente_id, venda_id, os_id, descricao, documento, data_emissao, data_vencimento, valor, juros, multa, desconto, status, data_recebimento, valor_recebido, forma_recebimento, observacoes } = body

  if (status === 'recebido' && !data_recebimento) {
    body.data_recebimento = new Date().toISOString().split('T')[0]
    body.valor_recebido = (valor || 0) + (juros || 0) + (multa || 0) - (desconto || 0)
  }

  const { data, error } = await supabase
    .from('contas_receber')
    .update({ cliente_id, venda_id, os_id, descricao, documento, data_emissao, data_vencimento, valor, juros, multa, desconto, status, data_recebimento: body.data_recebimento, valor_recebido: body.valor_recebido, forma_recebimento, observacoes })
    .eq('id', id)
    .select('id, cliente_id, venda_id, os_id, descricao, documento, data_emissao, data_vencimento, data_recebimento, valor, valor_recebido, juros, multa, desconto, status, forma_recebimento, created_at')
    .single()

  if (error) return handleError(error, 'contas-receber-id')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('contas_receber').delete().eq('id', id)
  if (error) return handleError(error, 'contas-receber-id')
  return NextResponse.json({ success: true })
}
