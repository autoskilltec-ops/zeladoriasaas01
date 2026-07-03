'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { inspetorSchema } from '@/lib/validations/auth'

const formSchema = inspetorSchema
  .extend({ confirmar_senha: z.string() })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })

type FormInput = z.infer<typeof formSchema>

interface InspetorPopupProps {
  open: boolean
  onClose: () => void
  onSuccess: (inspetor: { id: string; nome: string; email: string }) => void
}

export function InspetorPopup({ open, onClose, onSuccess }: InspetorPopupProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmar_senha: '' },
  })

  async function onSubmit(values: FormInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/inspetor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: values.nome, email: values.email, senha: values.senha }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao criar inspetor')
        return
      }
      toast.success('Inspetor criado com sucesso')
      onSuccess(json.data)
      form.reset()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Inspetor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
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
            <Button type="submit" className="btn-primary mt-1" disabled={loading}>
              {loading ? 'Criando...' : 'Criar inspetor'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
