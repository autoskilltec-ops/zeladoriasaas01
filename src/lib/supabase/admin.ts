import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// APENAS server — NUNCA importar em componentes 'use client'
let client: SupabaseClient | undefined

// Instanciação preguiçosa: evita quebrar o build (collecting page data)
// quando as env vars ainda não estão configuradas.
export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return client
}
