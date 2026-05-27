import { createClient } from './server'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), user: null, supabase }
  }

  return { error: null, user, supabase }
}

export async function requireRole(...roles: string[]) {
  const result = await requireAuth()
  if (result.error) return result

  const { data: usuario } = await result.supabase
    .from('usuarios')
    .select('role')
    .eq('id', result.user.id)
    .single()

  if (!usuario || !roles.includes(usuario.role)) {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }), user: null, supabase: result.supabase }
  }

  return { error: null, user: result.user, supabase: result.supabase, role: usuario.role }
}

export function handleError(error: unknown, context: string) {
  console.error(`[${context}]`, error)
  return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 400 })
}

export function handleAuthError(error: unknown, context: string) {
  console.error(`[${context}] Auth error:`, error)
  return NextResponse.json({ error: 'Erro de autenticação' }, { status: 500 })
}
