-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES — protegidos contra duplicata
-- ============================================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'inspetor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE inspecao_status AS ENUM ('rascunho', 'em_andamento', 'finalizada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE criticidade_nivel AS ENUM ('critico', 'alto', 'medio', 'baixo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE nc_tipo AS ENUM ('seguranca', 'limpeza', 'epi', 'estrutural', 'outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE nc_status AS ENUM ('aberta', 'em_andamento', 'resolvida', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE epi_status AS ENUM ('sim', 'parcialmente', 'nao');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE reconhecimento_nivel AS ENUM ('excelente', 'bom_exemplo', 'merece_reconhecimento');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABELA: organizacoes (multi-tenant)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizacoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  ativa           BOOLEAN NOT NULL DEFAULT true,
  meta_qualidade  NUMERIC(5,2) NOT NULL DEFAULT 90.00,
  meta_seguranca  NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'inspetor',
  ativo           BOOLEAN NOT NULL DEFAULT true,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: locais (gerenciados pelo admin, lista suspensa)
-- ============================================================
CREATE TABLE IF NOT EXISTS locais (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  tipo            TEXT,
  bloco           TEXT,
  andar           TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: zeladores (gerenciados pelo admin, lista suspensa)
-- ============================================================
CREATE TABLE IF NOT EXISTS zeladores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  matricula       TEXT,
  setor           TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: criterios_avaliacao (configuráveis pelo admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS criterios_avaliacao (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  peso            NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ordem           INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: checklist_seguranca_itens (configuráveis pelo admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_seguranca_itens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  obrigatorio     BOOLEAN NOT NULL DEFAULT true,
  ordem           INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: epis_lista (configuráveis pelo admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS epis_lista (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizacao_id  UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  obrigatorio     BOOLEAN NOT NULL DEFAULT true,
  ordem           INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: inspecoes (registro principal)
-- FOTOS: apenas 2 — inicial e final
-- ============================================================
CREATE TABLE IF NOT EXISTS inspecoes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizacao_id      UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  local_id            UUID NOT NULL REFERENCES locais(id),
  inspetor_id         UUID NOT NULL REFERENCES usuarios(id),
  zelador_id          UUID NOT NULL REFERENCES zeladores(id),
  data_inspecao       DATE NOT NULL,
  hora_inicio         TIME,
  hora_fim            TIME,
  descricao_visita    TEXT,
  limpeza_programada  BOOLEAN NOT NULL DEFAULT false,
  status              inspecao_status NOT NULL DEFAULT 'rascunho',
  -- índices calculados ao finalizar
  indice_qualidade    NUMERIC(5,2),
  indice_seguranca    NUMERIC(5,2),
  -- apenas 2 fotos
  foto_inicial_url    TEXT,
  foto_final_url      TEXT,
  finalizada_em       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: avaliacoes_limpeza
-- ============================================================
CREATE TABLE IF NOT EXISTS avaliacoes_limpeza (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspecao_id     UUID NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  criterio_id     UUID NOT NULL REFERENCES criterios_avaliacao(id),
  nota            SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inspecao_id, criterio_id)
);

-- ============================================================
-- TABELA: seguranca_checklist
-- ============================================================
CREATE TABLE IF NOT EXISTS seguranca_checklist (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspecao_id     UUID NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES checklist_seguranca_itens(id),
  conforme        BOOLEAN NOT NULL,
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inspecao_id, item_id)
);

-- ============================================================
-- TABELA: epis_inspecao
-- ============================================================
CREATE TABLE IF NOT EXISTS epis_inspecao (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspecao_id       UUID NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  status_geral      epi_status NOT NULL DEFAULT 'sim',
  equipamentos_bons BOOLEAN NOT NULL DEFAULT true,
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inspecao_id)
);

-- ============================================================
-- TABELA: epis_ausentes
-- ============================================================
CREATE TABLE IF NOT EXISTS epis_ausentes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  epi_inspecao_id   UUID NOT NULL REFERENCES epis_inspecao(id) ON DELETE CASCADE,
  epi_id            UUID NOT NULL REFERENCES epis_lista(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(epi_inspecao_id, epi_id)
);

-- ============================================================
-- TABELA: nao_conformidades
-- ============================================================
CREATE TABLE IF NOT EXISTS nao_conformidades (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspecao_id           UUID NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  organizacao_id        UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  tipo                  nc_tipo NOT NULL,
  descricao             TEXT NOT NULL,
  criticidade           criticidade_nivel NOT NULL,
  acao_corretiva        TEXT NOT NULL,
  prazo_correcao        DATE NOT NULL,
  responsavel_id        UUID REFERENCES usuarios(id),
  status                nc_status NOT NULL DEFAULT 'aberta',
  resolucao_descricao   TEXT,
  resolvida_em          TIMESTAMPTZ,
  resolvida_por         UUID REFERENCES usuarios(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: reconhecimentos
-- ============================================================
CREATE TABLE IF NOT EXISTS reconhecimentos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspecao_id     UUID NOT NULL REFERENCES inspecoes(id) ON DELETE CASCADE,
  zelador_id      UUID NOT NULL REFERENCES zeladores(id),
  nivel           reconhecimento_nivel NOT NULL,
  descricao       TEXT,
  publicado_mural BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inspecao_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_inspecoes_org        ON inspecoes(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_inspecoes_inspetor   ON inspecoes(inspetor_id);
CREATE INDEX IF NOT EXISTS idx_inspecoes_local       ON inspecoes(local_id);
CREATE INDEX IF NOT EXISTS idx_inspecoes_zelador     ON inspecoes(zelador_id);
CREATE INDEX IF NOT EXISTS idx_inspecoes_data        ON inspecoes(data_inspecao DESC);
CREATE INDEX IF NOT EXISTS idx_inspecoes_status      ON inspecoes(status);
CREATE INDEX IF NOT EXISTS idx_nc_org                ON nao_conformidades(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_nc_status             ON nao_conformidades(status);
CREATE INDEX IF NOT EXISTS idx_nc_criticidade        ON nao_conformidades(criticidade);
CREATE INDEX IF NOT EXISTS idx_usuarios_org          ON usuarios(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_locais_org            ON locais(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_zeladores_org         ON zeladores(organizacao_id);

-- ============================================================
-- TRIGGER: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_organizacoes_upd BEFORE UPDATE ON organizacoes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_usuarios_upd BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_inspecoes_upd BEFORE UPDATE ON inspecoes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_nc_upd BEFORE UPDATE ON nao_conformidades FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_locais_upd BEFORE UPDATE ON locais FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_zeladores_upd BEFORE UPDATE ON zeladores FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- FUNÇÃO: calcular índices ao finalizar inspeção
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_indices_inspecao(p_inspecao_id UUID)
RETURNS VOID AS $$
DECLARE v_iql NUMERIC(5,2); v_cs NUMERIC(5,2);
BEGIN
  SELECT ROUND((SUM(al.nota * ca.peso) / (SUM(ca.peso) * 5)) * 100, 2)
  INTO v_iql
  FROM avaliacoes_limpeza al
  JOIN criterios_avaliacao ca ON ca.id = al.criterio_id
  WHERE al.inspecao_id = p_inspecao_id;

  SELECT ROUND((COUNT(*) FILTER (WHERE sc.conforme)::NUMERIC / NULLIF(COUNT(*),0)) * 100, 2)
  INTO v_cs
  FROM seguranca_checklist sc
  WHERE sc.inspecao_id = p_inspecao_id;

  UPDATE inspecoes SET
    indice_qualidade = COALESCE(v_iql, 0),
    indice_seguranca = COALESCE(v_cs, 0),
    status = 'finalizada',
    finalizada_em = NOW()
  WHERE id = p_inspecao_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
