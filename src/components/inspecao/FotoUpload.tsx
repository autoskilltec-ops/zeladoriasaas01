'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface FotoUploadProps {
  label: string
  inspecaoId: string
  tipo: 'inicial' | 'final'
  previewUrl: string | null
  onUploaded: (path: string) => void
}

const MAX_DIMENSION = 1600
const MAX_SIZE = 5 * 1024 * 1024
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function compressImage(file: File): Promise<Blob> {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Erro ao comprimir imagem'))),
      'image/jpeg',
      0.82
    )
  })
}

export function FotoUpload({ label, inspecaoId, tipo, previewUrl, onUploaded }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(previewUrl)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (!VALID_TYPES.includes(file.type)) {
      toast.error('Formato não suportado. Use JPEG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('Arquivo maior que 5MB')
      return
    }

    setUploading(true)
    try {
      const compressed = await compressImage(file)
      setPreview(URL.createObjectURL(compressed))

      const formData = new FormData()
      formData.append('file', compressed, `${tipo}.jpg`)
      formData.append('inspecao_id', inspecaoId)
      formData.append('tipo', tipo)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao enviar foto')
        return
      }
      onUploaded(json.data.path)
      toast.success('Foto enviada')
    } catch {
      toast.error('Erro ao processar imagem')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="glass-card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Camera size={18} style={{ color: 'var(--forest-600)' }} />
        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
      </div>

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="max-h-56 w-full rounded-lg object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => {
              setPreview(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            aria-label="Remover foto"
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <label className="btn-secondary flex cursor-pointer items-center justify-center gap-2 py-6 text-[13px]">
          {uploading ? 'Enviando...' : 'Câmera / Upload'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </label>
      )}
    </div>
  )
}
