'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { GlassCard } from '@/components/shared/GlassCard'
import { supabase } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  })

  async function onSubmit(values: LoginInput) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.senha,
    })
    setLoading(false)

    if (error) {
      toast.error('E-mail ou senha inválidos')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Image
        src="/bg-login.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0" style={{ background: 'rgba(31, 74, 44, 0.7)' }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image
            src="/logo.png"
            alt="ZeladoriaSaaS"
            width={56}
            height={58}
            priority
            className="mx-auto mb-4 rounded-xl object-contain"
          />
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-on-dark)' }}>
            Entrar
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-on-dark-muted)' }}>
            Acesse sua conta ZeladoriaSaaS
          </p>
        </div>

        <GlassCard>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="voce@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="btn-primary mt-2" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </GlassCard>

        <p className="mt-4 text-center text-[13px]" style={{ color: 'var(--text-on-dark-muted)' }}>
          Ainda não tem uma organização?{' '}
          <Link href="/cadastro" className="font-medium" style={{ color: 'var(--text-on-dark)' }}>
            Criar cadastro
          </Link>
        </p>
      </div>
    </div>
  )
}
