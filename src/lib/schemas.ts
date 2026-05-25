import { z } from 'zod'

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf_cnpj: z.string().optional().nullable(),
  rg_ie: z.string().optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  telefone1: z.string().min(1, 'Telefone é obrigatório'),
  telefone2: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  foto_url: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const fornecedorSchema = z.object({
  razao_social: z.string().min(1, 'Razão social é obrigatória'),
  nome_fantasia: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  inscricao_estadual: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  telefone1: z.string().min(1, 'Telefone é obrigatório'),
  telefone2: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  contato_nome: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const mecanicoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional().nullable(),
  data_contratacao: z.string().min(1, 'Data de contratação é obrigatória'),
  especialidades: z.array(z.string()).optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  celular: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  salario: z.number().optional().nullable(),
  comissao_percentual: z.number().optional().nullable(),
  foto_url: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
})

export const veiculoSchema = z.object({
  cliente_id: z.string().uuid('Cliente inválido'),
  placa: z.string().min(1, 'Placa é obrigatória'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano_fabricacao: z.number().int().optional().nullable(),
  ano_modelo: z.number().int().optional().nullable(),
  cor: z.string().optional().nullable(),
  chassi: z.string().optional().nullable(),
  renavam: z.string().optional().nullable(),
  km_atual: z.number().int().optional().nullable(),
  combustivel: z.string().optional().nullable(),
  foto_url: z.array(z.string()).optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const produtoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  codigo_barras: z.string().optional().nullable(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  marca: z.string().optional().nullable(),
  unidade_medida: z.string().optional().nullable(),
  preco_custo: z.number().min(0, 'Preço de custo deve ser positivo'),
  preco_venda: z.number().min(0, 'Preço de venda deve ser positivo'),
  margem_lucro: z.number().optional().nullable(),
  estoque_minimo: z.number().int().optional(),
  estoque_atual: z.number().int().optional(),
  estoque_maximo: z.number().int().optional().nullable(),
  localizacao: z.string().optional().nullable(),
  fornecedor_id: z.string().uuid().optional().nullable(),
  ncm: z.string().optional().nullable(),
  cest: z.string().optional().nullable(),
  origem: z.number().int().optional().nullable(),
  foto_url: z.array(z.string()).optional().nullable(),
  ativo: z.boolean().optional(),
})

export const servicoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  tempo_estimado: z.number().int().optional().nullable(),
  preco_sugerido: z.number().optional().nullable(),
  comissao_percentual: z.number().optional().nullable(),
  ativo: z.boolean().optional(),
})

const osItemSchema = z.object({
  tipo_item: z.string().optional().nullable(),
  item_id: z.string().uuid().optional().nullable(),
  descricao: z.string().min(1, 'Descrição do item é obrigatória'),
  quantidade: z.number().int().min(1, 'Quantidade deve ser no mínimo 1'),
  valor_unitario: z.number().min(0),
  desconto: z.number().optional(),
  valor_total: z.number().min(0),
  mecanico_id: z.string().uuid().optional().nullable(),
})

export const ordemServicoSchema = z.object({
  cliente_id: z.string().uuid('Cliente inválido'),
  veiculo_id: z.string().uuid('Veículo inválido'),
  mecanico_id: z.string().uuid().optional().nullable(),
  data_previsao: z.string().optional().nullable(),
  km_veiculo: z.number().int().optional().nullable(),
  nivel_combustivel: z.string().optional().nullable(),
  problemas_relatados: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  desconto: z.number().optional(),
  forma_pagamento: z.string().optional().nullable(),
  itens: z.array(osItemSchema).optional(),
})

const vendaItemSchema = z.object({
  produto_id: z.string().uuid('Produto inválido'),
  quantidade: z.number().int().min(1, 'Quantidade deve ser no mínimo 1'),
  valor_unitario: z.number().min(0),
  desconto: z.number().optional(),
  valor_total: z.number().min(0),
})

export const vendaSchema = z.object({
  cliente_id: z.string().uuid().optional().nullable(),
  tipo_venda: z.string().optional(),
  os_id: z.string().uuid().optional().nullable(),
  forma_pagamento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  desconto: z.number().optional(),
  itens: z.array(vendaItemSchema).optional(),
})

export const estoqueSchema = z.object({
  produto_id: z.string().uuid('Produto inválido'),
  tipo_movimento: z.enum(['entrada', 'saida', 'ajuste']),
  quantidade: z.number().int().min(1, 'Quantidade deve ser positiva'),
  documento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const agendamentoSchema = z.object({
  cliente_id: z.string().uuid('Cliente inválido'),
  veiculo_id: z.string().uuid('Veículo inválido'),
  servico_id: z.string().uuid().optional().nullable(),
  data_agendamento: z.string().min(1, 'Data é obrigatória'),
  hora_agendamento: z.string().min(1, 'Hora é obrigatória'),
  mecanico_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const contaPagarSchema = z.object({
  fornecedor_id: z.string().uuid().optional().nullable(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  documento: z.string().optional().nullable(),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  juros: z.number().optional(),
  multa: z.number().optional(),
  desconto: z.number().optional(),
  categoria: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const contaReceberSchema = z.object({
  cliente_id: z.string().uuid().optional().nullable(),
  venda_id: z.string().uuid().optional().nullable(),
  os_id: z.string().uuid().optional().nullable(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  documento: z.string().optional().nullable(),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  juros: z.number().optional(),
  multa: z.number().optional(),
  desconto: z.number().optional(),
  forma_recebimento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const caixaSchema = z.object({
  tipo_movimento: z.enum(['entrada', 'saida', 'suprimento', 'sangria']),
  categoria: z.string().optional().nullable(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  forma_pagamento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})

export const usuarioSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  role: z.enum(['admin', 'gerente', 'mecanico', 'caixa', 'comum']),
  ativo: z.boolean().optional(),
})
