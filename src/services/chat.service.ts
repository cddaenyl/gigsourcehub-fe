import axios from 'axios'
import type {
  BaseChatListResponse,
  BaseMessageListResponse,
  BaseConversationResponse,
  BaseMessageResponse,
  CreateConversationRequest,
  SendMessageRequest,
} from '@/models/Chat'
import type { BaseResponse } from '@/models/CandidateSearch'

export const createConversationApi = async (payload: CreateConversationRequest) => {
  const response = await axios.post<BaseConversationResponse>('/chats', payload)
  return response.data
}

export const fetchMyConversationsApi = async (page: number = 1, limit: number = 10) => {
  const response = await axios.get<BaseChatListResponse>(`/chats?page=${page}&limit=${limit}`)
  return response.data
}

export const getConversationApi = async (id: string) => {
  const response = await axios.get<BaseConversationResponse>(`/chats/${id}`)
  return response.data
}

export const fetchMessagesApi = async (id: string, page: number = 1, limit: number = 20) => {
  const response = await axios.get<BaseMessageListResponse>(
    `/chats/${id}/messages?page=${page}&limit=${limit}`,
  )
  return response.data
}

export const sendMessageApi = async (id: string, payload: SendMessageRequest) => {
  const response = await axios.post<BaseMessageResponse>(`/chats/${id}/messages`, payload)
  return response.data
}

export const markAsReadApi = async (id: string) => {
  const response = await axios.put<BaseResponse<null>>(`/chats/${id}/read`)
  return response.data
}

export const startChatApi = async (payload: {
  candidate_user_id: string
  subrequest_id: string
}) => {
  const response = await axios.post<BaseConversationResponse>('/chats/start', payload)
  return response.data
}
