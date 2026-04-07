import type { User } from './User'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  name: string
  password: string
}

export interface LoginResponse {
  status: number
  message: string
  validation: string | null
  data: {
    token: string
    user: User
  }
}

export interface RegisterResponse {
  status: number
  message: string
  validation: string | null
  data: {
    email: string
    name: string
    token: string
  }
}

export interface MeResponse {
  status: number
  message: string
  validation: string | null
  data: {
    id: string
    name: string
    email: string
    profile_picture: null
    system_role_name: string
  }
}
