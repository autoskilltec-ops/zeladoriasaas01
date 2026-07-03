import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { FotosStepClient } from './FotosStepClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FotosPage({ params }: PageProps) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const { data: inspecao } = await supabase
    .from('inspecoes')
    .select('id, foto_inicial_url, foto_final_url')
    .eq('id', id)
    .single()

  if (!inspecao) redirect('/inspecao/nova')

  async function signedUrl(path: string | null) {
    if (!path) return null
    const { data } = await supabase.storage.from('inspecoes-fotos').createSignedUrl(path, 3600)
    return data?.signedUrl ?? null
  }

  const [inicialUrl, finalUrl] = await Promise.all([
    signedUrl(inspecao.foto_inicial_url),
    signedUrl(inspecao.foto_final_url),
  ])

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <FotosStepClient inspecaoId={id} fotoInicialUrl={inicialUrl} fotoFinalUrl={finalUrl} />
    </div>
  )
}
