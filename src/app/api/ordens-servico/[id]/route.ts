import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: os, error } = await supabase
    .from('ordens_servico')
    .select('*, clientes(*), veiculos(*), mecanicos(*), os_itens(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(os)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  // Se há atualização de status para concluída, adicionar data_conclusao
  if (body.status === 'concluida' && !body.data_conclusao) {
    body.data_conclusao = new Date().toISOString()
  }

  // Recalcular valor final se houver itens ou desconto
  if (body.itens) {
    const valorTotal = body.itens.reduce((acc: number, item: any) => acc + (item.valor_total || 0), 0)
    body.valor_total = valorTotal
    body.valor_final = valorTotal - (body.desconto || 0)
  }

  const { data, error } = await supabase
    .from('ordens_servico')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Atualizar itens se houver
  if (body.itens) {
    await supabase.from('os_itens').delete().eq('os_id', id)
    if (body.itens.length > 0) {
      const itensData = body.itens.map((item: any) => ({
        os_id: id,
        tipo_item: item.tipo_item,
        item_id: item.item_id,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        desconto: item.desconto || 0,
        valor_total: item.valor_total,
        mecanico_id: item.mecanico_id || null,
      }))
      await supabase.from('os_itens').insert(itensData)
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
