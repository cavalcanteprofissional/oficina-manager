import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase.from('servicos').select('id, codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo, created_at').eq('id', id).single()
  if (error) return handleError(error, 'servicos-get')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()

  // Field whitelist - only allow explicitly listed fields to be updated
  const { codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo } = body

  const updateData: Record<string, unknown> = {
    codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo
  }

  // Remove undefined fields
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

  const { data, error } = await supabase.from('servicos').update(updateData).eq('id', id).select('id, codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo, created_at').single()
  if (error) return handleError(error, 'servicos-update')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('servicos').delete().eq('id', id)
  if (error) return handleError(error, 'servicos-delete')
  return NextResponse.json({ success: true })
}
