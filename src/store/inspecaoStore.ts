import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { EpiStatus, ReconhecimentoNivel, CriticidadeNivel, NcTipo } from '@/types/database'

export interface NcRascunho {
  tipo: NcTipo
  descricao: string
  criticidade: CriticidadeNivel
  acao_corretiva: string
  prazo_correcao: string
  responsavel_id?: string
}

export interface SegurancaRascunho {
  respostas: Record<string, boolean>
  statusGeralEpi: EpiStatus | null
  episAusentes: string[]
  equipamentosBons: boolean | null
  observacoes: string
}

export interface ReconhecimentoRascunho {
  houve: boolean
  nivel: ReconhecimentoNivel | null
  descricao: string
}

interface InspecaoState {
  inspecaoId: string | null
  localId: string | null
  zeladorId: string | null
  dataInspecao: string | null
  fotoInicialUrl: string | null
  fotoFinalUrl: string | null
  avaliacoes: Record<string, number>
  seguranca: SegurancaRascunho
  naoConformidades: NcRascunho[]
  reconhecimento: ReconhecimentoRascunho

  setInspecaoId: (id: string) => void
  setDadosVisita: (data: { localId: string; zeladorId: string; dataInspecao: string }) => void
  setFotoInicial: (url: string | null) => void
  setFotoFinal: (url: string | null) => void
  setAvaliacao: (criterioId: string, nota: number) => void
  setSeguranca: (data: Partial<SegurancaRascunho>) => void
  toggleRespostaChecklist: (itemId: string, conforme: boolean) => void
  addNaoConformidade: (nc: NcRascunho) => void
  removeNaoConformidade: (index: number) => void
  setReconhecimento: (data: Partial<ReconhecimentoRascunho>) => void
  reset: () => void
}

const initialState = {
  inspecaoId: null,
  localId: null,
  zeladorId: null,
  dataInspecao: null,
  fotoInicialUrl: null,
  fotoFinalUrl: null,
  avaliacoes: {},
  seguranca: {
    respostas: {},
    statusGeralEpi: null,
    episAusentes: [],
    equipamentosBons: null,
    observacoes: '',
  },
  naoConformidades: [],
  reconhecimento: {
    houve: false,
    nivel: null,
    descricao: '',
  },
} satisfies Omit<
  InspecaoState,
  | 'setInspecaoId'
  | 'setDadosVisita'
  | 'setFotoInicial'
  | 'setFotoFinal'
  | 'setAvaliacao'
  | 'setSeguranca'
  | 'toggleRespostaChecklist'
  | 'addNaoConformidade'
  | 'removeNaoConformidade'
  | 'setReconhecimento'
  | 'reset'
>

export const useInspecaoStore = create<InspecaoState>()(
  persist(
    (set) => ({
      ...initialState,

      setInspecaoId: (id) => set({ inspecaoId: id }),

      setDadosVisita: ({ localId, zeladorId, dataInspecao }) =>
        set({ localId, zeladorId, dataInspecao }),

      setFotoInicial: (url) => set({ fotoInicialUrl: url }),
      setFotoFinal: (url) => set({ fotoFinalUrl: url }),

      setAvaliacao: (criterioId, nota) =>
        set((state) => ({ avaliacoes: { ...state.avaliacoes, [criterioId]: nota } })),

      setSeguranca: (data) => set((state) => ({ seguranca: { ...state.seguranca, ...data } })),

      toggleRespostaChecklist: (itemId, conforme) =>
        set((state) => ({
          seguranca: {
            ...state.seguranca,
            respostas: { ...state.seguranca.respostas, [itemId]: conforme },
          },
        })),

      addNaoConformidade: (nc) =>
        set((state) => ({ naoConformidades: [...state.naoConformidades, nc] })),

      removeNaoConformidade: (index) =>
        set((state) => ({
          naoConformidades: state.naoConformidades.filter((_, i) => i !== index),
        })),

      setReconhecimento: (data) =>
        set((state) => ({ reconhecimento: { ...state.reconhecimento, ...data } })),

      reset: () => set(initialState),
    }),
    {
      name: 'inspecao-wizard',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
