-- =====================================================
-- SISTEMA DE GESTÃO DE USUÁRIOS - OFICINA MANAGER
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(20),
  telefone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'comum' CHECK (role IN ('admin', 'gerente', 'mecanico', 'caixa', 'comum')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- =====================================================
-- TRIGGER PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Políticas simples
-- =====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver usuários
CREATE POLICY "users_can_read" ON usuarios
  FOR SELECT USING (true);

-- Policy: Apenas admins podem modificar (verificado pelo frontend)
CREATE POLICY "users_can_manage" ON usuarios
  FOR ALL USING (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON usuarios TO anon;

-- =====================================================
-- CRIAR PRIMEIRO ADMINISTRADOR
-- =====================================================
INSERT INTO usuarios (id, nome, role, ativo)
VALUES ('a8954e8b-f48e-45ba-a2c0-ebb78f557b32', 'cavalcanteprofissional@outlook.com', 'admin', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 'Tabela usuarios criada com sucesso!' as mensagem;
SELECT * FROM usuarios;
