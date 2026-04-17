import axios from "axios"
import type { BaseResponse } from '@/models/CandidateSearch'

export const fetchMyAIChatsApi = async () => {
  const response = await axios.get<BaseResponse<any[]>>('/ai-chat')
  return response.data
}

export const createAIChatApi = async (firstQuery?: string) => {
  const response = await axios.post<BaseResponse<any>>('/ai-chat', {
    first_query: firstQuery
  })
  return response.data
}

export const deleteAIChatApi = async (id: string) => {
  const response = await axios.delete<BaseResponse<null>>(`/ai-chat/${id}`)
  return response.data
}

export const fetchAIChatMessagesApi = async (id: string) => {
  const response = await axios.get<BaseResponse<any[]>>(`/ai-chat/${id}/messages`)
  return response.data
}

export const storeAIChatMessageApi = async (id: string, role: string, content: string, isLast: boolean = false) => {
  const response = await axios.post<BaseResponse<any>>(`/ai-chat/${id}/messages`, {
    role,
    content,
    is_last: isLast
  })
  return response.data
}
