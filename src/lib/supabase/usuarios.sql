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
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
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
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy: Todos os usuários autenticados podem ver a tabela
DROP POLICY IF EXISTS "Usuários podem ver todos" ON usuarios;
CREATE POLICY "Usuários podem ver todos" ON usuarios
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Apenas admins podem inserir
DROP POLICY IF EXISTS "Apenas admin pode inserir" ON usuarios;
CREATE POLICY "Apenas admin pode inserir" ON usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: Apenas admins podem atualizar
DROP POLICY IF EXISTS "Apenas admin pode atualizar" ON usuarios;
CREATE POLICY "Apenas admin pode atualizar" ON usuarios
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: Apenas admins podem excluir
DROP POLICY IF EXISTS "Apenas admin pode excluir" ON usuarios;
CREATE POLICY "Apenas admin pode excluir" ON usuarios
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- FUNÇÃO PARA CONVERTER USUÁRIOS DO AUTH
-- =====================================================
CREATE OR REPLACE FUNCTION public.converter_usuarios_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usuario RECORD;
BEGIN
  -- Para cada usuário no auth.users que não existe em usuarios, criar um registro
  FOR usuario IN 
    SELECT u.id, u.email, u.raw_user_meta_data->>'nome' as nome
    FROM auth.users u
    LEFT JOIN usuarios us ON us.id = u.id
    WHERE us.id IS NULL
  LOOP
    INSERT INTO usuarios (id, nome, role, ativo)
    VALUES (
      usuario.id,
      COALESCE(usuario.nome, usuario.email),
      'comum',
      true
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$;

-- =====================================================
-- CRIAR PRIMEIRO ADMINISTRADOR
-- =====================================================
-- Execute este comando separadamente com o email do admin:
-- INSERT INTO usuarios (id, nome, role, ativo)
-- SELECT id, email, 'admin', true
-- FROM auth.users
-- WHERE email = 'seu_email@exemplo.com'
-- ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON usuarios TO anon;
GRANT EXECUTE ON FUNCTION converter_usuarios_auth TO authenticated;
GRANT EXECUTE ON FUNCTION converter_usuarios_auth TO anon;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 'Tabela usuarios criada com sucesso!' as mensagem;
SELECT * FROM usuarios LIMIT 10;
