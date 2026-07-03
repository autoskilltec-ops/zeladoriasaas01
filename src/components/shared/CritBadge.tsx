import { Badge } from '@/components/ui/badge'
import { corCriticidade } from '@/lib/utils/calculos'
import { formatCriticidade } from '@/lib/utils/formatters'
import type { CriticidadeNivel } from '@/types/database'

interface CritBadgeProps {
  criticidade: CriticidadeNivel
}

export function CritBadge({ criticidade }: CritBadgeProps) {
  return (
    <Badge
      style={{
        backgroundColor: corCriticidade(criticidade),
        color: '#fff',
      }}
    >
      {formatCriticidade(criticidade)}
    </Badge>
  )
}
