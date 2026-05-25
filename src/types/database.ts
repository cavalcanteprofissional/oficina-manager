export interface Cliente {
  id: string
  nome: string
  cpf_cnpj?: string | null
  rg_ie?: string | null
  data_nascimento?: string | null
  email?: string | null
  telefone1: string
  telefone2?: string | null
  cep?: string | null
  endereco?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  foto_url?: string | null
  observacoes?: string | null
  created_at?: string
  updated_at?: string
}

export interface Fornecedor {
  id: string
  razao_social: string
  nome_fantasia?: string | null
  cnpj?: string | null
  inscricao_estadual?: string | null
  email?: string | null
  telefone1: string
  telefone2?: string | null
  cep?: string | null
  endereco?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  contato_nome?: string | null
  observacoes?: string | null
  created_at?: string
  updated_at?: string
}

export interface Mecanico {
  id: string
  nome: string
  cpf?: string | null
  data_contratacao: string
  especialidades?: string[] | null
  email?: string | null
  telefone: string
  celular?: string | null
  cep?: string | null
  endereco?: string | null
  numero?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  salario?: number | null
  comissao_percentual?: number | null
  foto_url?: string | null
  observacoes?: string | null
  ativo?: boolean
  created_at?: string
  updated_at?: string
}

export interface Veiculo {
  id: string
  cliente_id: string
  placa: string
  marca: string
  modelo: string
  ano_fabricacao?: number | null
  ano_modelo?: number | null
  cor?: string | null
  chassi?: string | null
  renavam?: string | null
  km_atual?: number | null
  combustivel?: string | null
  foto_url?: string[] | null
  observacoes?: string | null
  created_at?: string
  updated_at?: string
}

export interface Produto {
  id: string
  codigo: string
  codigo_barras?: string | null
  nome: string
  descricao?: string | null
  categoria?: string | null
  marca?: string | null
  unidade_medida?: string | null
  preco_custo: number
  preco_venda: number
  margem_lucro?: number | null
  estoque_minimo?: number
  estoque_atual?: number
  estoque_maximo?: number | null
  localizacao?: string | null
  fornecedor_id?: string | null
  ncm?: string | null
  cest?: string | null
  origem?: number | null
  foto_url?: string[] | null
  ativo?: boolean
  created_at?: string
  updated_at?: string
}

export interface Servico {
  id: string
  codigo: string
  nome: string
  descricao?: string | null
  categoria?: string | null
  tempo_estimado?: number | null
  preco_sugerido?: number | null
  comissao_percentual?: number | null
  ativo?: boolean
  created_at?: string
  updated_at?: string
}

export interface OrdemServico {
  id: string
  numero_os: number
  cliente_id: string
  veiculo_id: string
  mecanico_id?: string | null
  data_abertura?: string
  data_previsao?: string | null
  data_conclusao?: string | null
  status?: string
  km_veiculo?: number | null
  nivel_combustivel?: string | null
  problemas_relatados?: string | null
  observacoes?: string | null
  valor_total?: number
  desconto?: number
  valor_final?: number
  forma_pagamento?: string | null
  created_at?: string
  updated_at?: string
}

export interface Venda {
  id: string
  numero_venda: number
  cliente_id?: string | null
  vendedor_id?: string | null
  data_venda?: string
  tipo_venda?: string | null
  os_id?: string | null
  subtotal: number
  desconto?: number
  total: number
  forma_pagamento?: string | null
  status?: string
  observacoes?: string | null
  created_at?: string
}

export interface ContaPagar {
  id: string
  fornecedor_id?: string | null
  descricao: string
  documento?: string | null
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string | null
  valor: number
  valor_pago?: number | null
  juros?: number
  multa?: number
  desconto?: number
  status?: string
  categoria?: string | null
  observacoes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ContaReceber {
  id: string
  cliente_id?: string | null
  venda_id?: string | null
  os_id?: string | null
  descricao: string
  documento?: string | null
  data_emissao: string
  data_vencimento: string
  data_recebimento?: string | null
  valor: number
  valor_recebido?: number | null
  juros?: number
  multa?: number
  desconto?: number
  status?: string
  forma_recebimento?: string | null
  observacoes?: string | null
  created_at?: string
  updated_at?: string
}

export interface Agendamento {
  id: string
  cliente_id: string
  veiculo_id: string
  servico_id?: string | null
  data_agendamento: string
  hora_agendamento: string
  mecanico_id?: string | null
  status?: string
  observacoes?: string | null
  lembrete_enviado?: boolean
  created_at?: string
  updated_at?: string
}

export interface Usuario {
  id: string
  nome: string
  cpf?: string | null
  telefone?: string | null
  role: 'admin' | 'gerente' | 'mecanico' | 'caixa' | 'comum'
  ativo?: boolean
  created_at?: string
  updated_at?: string
}
