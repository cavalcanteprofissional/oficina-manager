import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { veiculoSchema } from '@/lib/schemas'
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
    .from('veiculos')
    .select('id, placa, marca, modelo, ano_fabricacao, ano_modelo, cor, chassi, renavam, km_atual, combustivel, cliente_id, foto_url, observacoes, created_at, clientes(nome)', { count: 'exact' })

  if (search) {
    query = query.or(`placa.ilike.%${search}%`).or(`marca.ilike.%${search}%`).or(`modelo.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('placa')
    .range((page - 1) * limit, page * limit - 1)

  if (error) return handleError(error, 'veiculos')
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const body = await request.json()
  const parsed = veiculoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { data, error } = await supabase.from('veiculos').insert([parsed.data]).select('id, placa, marca, modelo, ano_fabricacao, ano_modelo, cor, chassi, renavam, km_atual, combustivel, cliente_id, foto_url, observacoes, created_at').single()
  if (error) return handleError(error, 'veiculos')
  return NextResponse.json(data, { status: 201 })
}
