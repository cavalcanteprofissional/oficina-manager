import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { mecanicoSchema } from '@/lib/schemas'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const ativo = searchParams.get('ativo')

  let query = supabase.from('mecanicos').select('id, nome, cpf, email, telefone, celular, especialidades, salario, comissao_percentual, foto_url, observacoes, ativo, created_at', { count: 'exact' })

  if (search) query = query.or(`nome.ilike.%${search}%`).or(`cpf.ilike.%${search}%`)
  if (ativo) query = query.eq('ativo', ativo === 'true')

  const { data, count, error } = await query
    .order('nome')
    .range((page - 1) * limit, page * limit - 1)

  if (error) return handleError(error, 'mecanicos')
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const body = await request.json()
  const parsed = mecanicoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { data, error } = await supabase.from('mecanicos').insert([parsed.data]).select('id, nome, cpf, email, telefone, celular, especialidades, salario, comissao_percentual, foto_url, observacoes, ativo, created_at').single()
  if (error) return handleError(error, 'mecanicos')
  return NextResponse.json(data, { status: 201 })
}
