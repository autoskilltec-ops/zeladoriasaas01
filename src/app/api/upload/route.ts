import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 5 * 1024 * 1024

function detectMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png'
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const formData = await req.formData().catch(() => null)
  if (!formData) return err('Formulário inválido', 400)

  const file = formData.get('file')
  const inspecaoId = formData.get('inspecao_id')
  const tipo = formData.get('tipo')

  if (!(file instanceof File)) return err('Arquivo obrigatório', 400)
  if (typeof inspecaoId !== 'string' || !inspecaoId) return err('inspecao_id obrigatório', 400)
  if (tipo !== 'inicial' && tipo !== 'final') return err('tipo inválido', 400)

  if (file.size > MAX_SIZE) return err('Arquivo maior que 5MB', 413)

  const buffer = new Uint8Array(await file.arrayBuffer())
  const mime = detectMime(buffer)
  if (!mime) return err('Tipo de arquivo não suportado', 415)

  // RLS já restringe a leitura à organização/inspetor corretos — checagem explícita adicional
  const { data: inspecao, error: inspecaoError } = await supabase
    .from('inspecoes')
    .select('id, organizacao_id, inspetor_id')
    .eq('id', inspecaoId)
    .single()

  if (inspecaoError || !inspecao) return err('Inspeção não encontrada', 404)
  if (inspecao.inspetor_id !== user.id && !['admin', 'gestor'].includes(user.role)) {
    return err('Sem permissão', 403)
  }

  const path = `${inspecao.organizacao_id}/${inspecaoId}/${tipo}-${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('inspecoes-fotos')
    .upload(path, buffer, { contentType: mime, upsert: false })

  if (uploadError) return err(uploadError.message, 500)

  const { data: signed, error: signedError } = await supabase.storage
    .from('inspecoes-fotos')
    .createSignedUrl(path, 60 * 60)

  if (signedError || !signed) return err(signedError?.message ?? 'Erro ao gerar URL', 500)

  const campo = tipo === 'inicial' ? 'foto_inicial_url' : 'foto_final_url'
  await supabase
    .from('inspecoes')
    .update({ [campo]: path })
    .eq('id', inspecaoId)

  return ok({ path, url: signed.signedUrl })
}
