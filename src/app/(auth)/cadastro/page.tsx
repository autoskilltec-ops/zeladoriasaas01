'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { cadastroSchema } from '@/lib/validations/auth'
import { APP_LOGO_URL, APP_LOGO_FALLBACK_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const formSchema = cadastroSchema
  .extend({ confirmar_senha: z.string() })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })

type FormInput = z.infer<typeof formSchema>

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoSrc, setLogoSrc] = useState(APP_LOGO_URL)

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_organizacao: '',
      nome_admin: '',
      email: '',
      senha: '',
      confirmar_senha: '',
    },
  })

  async function onSubmit(values: FormInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_organizacao: values.nome_organizacao,
          nome_admin: values.nome_admin,
          email: values.email,
          senha: values.senha,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao criar cadastro')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.senha,
      })
      if (error) {
        toast.error('Cadastro criado, mas não foi possível entrar automaticamente. Faça login.')
        router.push('/login')
        return
      }

      toast.success('Organização criada com sucesso!')
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image
            src={logoSrc}
            alt="ZeladoriaSaaS"
            width={56}
            height={58}
            priority
            unoptimized
            onError={() => setLogoSrc(APP_LOGO_FALLBACK_URL)}
            className="mx-auto mb-4 rounded-xl object-contain"
          />
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Criar organização
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Cadastre sua empresa e crie o acesso de administrador
          </p>
        </div>

        <GlassCard>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="nome_organizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da organização</FormLabel>
                    <FormControl>
                      <Input placeholder="Minha Empresa Ltda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome_admin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmar_senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="btn-primary mt-2" disabled={loading}>
                {loading ? 'Criando...' : 'Criar organização'}
              </Button>
            </form>
          </Form>
        </GlassCard>

        <p className="mt-4 text-center text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--forest-700)' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
