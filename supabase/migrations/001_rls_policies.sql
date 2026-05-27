-- ============================================
-- RLS POLICIES - OFICINA MANAGER
-- ============================================
-- Habilita RLS em todas as tabelas e cria
-- políticas de segurança baseadas em role.
-- ============================================

-- 1. CLIENTES
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes - leitura autenticados"
  ON clientes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Clientes - escrita admin/gerente"
  ON clientes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente'))
  );

CREATE POLICY "Clientes - atualizacao admin/gerente"
  ON clientes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Clientes - exclusao admin"
  ON clientes FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 2. FORNECEDORES
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fornecedores - leitura autenticados"
  ON fornecedores FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Fornecedores - escrita admin/gerente"
  ON fornecedores FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Fornecedores - atualizacao admin/gerente"
  ON fornecedores FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Fornecedores - exclusao admin"
  ON fornecedores FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 3. MECANICOS
ALTER TABLE mecanicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mecanicos - leitura autenticados"
  ON mecanicos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Mecanicos - escrita admin/gerente"
  ON mecanicos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Mecanicos - atualizacao admin/gerente"
  ON mecanicos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Mecanicos - exclusao admin"
  ON mecanicos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 4. VEICULOS
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Veiculos - leitura autenticados"
  ON veiculos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Veiculos - escrita admin/gerente"
  ON veiculos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Veiculos - atualizacao admin/gerente"
  ON veiculos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Veiculos - exclusao admin"
  ON veiculos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 5. PRODUTOS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos - leitura autenticados"
  ON produtos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Produtos - escrita admin/gerente"
  ON produtos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Produtos - atualizacao admin/gerente"
  ON produtos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Produtos - exclusao admin"
  ON produtos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 6. SERVICOS
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicos - leitura autenticados"
  ON servicos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Servicos - escrita admin/gerente"
  ON servicos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Servicos - atualizacao admin/gerente"
  ON servicos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Servicos - exclusao admin"
  ON servicos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 7. ORDENS SERVICO
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OS - leitura autenticados"
  ON ordens_servico FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "OS - criacao autenticados"
  ON ordens_servico FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "OS - atualizacao admin/gerente/mecanico"
  ON ordens_servico FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente', 'mecanico')));

CREATE POLICY "OS - exclusao admin"
  ON ordens_servico FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 8. OS ITENS
ALTER TABLE os_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OS itens - leitura autenticados"
  ON os_itens FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "OS itens - escrita autenticados"
  ON os_itens FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "OS itens - atualizacao admin/gerente"
  ON os_itens FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "OS itens - exclusao admin"
  ON os_itens FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 9. VENDAS
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendas - leitura autenticados"
  ON vendas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Vendas - criacao autenticados"
  ON vendas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Vendas - exclusao admin"
  ON vendas FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 10. VENDA ITENS
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venda itens - leitura autenticados"
  ON venda_itens FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Venda itens - escrita autenticados"
  ON venda_itens FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Venda itens - exclusao admin"
  ON venda_itens FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 11. CONTAS A PAGAR
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contas pagar - leitura autenticados"
  ON contas_pagar FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Contas pagar - escrita admin/gerente/caixa"
  ON contas_pagar FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente', 'caixa')));

CREATE POLICY "Contas pagar - atualizacao admin/gerente"
  ON contas_pagar FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Contas pagar - exclusao admin"
  ON contas_pagar FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 12. CONTAS A RECEBER
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contas receber - leitura autenticados"
  ON contas_receber FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Contas receber - escrita admin/gerente/caixa"
  ON contas_receber FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente', 'caixa')));

CREATE POLICY "Contas receber - atualizacao admin/gerente"
  ON contas_receber FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Contas receber - exclusao admin"
  ON contas_receber FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 13. CAIXA MOVIMENTOS
ALTER TABLE caixa_movimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caixa - leitura autenticados"
  ON caixa_movimentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Caixa - escrita admin/gerente/caixa"
  ON caixa_movimentos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente', 'caixa')));

CREATE POLICY "Caixa - exclusao admin"
  ON caixa_movimentos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 14. AGENDAMENTOS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agendamentos - leitura autenticados"
  ON agendamentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Agendamentos - criacao autenticados"
  ON agendamentos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Agendamentos - atualizacao admin/gerente"
  ON agendamentos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Agendamentos - exclusao admin"
  ON agendamentos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 15. ESTOQUE MOVIMENTOS
ALTER TABLE estoque_movimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estoque - leitura autenticados"
  ON estoque_movimentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Estoque - escrita admin/gerente"
  ON estoque_movimentos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('admin', 'gerente')));

CREATE POLICY "Estoque - exclusao admin"
  ON estoque_movimentos FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 16. USUARIOS (politica especial - auto-visualizacao + admin)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios - leitura propria ou admin"
  ON usuarios FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Usuarios - criacao admin apenas"
  ON usuarios FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuarios - atualizacao admin apenas"
  ON usuarios FOR UPDATE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuarios - exclusao admin apenas"
  ON usuarios FOR DELETE
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin'));
