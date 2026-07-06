import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Uso: npm run logo:cache-control -- [caminho/para/novo-logo.png]
// Sem argumento, reenvia public/logo.png (útil só para setar o cache-control
// do arquivo já existente no bucket).
const BUCKET = 'Logos_bc'
const OBJECT_PATH = 'logo.png.png'
const LOCAL_FILE = process.argv[2]
  ? new URL(process.argv[2], `file://${process.cwd()}/`)
  : new URL('../public/logo.png', import.meta.url)
const ONE_YEAR_SECONDS = '31536000'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const file = readFileSync(LOCAL_FILE)

const { error } = await supabase.storage.from(BUCKET).update(OBJECT_PATH, file, {
  contentType: 'image/png',
  cacheControl: ONE_YEAR_SECONDS,
  upsert: true,
})

if (error) {
  console.error('Falha ao atualizar cache-control:', error.message)
  process.exit(1)
}

console.log(`Cache-Control atualizado para ${ONE_YEAR_SECONDS}s em ${BUCKET}/${OBJECT_PATH}`)
console.log('Lembrete: incremente APP_LOGO_VERSION em src/lib/constants.ts para invalidar o cache dos navegadores que já carregaram a logo anterior.')
