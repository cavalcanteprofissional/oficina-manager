import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
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
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem editar usuários.' }, { status: 403 })
  }
  
  const body = await request.json()
  const { nome, cpf, telefone, role, ativo } = body
  
  const { data, error } = await supabase
    .from('usuarios')
    .update({ nome, cpf, telefone, role, ativo })
    .eq('id', id)
    .select()
    .single()
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
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
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem excluir usuários.' }, { status: 403 })
  }
  
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({ success: true })
}
