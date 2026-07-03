export interface ApiResponse<T> {
  data: T | null
  error: { message: string } | null
}

export interface SelectOption {
  id: string
  label: string
}

export interface AuthUser {
  id: string
  organizacao_id: string
  nome: string
  email: string
  role: 'admin' | 'gestor' | 'inspetor'
}
