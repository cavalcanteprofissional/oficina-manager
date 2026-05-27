import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, cpf, telefone, role, ativo, created_at')
    .eq('id', id)
    .single()
    
  if (error) {
    return handleError(error, 'usuarios-[id]')
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
    .select('id, nome, cpf, telefone, role, ativo, created_at')
    .single()
    
  if (error) {
    return handleError(error, 'usuarios-[id]')
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
    return handleError(error, 'usuarios-[id]')
  }
  
  return NextResponse.json({ success: true })
}
