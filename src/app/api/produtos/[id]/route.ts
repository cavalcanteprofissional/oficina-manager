import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase.from('produtos').select('id, codigo, nome, descricao, categoria, marca, unidade_medida, preco_custo, preco_venda, margem_lucro, estoque_atual, estoque_minimo, localizacao, fornecedor_id, foto_url, ativo, created_at').eq('id', id).single()
  if (error) return handleError(error, 'produtos-get')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()

  // Field whitelist - only allow explicitly listed fields to be updated
  const { codigo, codigo_barras, nome, descricao, categoria, marca, unidade_medida, preco_custo, preco_venda, margem_lucro, estoque_minimo, estoque_atual, estoque_maximo, localizacao, fornecedor_id, ncm, cest, origem, foto_url, ativo } = body

  const updateData: Record<string, unknown> = {
    codigo, codigo_barras, nome, descricao, categoria, marca, unidade_medida,
    preco_custo, preco_venda, margem_lucro, estoque_minimo, estoque_atual,
    estoque_maximo, localizacao, fornecedor_id, ncm, cest, origem, foto_url, ativo
  }

  // Remove undefined fields
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

  if (updateData.preco_custo && updateData.preco_venda) {
    updateData.margem_lucro = ((Number(updateData.preco_venda) - Number(updateData.preco_custo)) / Number(updateData.preco_custo)) * 100
  }

  const { data, error } = await supabase.from('produtos').update(updateData).eq('id', id).select('id, codigo, nome, descricao, categoria, marca, unidade_medida, preco_custo, preco_venda, margem_lucro, estoque_atual, estoque_minimo, localizacao, fornecedor_id, foto_url, ativo, created_at').single()
  if (error) return handleError(error, 'produtos-update')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  if (error) return handleError(error, 'produtos-delete')
  return NextResponse.json({ success: true })
}
