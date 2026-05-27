import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase
    .from('vendas')
    .select('id, numero_venda, cliente_id, data_venda, tipo_venda, subtotal, desconto, total, forma_pagamento, status, created_at, clientes(id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at), venda_itens(id, venda_id, produto_id, quantidade, valor_unitario, desconto, valor_total, created_at, produtos(id, codigo, nome, descricao, categoria, marca, unidade_medida, preco_custo, preco_venda, margem_lucro, estoque_atual, estoque_minimo, localizacao, fornecedor_id, foto_url, ativo, created_at))')
    .eq('id', id)
    .single()
  if (error) return handleError(error, 'vendas-id')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('vendas').delete().eq('id', id)
  if (error) return handleError(error, 'vendas-id')
  return NextResponse.json({ success: true })
}
