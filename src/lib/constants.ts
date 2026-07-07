// Ao trocar o arquivo da logo no bucket, incremente essa versão para
// invalidar o cache imediatamente (a URL muda, então o cache de 1 ano
// do arquivo antigo deixa de ser servido).
export const APP_LOGO_VERSION = '1'

export const APP_LOGO_URL =
  `https://oaxqsgqqmwyueywsckys.supabase.co/storage/v1/object/public/Logos_bc/escudo%2001.png?v=${APP_LOGO_VERSION}`

export const APP_LOGO_FALLBACK_URL = '/logo.png'
