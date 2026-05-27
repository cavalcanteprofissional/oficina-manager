import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { fornecedorSchema } from '@/lib/schemas'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { data, error } = await supabase.from('fornecedores').select('id, razao_social, nome_fantasia, cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, contato_nome, observacoes, created_at').eq('id', id).single()
  if (error) return handleError(error, 'fornecedores/[id]')
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()

  const parsed = fornecedorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const allowedFields = ['razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual', 'email', 'telefone1', 'telefone2', 'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'contato_nome', 'observacoes']
  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in parsed.data) {
      updateData[field] = (parsed.data as Record<string, unknown>)[field]
    }
  }

  const { data, error } = await supabase.from('fornecedores').update(updateData).eq('id', id).select('id, razao_social, nome_fantasia, cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, contato_nome, observacoes, created_at').single()
  if (error) return handleError(error, 'fornecedores/[id]')
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('fornecedores').delete().eq('id', id)
  if (error) return handleError(error, 'fornecedores/[id]')
  return NextResponse.json({ success: true })
}
