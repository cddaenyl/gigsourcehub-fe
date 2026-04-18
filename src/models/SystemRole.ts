export interface SystemRole {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface SystemRolesResponse {
  status: number
  message: string
  validation: null | unknown
  data: SystemRole[]
}
