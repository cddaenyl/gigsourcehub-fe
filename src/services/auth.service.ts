import axios, { AxiosError } from 'axios'
import type { LoginPayload, RegisterPayload, MeResponse, ForgotPasswordPayload, ResetPasswordPayload, ResendVerificationPayload } from '@/models/Auth'

export const loginApi = async (payload: LoginPayload) => {
  try {
    const response = await axios.post('/auth/login', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const registerApi = async (payload: RegisterPayload) => {
  try {
    const response = await axios.post('/auth/register', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const meApi = async () => {
  try {
    const response = await axios.get('/auth/me')
    return response.data as MeResponse
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const forgotPasswordApi = async (payload: ForgotPasswordPayload) => {
  try {
    const response = await axios.post('/auth/forgot-password', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const resetPasswordApi = async (payload: ResetPasswordPayload) => {
  try {
    const response = await axios.post('/auth/reset-password', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const verifyAccountApi = async (token: string) => {
  try {
    const response = await axios.get(`/auth/verify?token=${token}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const refreshTokenApi = async (payload: { refresh_token: string }) => {
  try {
    const response = await axios.post('/auth/refresh', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const logoutApi = async (refreshToken?: string | null) => {
  try {
    const response = await axios.post('/auth/logout', { refresh_token: refreshToken })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const resendVerificationApi = async (payload: ResendVerificationPayload) => {
  try {
    const response = await axios.post('/auth/resend-verification', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
