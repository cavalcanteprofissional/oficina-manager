import { requireAuth, requireRole, handleError } from '@/lib/supabase/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params

  const { data: os, error } = await supabase
    .from('ordens_servico')
    .select('id, numero_os, cliente_id, veiculo_id, mecanico_id, data_abertura, data_previsao, data_conclusao, status, km_veiculo, problemas_relatados, observacoes, valor_total, desconto, valor_final, forma_pagamento, created_at, clientes(id, nome, cpf_cnpj, email, telefone1, telefone2, endereco, numero, bairro, cidade, estado, data_nascimento, foto_url, observacoes, created_at), veiculos(id, placa, marca, modelo, ano_fabricacao, ano_modelo, cor, chassi, renavam, km_atual, combustivel, cliente_id, foto_url, observacoes, created_at), mecanicos(id, nome, cpf, email, telefone, celular, especialidades, salario, comissao_percentual, foto_url, observacoes, ativo, created_at), os_itens(id, os_id, tipo_item, item_id, descricao, quantidade, valor_unitario, desconto, valor_total, mecanico_id, created_at)')
    .eq('id', id)
    .single()

  if (error) return handleError(error, 'ordens-servico-get')
  return NextResponse.json(os)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin', 'gerente')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const body = await request.json()

  // Field whitelist - only allow explicitly listed fields to be updated
  const { cliente_id, veiculo_id, mecanico_id, data_previsao, data_conclusao, km_veiculo, nivel_combustivel, problemas_relatados, observacoes, status, desconto, forma_pagamento, itens } = body

  const updateData: Record<string, unknown> = {
    cliente_id, veiculo_id, mecanico_id, data_previsao, data_conclusao,
    km_veiculo, nivel_combustivel, problemas_relatados, observacoes,
    status, desconto, forma_pagamento,
  }

  // Remove undefined fields
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

  // Se há atualização de status para concluída, adicionar data_conclusao
  if (updateData.status === 'concluida' && !updateData.data_conclusao) {
    updateData.data_conclusao = new Date().toISOString()
  }

  // Recalcular valor final se houver itens
  if (itens) {
    const valorTotal = itens.reduce((acc: number, item: { valor_total?: number }) => acc + (item.valor_total || 0), 0)
    updateData.valor_total = valorTotal
    updateData.valor_final = valorTotal - (Number(updateData.desconto) || 0)
  }

  const { data, error } = await supabase
    .from('ordens_servico')
    .update(updateData)
    .eq('id', id)
    .select('id, numero_os, cliente_id, veiculo_id, mecanico_id, data_abertura, data_previsao, data_conclusao, status, km_veiculo, problemas_relatados, observacoes, valor_total, desconto, valor_final, forma_pagamento, created_at')
    .single()

  if (error) return handleError(error, 'ordens-servico-update')

  // Atualizar itens se houver
  if (itens) {
    await supabase.from('os_itens').delete().eq('os_id', id)
    if (itens.length > 0) {
      const itensData = itens.map((item: { tipo_item: string; item_id: string; descricao: string; quantidade: number; valor_unitario: number; desconto: number; valor_total?: number; mecanico_id?: string | null }) => ({
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
  const auth = await requireRole('admin')
  if (auth.error) return auth.error
  const supabase = auth.supabase
  const { id } = await params
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id)
  if (error) return handleError(error, 'ordens-servico-delete')
  return NextResponse.json({ success: true })
}
