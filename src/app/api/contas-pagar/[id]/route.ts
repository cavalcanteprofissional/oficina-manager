import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase
    .from('contas_pagar')
    .select('id, fornecedor_id, descricao, documento, data_emissao, data_vencimento, data_pagamento, valor, valor_pago, juros, multa, desconto, status, categoria, created_at, fornecedores(id, razao_social, nome_fantasia, cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, contato_nome, observacoes, created_at)')
    .eq('id', id)
    .single()
  if (error) return handleError(error, 'contas-pagar-id')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()
  const { descricao, documento, data_emissao, data_vencimento, valor, juros, multa, desconto, categoria, observacoes, status, data_pagamento, valor_pago, fornecedor_id } = body

  // Se status for pago, registrar data de pagamento
  if (status === 'pago' && !data_pagamento) {
    body.data_pagamento = new Date().toISOString().split('T')[0]
    body.valor_pago = (valor || 0) + (juros || 0) + (multa || 0) - (desconto || 0)
  }

  const { data, error } = await supabase
    .from('contas_pagar')
    .update({ descricao, documento, data_emissao, data_vencimento, valor, juros, multa, desconto, categoria, observacoes, status, data_pagamento: body.data_pagamento, valor_pago: body.valor_pago, fornecedor_id })
    .eq('id', id)
    .select('id, fornecedor_id, descricao, documento, data_emissao, data_vencimento, data_pagamento, valor, valor_pago, juros, multa, desconto, status, categoria, created_at')
    .single()

  if (error) return handleError(error, 'contas-pagar-id')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('contas_pagar').delete().eq('id', id)
  if (error) return handleError(error, 'contas-pagar-id')
  return NextResponse.json({ success: true })
}
