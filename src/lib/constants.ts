export const TIPOS_MOVIMENTO_CAIXA = {
  entrada: { label: 'Entrada', color: 'text-green-600' },
  saida: { label: 'Saída', color: 'text-red-600' },
  suprimento: { label: 'Suprimento', color: 'text-blue-600' },
  sangria: { label: 'Sangria', color: 'text-orange-600' },
} as const

export const TIPOS_MOVIMENTO_ESTOQUE = {
  entrada: { label: 'Entrada' },
  saida: { label: 'Saída' },
  ajuste: { label: 'Ajuste' },
} as const

export const STATUS_ORDEM_SERVICO = {
  aberta: { label: 'Aberta', color: 'bg-blue-100 text-blue-800' },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  aguardando_pecas: { label: 'Aguardando Peças', color: 'bg-orange-100 text-orange-800' },
  concluida: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
} as const

export const STATUS_CONTA = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  pago: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  recebido: { label: 'Recebido', color: 'bg-green-100 text-green-800' },
  atrasado: { label: 'Atrasado', color: 'bg-red-100 text-red-800' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
} as const

export const STATUS_AGENDAMENTO = {
  agendado: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
} as const

export type TipoMovimentoCaixa = keyof typeof TIPOS_MOVIMENTO_CAIXA
export type TipoMovimentoEstoque = keyof typeof TIPOS_MOVIMENTO_ESTOQUE
export type StatusOrdemServico = keyof typeof STATUS_ORDEM_SERVICO
export type StatusConta = keyof typeof STATUS_CONTA
export type StatusAgendamento = keyof typeof STATUS_AGENDAMENTO
