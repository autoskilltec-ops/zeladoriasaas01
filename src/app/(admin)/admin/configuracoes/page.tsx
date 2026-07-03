import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { ConfiguracoesClient } from './ConfiguracoesClient'

export const dynamic = 'force-dynamic'

export default async function AdminConfiguracoesPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  const [{ data: criterios }, { data: checklist }, { data: epis }, { data: organizacao }] =
    await Promise.all([
      supabase
        .from('criterios_avaliacao')
        .select('id, nome, peso, ordem, ativo')
        .eq('ativo', true)
        .order('ordem'),
      supabase
        .from('checklist_seguranca_itens')
        .select('id, descricao, obrigatorio, ordem, ativo')
        .eq('ativo', true)
        .order('ordem'),
      supabase
        .from('epis_lista')
        .select('id, nome, obrigatorio, ordem, ativo')
        .eq('ativo', true)
        .order('ordem'),
      supabase
        .from('organizacoes')
        .select('id, nome, logo_url, meta_qualidade, meta_seguranca')
        .eq('id', user.organizacao_id)
        .single(),
    ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ConfiguracoesClient
        criteriosIniciais={(criterios ?? []).map((c) => ({
          id: c.id,
          label: c.nome,
          ordem: c.ordem,
          ativo: c.ativo,
          peso: c.peso,
        }))}
        checklistIniciais={(checklist ?? []).map((c) => ({
          id: c.id,
          label: c.descricao,
          ordem: c.ordem,
          ativo: c.ativo,
          obrigatorio: c.obrigatorio,
        }))}
        episIniciais={(epis ?? []).map((e) => ({
          id: e.id,
          label: e.nome,
          ordem: e.ordem,
          ativo: e.ativo,
          obrigatorio: e.obrigatorio,
        }))}
        organizacaoInicial={
          organizacao ?? { id: user.organizacao_id, nome: '', logo_url: null, meta_qualidade: 90, meta_seguranca: 100 }
        }
      />
    </div>
  )
}
