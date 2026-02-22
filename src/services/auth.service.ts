import axios from "axios"
import type { LoginPayload } from "@/models/Auth"

export const loginApi = async (payload: LoginPayload) => {
  const response = await axios.post("/auth/login", payload)
  return response.data
}
