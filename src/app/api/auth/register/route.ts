import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registerSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { nome, email, senha } = parsed.data
    const supabaseAdmin = await createAdminClient()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    })
    if (authError) {
      return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 })
    }

    const { error: insertError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nome,
        role: 'comum',
        ativo: true,
      })

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Conta criada com sucesso!' })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
