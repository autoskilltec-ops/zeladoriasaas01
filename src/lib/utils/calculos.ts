export function calcularIQL(avaliacoes: { nota: number; peso: number }[]): number {
  if (avaliacoes.length === 0) return 0
  const somaPeso = avaliacoes.reduce((acc, a) => acc + a.peso, 0)
  if (somaPeso === 0) return 0
  const somaPonderada = avaliacoes.reduce((acc, a) => acc + a.nota * a.peso, 0)
  return Math.round((somaPonderada / (somaPeso * 5)) * 100 * 100) / 100
}

export function calcularCS(respostas: { conforme: boolean }[]): number {
  if (respostas.length === 0) return 0
  const conformes = respostas.filter((r) => r.conforme).length
  return Math.round((conformes / respostas.length) * 100 * 100) / 100
}

export function classificarIndice(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'Excelente', color: 'var(--baixo)' }
  if (pct >= 75) return { label: 'Bom', color: 'var(--medio)' }
  if (pct >= 60) return { label: 'Regular', color: 'var(--alto)' }
  return { label: 'Crítico', color: 'var(--critico)' }
}

export function corCriticidade(criticidade: 'critico' | 'alto' | 'medio' | 'baixo'): string {
  return {
    critico: 'var(--critico)',
    alto: 'var(--alto)',
    medio: 'var(--medio)',
    baixo: 'var(--baixo)',
  }[criticidade]
}

export function criticidadeMaisAlta(
  criticidades: ('critico' | 'alto' | 'medio' | 'baixo')[]
): 'critico' | 'alto' | 'medio' | 'baixo' | null {
  const ordem: ('critico' | 'alto' | 'medio' | 'baixo')[] = ['critico', 'alto', 'medio', 'baixo']
  for (const nivel of ordem) {
    if (criticidades.includes(nivel)) return nivel
  }
  return null
}
