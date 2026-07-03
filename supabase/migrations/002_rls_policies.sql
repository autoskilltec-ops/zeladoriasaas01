-- ============================================================
-- HABILITAR RLS
-- ============================================================
ALTER TABLE organizacoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeladores                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_avaliacao       ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_seguranca_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE epis_lista                ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecoes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_limpeza        ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguranca_checklist       ENABLE ROW LEVEL SECURITY;
ALTER TABLE epis_inspecao             ENABLE ROW LEVEL SECURITY;
ALTER TABLE epis_ausentes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE nao_conformidades         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconhecimentos           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPERS
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organizacao_id FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'gestor') FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- POLICIES: organizacoes
-- ============================================================
DROP POLICY IF EXISTS "org_select" ON organizacoes;
DROP POLICY IF EXISTS "org_update" ON organizacoes;
CREATE POLICY "org_select" ON organizacoes FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "org_update" ON organizacoes FOR UPDATE USING (id = get_user_org_id() AND is_admin());

-- ============================================================
-- POLICIES: usuarios
-- ============================================================
DROP POLICY IF EXISTS "usr_select" ON usuarios;
DROP POLICY IF EXISTS "usr_insert" ON usuarios;
DROP POLICY IF EXISTS "usr_update" ON usuarios;
DROP POLICY IF EXISTS "usr_delete" ON usuarios;
CREATE POLICY "usr_select" ON usuarios FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "usr_insert" ON usuarios FOR INSERT WITH CHECK (organizacao_id = get_user_org_id() AND is_admin());
CREATE POLICY "usr_update" ON usuarios FOR UPDATE USING (organizacao_id = get_user_org_id() AND (is_admin() OR id = auth.uid()));
CREATE POLICY "usr_delete" ON usuarios FOR DELETE USING (organizacao_id = get_user_org_id() AND is_admin() AND id != auth.uid());

-- ============================================================
-- POLICIES: locais
-- ============================================================
DROP POLICY IF EXISTS "locais_select" ON locais;
DROP POLICY IF EXISTS "locais_insert" ON locais;
DROP POLICY IF EXISTS "locais_update" ON locais;
DROP POLICY IF EXISTS "locais_delete" ON locais;
CREATE POLICY "locais_select" ON locais FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "locais_insert" ON locais FOR INSERT WITH CHECK (organizacao_id = get_user_org_id() AND is_admin());
CREATE POLICY "locais_update" ON locais FOR UPDATE USING (organizacao_id = get_user_org_id() AND is_admin());
CREATE POLICY "locais_delete" ON locais FOR DELETE USING (organizacao_id = get_user_org_id() AND is_admin());

-- ============================================================
-- POLICIES: zeladores
-- ============================================================
DROP POLICY IF EXISTS "zel_select" ON zeladores;
DROP POLICY IF EXISTS "zel_insert" ON zeladores;
DROP POLICY IF EXISTS "zel_update" ON zeladores;
DROP POLICY IF EXISTS "zel_delete" ON zeladores;
CREATE POLICY "zel_select" ON zeladores FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "zel_insert" ON zeladores FOR INSERT WITH CHECK (organizacao_id = get_user_org_id() AND is_admin());
CREATE POLICY "zel_update" ON zeladores FOR UPDATE USING (organizacao_id = get_user_org_id() AND is_admin());
CREATE POLICY "zel_delete" ON zeladores FOR DELETE USING (organizacao_id = get_user_org_id() AND is_admin());

-- ============================================================
-- POLICIES: criterios_avaliacao
-- ============================================================
DROP POLICY IF EXISTS "crit_select" ON criterios_avaliacao;
DROP POLICY IF EXISTS "crit_write"  ON criterios_avaliacao;
CREATE POLICY "crit_select" ON criterios_avaliacao FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "crit_write"  ON criterios_avaliacao FOR ALL USING (organizacao_id = get_user_org_id() AND is_admin());

-- ============================================================
-- POLICIES: checklist_seguranca_itens
-- ============================================================
DROP POLICY IF EXISTS "chk_select" ON checklist_seguranca_itens;
DROP POLICY IF EXISTS "chk_write"  ON checklist_seguranca_itens;
CREATE POLICY "chk_select" ON checklist_seguranca_itens FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "chk_write"  ON checklist_seguranca_itens FOR ALL USING (organizacao_id = get_user_org_id() AND is_admin());

-- ============================================================
-- POLICIES: epis_lista
-- ============================================================
DROP POLICY IF EXISTS "epi_lista_select" ON epis_lista;
DROP POLICY IF EXISTS "epi_lista_write"  ON epis_lista;
CREATE POLICY "epi_lista_select" ON epis_lista FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "epi_lista_write"  ON epis_lista FOR ALL USING (organizacao_id = get_user_org_id() AND is_admin());

-- ============================================================
-- POLICIES: inspecoes
-- ============================================================
DROP POLICY IF EXISTS "insp_select" ON inspecoes;
DROP POLICY IF EXISTS "insp_insert" ON inspecoes;
DROP POLICY IF EXISTS "insp_update" ON inspecoes;
CREATE POLICY "insp_select" ON inspecoes FOR SELECT USING (
  organizacao_id = get_user_org_id() AND (
    is_admin() OR inspetor_id = auth.uid()
  )
);
CREATE POLICY "insp_insert" ON inspecoes FOR INSERT WITH CHECK (
  organizacao_id = get_user_org_id() AND inspetor_id = auth.uid()
);
CREATE POLICY "insp_update" ON inspecoes FOR UPDATE USING (
  organizacao_id = get_user_org_id() AND (
    is_admin() OR (inspetor_id = auth.uid() AND status != 'finalizada')
  )
);

-- ============================================================
-- POLICIES: tabelas filhas de inspecoes
-- (avaliacoes_limpeza, seguranca_checklist, epis_inspecao,
--  epis_ausentes, nao_conformidades, reconhecimentos)
-- ============================================================
DROP POLICY IF EXISTS "aval_select" ON avaliacoes_limpeza;
DROP POLICY IF EXISTS "aval_insert" ON avaliacoes_limpeza;
DROP POLICY IF EXISTS "aval_delete" ON avaliacoes_limpeza;
CREATE POLICY "aval_select" ON avaliacoes_limpeza FOR SELECT USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.organizacao_id = get_user_org_id())
);
CREATE POLICY "aval_insert" ON avaliacoes_limpeza FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.inspetor_id = auth.uid() AND i.status != 'finalizada')
);
CREATE POLICY "aval_delete" ON avaliacoes_limpeza FOR DELETE USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.inspetor_id = auth.uid() AND i.status != 'finalizada')
);

DROP POLICY IF EXISTS "seg_select" ON seguranca_checklist;
DROP POLICY IF EXISTS "seg_insert" ON seguranca_checklist;
DROP POLICY IF EXISTS "seg_delete" ON seguranca_checklist;
CREATE POLICY "seg_select" ON seguranca_checklist FOR SELECT USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.organizacao_id = get_user_org_id())
);
CREATE POLICY "seg_insert" ON seguranca_checklist FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.inspetor_id = auth.uid() AND i.status != 'finalizada')
);
CREATE POLICY "seg_delete" ON seguranca_checklist FOR DELETE USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.inspetor_id = auth.uid() AND i.status != 'finalizada')
);

DROP POLICY IF EXISTS "epi_insp_select" ON epis_inspecao;
DROP POLICY IF EXISTS "epi_insp_write"  ON epis_inspecao;
CREATE POLICY "epi_insp_select" ON epis_inspecao FOR SELECT USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.organizacao_id = get_user_org_id())
);
CREATE POLICY "epi_insp_write" ON epis_inspecao FOR ALL USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.inspetor_id = auth.uid() AND i.status != 'finalizada')
);

DROP POLICY IF EXISTS "epi_aus_select" ON epis_ausentes;
DROP POLICY IF EXISTS "epi_aus_write"  ON epis_ausentes;
CREATE POLICY "epi_aus_select" ON epis_ausentes FOR SELECT USING (
  EXISTS (SELECT 1 FROM epis_inspecao ei JOIN inspecoes i ON i.id = ei.inspecao_id WHERE ei.id = epi_inspecao_id AND i.organizacao_id = get_user_org_id())
);
CREATE POLICY "epi_aus_write" ON epis_ausentes FOR ALL USING (
  EXISTS (SELECT 1 FROM epis_inspecao ei JOIN inspecoes i ON i.id = ei.inspecao_id WHERE ei.id = epi_inspecao_id AND i.inspetor_id = auth.uid() AND i.status != 'finalizada')
);

DROP POLICY IF EXISTS "nc_select" ON nao_conformidades;
DROP POLICY IF EXISTS "nc_insert" ON nao_conformidades;
DROP POLICY IF EXISTS "nc_update" ON nao_conformidades;
CREATE POLICY "nc_select" ON nao_conformidades FOR SELECT USING (organizacao_id = get_user_org_id());
CREATE POLICY "nc_insert" ON nao_conformidades FOR INSERT WITH CHECK (organizacao_id = get_user_org_id());
CREATE POLICY "nc_update" ON nao_conformidades FOR UPDATE USING (organizacao_id = get_user_org_id() AND (is_admin() OR responsavel_id = auth.uid()));

DROP POLICY IF EXISTS "rec_select" ON reconhecimentos;
DROP POLICY IF EXISTS "rec_insert" ON reconhecimentos;
CREATE POLICY "rec_select" ON reconhecimentos FOR SELECT USING (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.organizacao_id = get_user_org_id())
);
CREATE POLICY "rec_insert" ON reconhecimentos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM inspecoes i WHERE i.id = inspecao_id AND i.inspetor_id = auth.uid())
);
