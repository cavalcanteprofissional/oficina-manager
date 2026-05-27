-- ============================================================
-- OFICINA MANAGER - Full Database Schema
-- Generated: 2026-05-27T15:03:35.300Z
-- Project: itueopegwvlqyfznkuws
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ------------------------------------------------------------
-- TABLE: agendamentos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  servico_id uuid,
  data_agendamento date NOT NULL,
  hora_agendamento time NOT NULL,
  mecanico_id uuid,
  status varchar(30) DEFAULT 'agendado'::character varying,
  observacoes text,
  lembrete_enviado bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.agendamentos ADD PRIMARY KEY (id);
ALTER TABLE public.agendamentos ADD CONSTRAINT agendamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE NO ACTION;
ALTER TABLE public.agendamentos ADD CONSTRAINT agendamentos_mecanico_id_fkey FOREIGN KEY (mecanico_id) REFERENCES public.mecanicos(id) ON DELETE NO ACTION;
ALTER TABLE public.agendamentos ADD CONSTRAINT agendamentos_servico_id_fkey FOREIGN KEY (servico_id) REFERENCES public.servicos(id) ON DELETE NO ACTION;
ALTER TABLE public.agendamentos ADD CONSTRAINT agendamentos_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.veiculos(id) ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos USING btree (data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON public.agendamentos USING btree (cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_veiculo_id ON public.agendamentos USING btree (veiculo_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico_id ON public.agendamentos USING btree (servico_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_mecanico_id ON public.agendamentos USING btree (mecanico_id);
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: caixa_movimentos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.caixa_movimentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  data_movimento timestamptz DEFAULT now(),
  tipo_movimento varchar(20),
  categoria varchar(100),
  descricao text NOT NULL,
  valor numeric(10,2) NOT NULL,
  forma_pagamento varchar(50),
  venda_id uuid,
  conta_pagar_id uuid,
  conta_receber_id uuid,
  saldo_anterior numeric(10,2),
  saldo_atual numeric(10,2),
  usuario_id uuid,
  observacoes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.caixa_movimentos ADD PRIMARY KEY (id);
ALTER TABLE public.caixa_movimentos ADD CONSTRAINT caixa_movimentos_conta_pagar_id_fkey FOREIGN KEY (conta_pagar_id) REFERENCES public.contas_pagar(id) ON DELETE NO ACTION;
ALTER TABLE public.caixa_movimentos ADD CONSTRAINT caixa_movimentos_conta_receber_id_fkey FOREIGN KEY (conta_receber_id) REFERENCES public.contas_receber(id) ON DELETE NO ACTION;
ALTER TABLE public.caixa_movimentos ADD CONSTRAINT caixa_movimentos_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_caixa_movimentos_venda_id ON public.caixa_movimentos USING btree (venda_id);
CREATE INDEX IF NOT EXISTS idx_caixa_movimentos_conta_pagar_id ON public.caixa_movimentos USING btree (conta_pagar_id);
CREATE INDEX IF NOT EXISTS idx_caixa_movimentos_conta_receber_id ON public.caixa_movimentos USING btree (conta_receber_id);
ALTER TABLE public.caixa_movimentos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: clientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  cpf_cnpj varchar(20),
  rg_ie varchar(20),
  data_nascimento date,
  email varchar(255),
  telefone1 varchar(20) NOT NULL,
  telefone2 varchar(20),
  cep varchar(10),
  endereco text,
  numero varchar(10),
  complemento text,
  bairro varchar(100),
  cidade varchar(100),
  estado bpchar,
  foto_url text,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.clientes ADD PRIMARY KEY (id);
ALTER TABLE public.clientes ADD CONSTRAINT clientes_cpf_cnpj_key UNIQUE (cpf_cnpj);
CREATE UNIQUE INDEX clientes_cpf_cnpj_key ON public.clientes USING btree (cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes USING btree (nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON public.clientes USING btree (cpf_cnpj);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: contas_pagar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fornecedor_id uuid,
  descricao text NOT NULL,
  documento varchar(50),
  data_emissao date NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  valor numeric(10,2) NOT NULL,
  valor_pago numeric(10,2),
  juros numeric(10,2) DEFAULT 0,
  multa numeric(10,2) DEFAULT 0,
  desconto numeric(10,2) DEFAULT 0,
  status varchar(30) DEFAULT 'pendente'::character varying,
  categoria varchar(100),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contas_pagar ADD PRIMARY KEY (id);
ALTER TABLE public.contas_pagar ADD CONSTRAINT contas_pagar_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar USING btree (data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor_id ON public.contas_pagar USING btree (fornecedor_id);
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: contas_receber
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contas_receber (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid,
  venda_id uuid,
  os_id uuid,
  descricao text NOT NULL,
  documento varchar(50),
  data_emissao date NOT NULL,
  data_vencimento date NOT NULL,
  data_recebimento date,
  valor numeric(10,2) NOT NULL,
  valor_recebido numeric(10,2),
  juros numeric(10,2) DEFAULT 0,
  multa numeric(10,2) DEFAULT 0,
  desconto numeric(10,2) DEFAULT 0,
  status varchar(30) DEFAULT 'pendente'::character varying,
  forma_recebimento varchar(50),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contas_receber ADD PRIMARY KEY (id);
ALTER TABLE public.contas_receber ADD CONSTRAINT contas_receber_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE NO ACTION;
ALTER TABLE public.contas_receber ADD CONSTRAINT contas_receber_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE NO ACTION;
ALTER TABLE public.contas_receber ADD CONSTRAINT contas_receber_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON public.contas_receber USING btree (data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_cliente_id ON public.contas_receber USING btree (cliente_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_venda_id ON public.contas_receber USING btree (venda_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_os_id ON public.contas_receber USING btree (os_id);
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: estoque_movimentos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.estoque_movimentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL,
  tipo_movimento varchar(20),
  quantidade int4 NOT NULL,
  saldo_anterior int4 NOT NULL,
  saldo_atual int4 NOT NULL,
  documento varchar(50),
  documento_id uuid,
  observacoes text,
  usuario_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.estoque_movimentos ADD PRIMARY KEY (id);
ALTER TABLE public.estoque_movimentos ADD CONSTRAINT estoque_movimentos_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_estoque_movimentos_produto_id ON public.estoque_movimentos USING btree (produto_id);
ALTER TABLE public.estoque_movimentos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: fornecedores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  razao_social varchar(255) NOT NULL,
  nome_fantasia varchar(255),
  cnpj varchar(20),
  inscricao_estadual varchar(20),
  email varchar(255),
  telefone1 varchar(20) NOT NULL,
  telefone2 varchar(20),
  cep varchar(10),
  endereco text,
  numero varchar(10),
  complemento text,
  bairro varchar(100),
  cidade varchar(100),
  estado bpchar,
  contato_nome varchar(255),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.fornecedores ADD PRIMARY KEY (id);
ALTER TABLE public.fornecedores ADD CONSTRAINT fornecedores_cnpj_key UNIQUE (cnpj);
CREATE UNIQUE INDEX fornecedores_cnpj_key ON public.fornecedores USING btree (cnpj);
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: mecanicos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mecanicos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  cpf varchar(20),
  data_contratacao date NOT NULL,
  especialidades _text,
  email varchar(255),
  telefone varchar(20) NOT NULL,
  celular varchar(20),
  cep varchar(10),
  endereco text,
  numero varchar(10),
  bairro varchar(100),
  cidade varchar(100),
  estado bpchar,
  salario numeric(10,2),
  comissao_percentual numeric(5,2),
  foto_url text,
  observacoes text,
  ativo bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.mecanicos ADD PRIMARY KEY (id);
ALTER TABLE public.mecanicos ADD CONSTRAINT mecanicos_cpf_key UNIQUE (cpf);
CREATE UNIQUE INDEX mecanicos_cpf_key ON public.mecanicos USING btree (cpf);
ALTER TABLE public.mecanicos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: ordens_servico
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_os int8 NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  mecanico_id uuid,
  data_abertura timestamptz DEFAULT now(),
  data_previsao date,
  data_conclusao timestamptz,
  status varchar(30) DEFAULT 'aberta'::character varying,
  km_veiculo int4,
  nivel_combustivel varchar(20),
  problemas_relatados text,
  observacoes text,
  valor_total numeric(10,2) DEFAULT 0,
  desconto numeric(10,2) DEFAULT 0,
  valor_final numeric(10,2) DEFAULT 0,
  forma_pagamento varchar(50),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.ordens_servico ADD PRIMARY KEY (id);
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE NO ACTION;
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_mecanico_id_fkey FOREIGN KEY (mecanico_id) REFERENCES public.mecanicos(id) ON DELETE NO ACTION;
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.veiculos(id) ON DELETE NO ACTION;
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_numero_os_key UNIQUE (numero_os);
CREATE UNIQUE INDEX ordens_servico_numero_os_key ON public.ordens_servico USING btree (numero_os);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_cliente_id ON public.ordens_servico USING btree (cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_veiculo_id ON public.ordens_servico USING btree (veiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON public.ordens_servico USING btree (status);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_mecanico_id ON public.ordens_servico USING btree (mecanico_id);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: os_itens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.os_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  os_id uuid,
  tipo_item varchar(20),
  item_id uuid,
  descricao text NOT NULL,
  quantidade int4 DEFAULT 1,
  valor_unitario numeric(10,2) NOT NULL,
  desconto numeric(10,2) DEFAULT 0,
  valor_total numeric(10,2) NOT NULL,
  mecanico_id uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.os_itens ADD PRIMARY KEY (id);
ALTER TABLE public.os_itens ADD CONSTRAINT os_itens_mecanico_id_fkey FOREIGN KEY (mecanico_id) REFERENCES public.mecanicos(id) ON DELETE NO ACTION;
ALTER TABLE public.os_itens ADD CONSTRAINT os_itens_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_os_itens_os_id ON public.os_itens USING btree (os_id);
CREATE INDEX IF NOT EXISTS idx_os_itens_mecanico_id ON public.os_itens USING btree (mecanico_id);
ALTER TABLE public.os_itens ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: produtos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.produtos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo varchar(50) NOT NULL,
  codigo_barras varchar(100),
  nome varchar(255) NOT NULL,
  descricao text,
  categoria varchar(100),
  marca varchar(100),
  unidade_medida varchar(10),
  preco_custo numeric(10,2) NOT NULL,
  preco_venda numeric(10,2) NOT NULL,
  margem_lucro numeric(5,2),
  estoque_minimo int4 DEFAULT 0,
  estoque_atual int4 DEFAULT 0,
  estoque_maximo int4,
  localizacao text,
  fornecedor_id uuid,
  ncm varchar(10),
  cest varchar(10),
  origem int4,
  foto_url _text,
  ativo bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.produtos ADD PRIMARY KEY (id);
ALTER TABLE public.produtos ADD CONSTRAINT produtos_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE NO ACTION;
ALTER TABLE public.produtos ADD CONSTRAINT produtos_codigo_key UNIQUE (codigo);
CREATE UNIQUE INDEX produtos_codigo_key ON public.produtos USING btree (codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON public.produtos USING btree (codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos USING btree (nome);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor_id ON public.produtos USING btree (fornecedor_id);
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: servicos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servicos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo varchar(50) NOT NULL,
  nome varchar(255) NOT NULL,
  descricao text,
  categoria varchar(100),
  tempo_estimado int4,
  preco_sugerido numeric(10,2),
  comissao_percentual numeric(5,2),
  ativo bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.servicos ADD PRIMARY KEY (id);
ALTER TABLE public.servicos ADD CONSTRAINT servicos_codigo_key UNIQUE (codigo);
CREATE UNIQUE INDEX servicos_codigo_key ON public.servicos USING btree (codigo);
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid NOT NULL,
  nome varchar(255) NOT NULL,
  cpf varchar(20),
  telefone varchar(20),
  role varchar(20) DEFAULT 'comum'::character varying,
  ativo bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.usuarios ADD PRIMARY KEY (id);
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: veiculos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.veiculos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid,
  placa varchar(10) NOT NULL,
  marca varchar(50) NOT NULL,
  modelo varchar(100) NOT NULL,
  ano_fabricacao int4,
  ano_modelo int4,
  cor varchar(30),
  chassi varchar(30),
  renavam varchar(30),
  km_atual int4,
  combustivel varchar(20),
  foto_url _text,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.veiculos ADD PRIMARY KEY (id);
ALTER TABLE public.veiculos ADD CONSTRAINT veiculos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;
ALTER TABLE public.veiculos ADD CONSTRAINT veiculos_placa_key UNIQUE (placa);
CREATE UNIQUE INDEX veiculos_placa_key ON public.veiculos USING btree (placa);
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON public.veiculos USING btree (placa);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente_id ON public.veiculos USING btree (cliente_id);
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: venda_itens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.venda_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venda_id uuid,
  produto_id uuid,
  quantidade int4 NOT NULL,
  valor_unitario numeric(10,2) NOT NULL,
  desconto numeric(10,2) DEFAULT 0,
  valor_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.venda_itens ADD PRIMARY KEY (id);
ALTER TABLE public.venda_itens ADD CONSTRAINT venda_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE NO ACTION;
ALTER TABLE public.venda_itens ADD CONSTRAINT venda_itens_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_venda_itens_venda_id ON public.venda_itens USING btree (venda_id);
CREATE INDEX IF NOT EXISTS idx_venda_itens_produto_id ON public.venda_itens USING btree (produto_id);
ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: vendas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_venda int8 NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid,
  vendedor_id uuid,
  data_venda timestamptz DEFAULT now(),
  tipo_venda varchar(20),
  os_id uuid,
  subtotal numeric(10,2) NOT NULL,
  desconto numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  forma_pagamento varchar(50),
  status varchar(30) DEFAULT 'concluida'::character varying,
  observacoes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.vendas ADD PRIMARY KEY (id);
ALTER TABLE public.vendas ADD CONSTRAINT vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE NO ACTION;
ALTER TABLE public.vendas ADD CONSTRAINT vendas_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE NO ACTION;
ALTER TABLE public.vendas ADD CONSTRAINT vendas_numero_venda_key UNIQUE (numero_venda);
CREATE UNIQUE INDEX vendas_numero_venda_key ON public.vendas USING btree (numero_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON public.vendas USING btree (cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_os_id ON public.vendas USING btree (os_id);
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "Agendamentos - atualizacao admin/gerente" ON public.agendamentos
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Agendamentos - criacao autenticados" ON public.agendamentos
  FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "Agendamentos - exclusao admin" ON public.agendamentos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Agendamentos - leitura autenticados" ON public.agendamentos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_agendamentos" ON public.agendamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Caixa - escrita admin/gerente/caixa" ON public.caixa_movimentos
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying, 'caixa'::character varying])::text[]))))));
CREATE POLICY "Caixa - exclusao admin" ON public.caixa_movimentos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Caixa - leitura autenticados" ON public.caixa_movimentos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_caixa_movimentos" ON public.caixa_movimentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Clientes - atualizacao admin/gerente" ON public.clientes
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Clientes - escrita admin/gerente" ON public.clientes
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Clientes - exclusao admin" ON public.clientes
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Clientes - leitura autenticados" ON public.clientes
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_clientes" ON public.clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Contas pagar - atualizacao admin/gerente" ON public.contas_pagar
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Contas pagar - escrita admin/gerente/caixa" ON public.contas_pagar
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying, 'caixa'::character varying])::text[]))))));
CREATE POLICY "Contas pagar - exclusao admin" ON public.contas_pagar
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Contas pagar - leitura autenticados" ON public.contas_pagar
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_contas_pagar" ON public.contas_pagar
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Contas receber - atualizacao admin/gerente" ON public.contas_receber
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Contas receber - escrita admin/gerente/caixa" ON public.contas_receber
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying, 'caixa'::character varying])::text[]))))));
CREATE POLICY "Contas receber - exclusao admin" ON public.contas_receber
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Contas receber - leitura autenticados" ON public.contas_receber
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_contas_receber" ON public.contas_receber
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Estoque - escrita admin/gerente" ON public.estoque_movimentos
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Estoque - exclusao admin" ON public.estoque_movimentos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Estoque - leitura autenticados" ON public.estoque_movimentos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_estoque_movimentos" ON public.estoque_movimentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Fornecedores - atualizacao admin/gerente" ON public.fornecedores
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Fornecedores - escrita admin/gerente" ON public.fornecedores
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Fornecedores - exclusao admin" ON public.fornecedores
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Fornecedores - leitura autenticados" ON public.fornecedores
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_fornecedores" ON public.fornecedores
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Mecanicos - atualizacao admin/gerente" ON public.mecanicos
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Mecanicos - escrita admin/gerente" ON public.mecanicos
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Mecanicos - exclusao admin" ON public.mecanicos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Mecanicos - leitura autenticados" ON public.mecanicos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_mecanicos" ON public.mecanicos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "OS - atualizacao admin/gerente/mecanico" ON public.ordens_servico
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying, 'mecanico'::character varying])::text[]))))));
CREATE POLICY "OS - criacao autenticados" ON public.ordens_servico
  FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "OS - exclusao admin" ON public.ordens_servico
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "OS - leitura autenticados" ON public.ordens_servico
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_ordens_servico" ON public.ordens_servico
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "OS itens - atualizacao admin/gerente" ON public.os_itens
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "OS itens - escrita autenticados" ON public.os_itens
  FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "OS itens - exclusao admin" ON public.os_itens
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "OS itens - leitura autenticados" ON public.os_itens
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_os_itens" ON public.os_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Produtos - atualizacao admin/gerente" ON public.produtos
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Produtos - escrita admin/gerente" ON public.produtos
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Produtos - exclusao admin" ON public.produtos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Produtos - leitura autenticados" ON public.produtos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_produtos" ON public.produtos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Servicos - atualizacao admin/gerente" ON public.servicos
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Servicos - escrita admin/gerente" ON public.servicos
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Servicos - exclusao admin" ON public.servicos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Servicos - leitura autenticados" ON public.servicos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_servicos" ON public.servicos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuarios - atualizacao admin apenas" ON public.usuarios
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios usuarios_1
  WHERE ((usuarios_1.id = auth.uid()) AND ((usuarios_1.role)::text = 'admin'::text)))));
CREATE POLICY "Usuarios - criacao admin apenas" ON public.usuarios
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios usuarios_1
  WHERE ((usuarios_1.id = auth.uid()) AND ((usuarios_1.role)::text = 'admin'::text)))));
CREATE POLICY "Usuarios - exclusao admin apenas" ON public.usuarios
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios usuarios_1
  WHERE ((usuarios_1.id = auth.uid()) AND ((usuarios_1.role)::text = 'admin'::text)))));
CREATE POLICY "Usuarios - leitura propria ou admin" ON public.usuarios
  FOR SELECT TO public USING (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM usuarios usuarios_1
  WHERE ((usuarios_1.id = auth.uid()) AND ((usuarios_1.role)::text = 'admin'::text))))));
CREATE POLICY "admin_delete_usuarios" ON public.usuarios
  FOR DELETE TO authenticated USING (((( SELECT usuarios_1.role
   FROM usuarios usuarios_1
  WHERE (usuarios_1.id = auth.uid())))::text = 'admin'::text));
CREATE POLICY "admin_update_usuarios" ON public.usuarios
  FOR UPDATE TO authenticated USING (((( SELECT usuarios_1.role
   FROM usuarios usuarios_1
  WHERE (usuarios_1.id = auth.uid())))::text = 'admin'::text)) WITH CHECK (((( SELECT usuarios_1.role
   FROM usuarios usuarios_1
  WHERE (usuarios_1.id = auth.uid())))::text = 'admin'::text));
CREATE POLICY "authenticated_insert_usuarios" ON public.usuarios
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_select_usuarios" ON public.usuarios
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Veiculos - atualizacao admin/gerente" ON public.veiculos
  FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Veiculos - escrita admin/gerente" ON public.veiculos
  FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = ANY ((ARRAY['admin'::character varying, 'gerente'::character varying])::text[]))))));
CREATE POLICY "Veiculos - exclusao admin" ON public.veiculos
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Veiculos - leitura autenticados" ON public.veiculos
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_veiculos" ON public.veiculos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Venda itens - escrita autenticados" ON public.venda_itens
  FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "Venda itens - exclusao admin" ON public.venda_itens
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Venda itens - leitura autenticados" ON public.venda_itens
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_venda_itens" ON public.venda_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Vendas - criacao autenticados" ON public.vendas
  FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "Vendas - exclusao admin" ON public.vendas
  FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.role)::text = 'admin'::text)))));
CREATE POLICY "Vendas - leitura autenticados" ON public.vendas
  FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "authenticated_all_vendas" ON public.vendas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mecanicos_updated_at BEFORE UPDATE ON public.mecanicos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON public.veiculos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON public.contas_pagar FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON public.contas_receber FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
