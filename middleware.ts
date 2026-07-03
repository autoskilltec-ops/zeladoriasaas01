import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que não exigem autenticação
const PUBLIC_PATHS = ['/login', '/cadastro']

// Rotas exclusivas de admin/gestor
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Rotas públicas: se logado, redireciona para home correta
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      // Busca role para redirecionar para o lugar certo
      const { data: user } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', session.user.id)
        .single()
      const dest = user?.role === 'inspetor' ? '/dashboard' : '/admin/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return response
  }

  // Rotas protegidas: verifica sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  )
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rotas admin: verifica role
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const { data: user } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id', session.user.id)
      .single()
    if (!user || user.role === 'inspetor') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
