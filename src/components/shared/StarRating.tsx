'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value, onChange, readonly = false, size = 20 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Avaliação por estrelas">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn('transition-transform', !readonly && 'hover:scale-110 cursor-pointer')}
        >
          <Star
            size={size}
            fill={star <= value ? 'var(--gold)' : 'none'}
            stroke={star <= value ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
