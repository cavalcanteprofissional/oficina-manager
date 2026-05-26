import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { produtoSchema } from '@/lib/schemas'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''

  let query = supabase
    .from('produtos')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%,codigo_barras.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('nome')
    .range((page - 1) * limit, page * limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const parsed = produtoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  
  // Calcular margem de lucro se não fornecida
  if (parsed.data.preco_custo && parsed.data.preco_venda && !parsed.data.margem_lucro) {
    parsed.data.margem_lucro = ((parsed.data.preco_venda - parsed.data.preco_custo) / parsed.data.preco_custo) * 100
  }
  
  const { data, error } = await supabase.from('produtos').insert([parsed.data]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
