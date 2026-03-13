import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''
  
  let query = supabase
    .from('usuarios')
    .select('*', { count: 'exact' })
    
  if (search) {
    query = query.or(`nome.ilike.%${search}%`)
  }
  
  if (role) {
    query = query.eq('role', role)
  }
  
  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData.user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }
  
  const { data: usuarioAtual } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', userData.user.id)
    .single()
    
  if (!usuarioAtual || usuarioAtual.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem criar usuários.' }, { status: 403 })
  }
  
  const { id, nome, cpf, telefone, role, ativo } = body
  
  if (!nome || !role) {
    return NextResponse.json({ error: 'Nome e role são obrigatórios' }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from('usuarios')
    .upsert({ id, nome, cpf, telefone, role, ativo })
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
