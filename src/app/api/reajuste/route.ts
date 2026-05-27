import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole, handleError } from '@/lib/supabase/auth-helpers'

const reajusteSchema = z.object({
  produtos: z.array(z.object({
    id: z.string().uuid(),
    novo_preco: z.number().positive(),
    nova_margem: z.number(),
  })).min(1),
})

export async function POST(request: Request) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase

  const body = await request.json()

  const parsed = reajusteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  for (const produto of parsed.data.produtos) {
    const { error } = await supabase.from('produtos').update({
      preco_venda: produto.novo_preco,
      margem_lucro: produto.nova_margem,
    }).eq('id', produto.id)

    if (error) {
      return handleError(error, 'reajuste')
    }
  }

  return NextResponse.json({ success: true, count: parsed.data.produtos.length })
}
