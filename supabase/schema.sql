-- Script SQL para criação das tabelas do Oficina Manager
-- Execute este script no Supabase SQL Editor

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(20) UNIQUE,
  rg_ie VARCHAR(20),
  data_nascimento DATE,
  email VARCHAR(255),
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  complemento TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  foto_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(20) UNIQUE,
  inscricao_estadual VARCHAR(20),
  email VARCHAR(255),
  telefone1 VARCHAR(20) NOT NULL,
  telefone2 VARCHAR(20),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  complemento TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  contato_nome VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MECÂNICOS
CREATE TABLE IF NOT EXISTS mecanicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(20) UNIQUE,
  data_contratacao DATE NOT NULL,
  especialidades TEXT[],
  email VARCHAR(255),
  telefone VARCHAR(20) NOT NULL,
  celular VARCHAR(20),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  salario DECIMAL(10,2),
  comissao_percentual DECIMAL(5,2),
  foto_url TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VEÍCULOS
CREATE TABLE IF NOT EXISTS veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  placa VARCHAR(10) UNIQUE NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano_fabricacao INTEGER,
  ano_modelo INTEGER,
  cor VARCHAR(30),
  chassi VARCHAR(30),
  renavam VARCHAR(30),
  km_atual INTEGER,
  combustivel VARCHAR(20),
  foto_url TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  codigo_barras VARCHAR(100),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  unidade_medida VARCHAR(10),
  preco_custo DECIMAL(10,2) NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  margem_lucro DECIMAL(5,2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  localizacao TEXT,
  fornecedor_id UUID REFERENCES fornecedores(id),
  ncm VARCHAR(10),
  cest VARCHAR(10),
  origem INTEGER,
  foto_url TEXT[],
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SERVIÇOS
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  tempo_estimado INTEGER,
  preco_sugerido DECIMAL(10,2),
  comissao_percentual DECIMAL(5,2),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDENS DE SERVIÇO
CREATE TABLE IF NOT EXISTS ordens_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os BIGSERIAL UNIQUE,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  veiculo_id UUID REFERENCES veiculos(id) NOT NULL,
  mecanico_id UUID REFERENCES mecanicos(id),
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_previsao DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  status VARCHAR(30) DEFAULT 'aberta',
  km_veiculo INTEGER,
  nivel_combustivel VARCHAR(20),
  problemas_relatados TEXT,
  observacoes TEXT,
  valor_total DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) DEFAULT 0,
  forma_pagamento VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ITENS DA OS
CREATE TABLE IF NOT EXISTS os_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo_item VARCHAR(20),
  item_id UUID,
  descricao TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  mecanico_id UUID REFERENCES mecanicos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. VENDAS
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_venda BIGSERIAL UNIQUE,
  cliente_id UUID REFERENCES clientes(id),
  vendedor_id UUID,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_venda VARCHAR(20),
  os_id UUID REFERENCES ordens_servico(id),
  subtotal DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  status VARCHAR(30) DEFAULT 'concluida',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ITENS DE VENDA
CREATE TABLE IF NOT EXISTS venda_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id UUID REFERENCES fornecedores(id),
  descricao TEXT NOT NULL,
  documento VARCHAR(50),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2),
  juros DECIMAL(10,2) DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pendente',
  categoria VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS contas_receber (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  venda_id UUID REFERENCES vendas(id),
  os_id UUID REFERENCES ordens_servico(id),
  descricao TEXT NOT NULL,
  documento VARCHAR(50),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  valor DECIMAL(10,2) NOT NULL,
  valor_recebido DECIMAL(10,2),
  juros DECIMAL(10,2) DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pendente',
  forma_recebimento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. CAIXA
CREATE TABLE IF NOT EXISTS caixa_movimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_movimento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_movimento VARCHAR(20),
  categoria VARCHAR(100),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  venda_id UUID REFERENCES vendas(id),
  conta_pagar_id UUID REFERENCES contas_pagar(id),
  conta_receber_id UUID REFERENCES contas_receber(id),
  saldo_anterior DECIMAL(10,2),
  saldo_atual DECIMAL(10,2),
  usuario_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  veiculo_id UUID REFERENCES veiculos(id) NOT NULL,
  servico_id UUID REFERENCES servicos(id),
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME NOT NULL,
  mecanico_id UUID REFERENCES mecanicos(id),
  status VARCHAR(30) DEFAULT 'agendado',
  observacoes TEXT,
  lembrete_enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS estoque_movimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) NOT NULL,
  tipo_movimento VARCHAR(20),
  quantidade INTEGER NOT NULL,
  saldo_anterior INTEGER NOT NULL,
  saldo_atual INTEGER NOT NULL,
  documento VARCHAR(50),
  documento_id UUID,
  observacoes TEXT,
  usuario_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos(placa);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_veiculo_id ON ordens_servico(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);

-- TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_mecanicos_updated_at BEFORE UPDATE ON mecanicos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON veiculos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- POLÍTICAS RLS ( Row Level Security ) - Habilitar se necessário
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for authenticated users" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
