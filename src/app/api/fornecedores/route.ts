import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fornecedorSchema } from '@/lib/schemas'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''

  let query = supabase
    .from('fornecedores')
    .select('id, razao_social, nome_fantasia, cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, contato_nome, observacoes, created_at', { count: 'exact' })

  if (search) {
    query = query.or(`razao_social.ilike.%${search}%`).or(`cnpj.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('razao_social')
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    return handleError(error, 'fornecedores')
  }

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
  })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const body = await request.json()
  const parsed = fornecedorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { data, error } = await supabase.from('fornecedores').insert([parsed.data]).select('id, razao_social, nome_fantasia, cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, contato_nome, observacoes, created_at').single()
  if (error) return handleError(error, 'fornecedores')
  return NextResponse.json(data, { status: 201 })
}
