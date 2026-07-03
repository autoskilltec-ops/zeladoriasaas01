import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const ok = (data: unknown, status = 200) =>
  NextResponse.json({ data, error: null }, { status })

export const err = (message: string, status = 400) =>
  NextResponse.json({ data: null, error: { message } }, { status })

export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { user: null, supabase, error: 'UNAUTHORIZED' as const }

  const { data: user } = await supabase
    .from('usuarios')
    .select('id, role, organizacao_id, nome, email')
    .eq('id', session.user.id)
    .single()

  return { user, supabase, error: user ? null : ('USER_NOT_FOUND' as const) }
}
