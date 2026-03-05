import axios, { AxiosError } from "axios"
import type { LoginPayload, RegisterPayload } from "@/models/Auth"

export const loginApi = async (payload: LoginPayload) => {
  try {
    const response = await axios.post("/auth/login", payload)
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
    const response = await axios.post("/auth/register", payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
