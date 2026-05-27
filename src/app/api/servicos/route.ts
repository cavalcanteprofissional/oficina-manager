import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'
import { servicoSchema } from '@/lib/schemas'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''

  let query = supabase.from('servicos').select('id, codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo, created_at', { count: 'exact' })

  if (search) query = query.or(`nome.ilike.%${search}%`).or(`codigo.ilike.%${search}%`)

  const { data, count, error } = await query
    .order('nome')
    .range((page - 1) * limit, page * limit - 1)

  if (error) return handleError(error, 'servicos-list')
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const body = await request.json()
  const parsed = servicoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { data, error } = await supabase.from('servicos').insert([parsed.data]).select('id, codigo, nome, descricao, categoria, tempo_estimado, preco_sugerido, comissao_percentual, ativo, created_at').single()
  if (error) return handleError(error, 'servicos-create')
  return NextResponse.json(data, { status: 201 })
}
