import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { clienteSchema } from '@/lib/schemas'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'nome'
  const sortOrder = searchParams.get('sortOrder') || 'asc'

  let query = supabase
    .from('clientes')
    .select('id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at', { count: 'exact' })

  if (search) {
    query = query.or(`nome.ilike.%${search}%`).or(`cpf_cnpj.ilike.%${search}%`).or(`telefone1.ilike.%${search}%`)
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    return handleError(error, 'clientes')
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const body = await request.json()

  const parsed = clienteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert([parsed.data])
    .select('id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at')
    .single()

  if (error) {
    return handleError(error, 'clientes')
  }

  return NextResponse.json(data, { status: 201 })
}
