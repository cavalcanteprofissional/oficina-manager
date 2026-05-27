import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { mecanicoSchema } from '@/lib/schemas'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase.from('mecanicos').select('id, nome, cpf, email, telefone, celular, especialidades, salario, comissao_percentual, foto_url, observacoes, ativo, created_at').eq('id', id).single()
  if (error) return handleError(error, 'mecanicos/[id]')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()

  const parsed = mecanicoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const allowedFields = ['nome', 'cpf', 'data_contratacao', 'especialidades', 'email', 'telefone', 'celular', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'salario', 'comissao_percentual', 'foto_url', 'observacoes', 'ativo']
  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in parsed.data) {
      updateData[field] = (parsed.data as Record<string, unknown>)[field]
    }
  }

  const { data, error } = await supabase.from('mecanicos').update(updateData).eq('id', id).select('id, nome, cpf, email, telefone, celular, especialidades, salario, comissao_percentual, foto_url, observacoes, ativo, created_at').single()
  if (error) return handleError(error, 'mecanicos/[id]')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('mecanicos').delete().eq('id', id)
  if (error) return handleError(error, 'mecanicos/[id]')
  return NextResponse.json({ success: true })
}
