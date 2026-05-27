import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { clienteSchema } from '@/lib/schemas'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params

  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at')
    .eq('id', id)
    .single()

  if (error) {
    return handleError(error, 'clientes/[id]')
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()

  const parsed = clienteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const allowedFields = ['nome', 'cpf_cnpj', 'rg_ie', 'data_nascimento', 'email', 'telefone1', 'telefone2', 'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'foto_url', 'observacoes']
  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in parsed.data) {
      updateData[field] = (parsed.data as Record<string, unknown>)[field]
    }
  }

  const { data, error } = await supabase
    .from('clientes')
    .update(updateData)
    .eq('id', id)
    .select('id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at')
    .single()

  if (error) {
    return handleError(error, 'clientes/[id]')
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) {
    return handleError(error, 'clientes/[id]')
  }

  return NextResponse.json({ success: true })
}
