import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const reajusteSchema = z.object({
  produtos: z.array(z.object({
    id: z.string().uuid(),
    novo_preco: z.number().positive(),
    nova_margem: z.number(),
  })).min(1),
})

export async function POST(request: Request) {
  const supabase = await createClient()
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
      return NextResponse.json({ error: `Erro ao atualizar produto ${produto.id}: ${error.message}` }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true, count: parsed.data.produtos.length })
}
