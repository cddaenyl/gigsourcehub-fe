export interface UserPreview {
  id: string
  name: string
  email: string
  profile_picture: string | null
  system_role_name: string | null
}

export interface ReplyTo {
  id: string
  content: string
  sender_name: string
}

export interface MessageResp {
  id: string
  conversation_id: string
  content: string
  sender_user_id: string
  sender_name?: string
  sender_profile_picture?: string | null
  reply_to_message_id?: string | null
  reply_to?: ReplyTo | null
  read_at: string | null
  created_at: string
}

export interface ConversationResp {
  id: string
  subrequest_id?: string
  admin_user_id?: string
  admin_user_name?: string
  admin_user_profile_picture?: string | null
  candidate_user_id: string
  candidate_user_name: string
  candidate_user_profile_picture?: string | null
  last_message: MessageResp | null
  created_at: string
  updated_at: string
}

export interface CreateConversationRequest {
  candidate_user_id: string
  subrequest_id: string
}

export interface SendMessageRequest {
  content: string
  reply_to_message_id?: string | null
}

export interface ChatListResponse {
  list: ConversationResp[]
  limit: number
  page: number
  total: number
  cursor: string | null
}

export interface MessageListResponse {
  list: MessageResp[]
  limit: number
  page: number
  total: number
  cursor: string | null
}

export interface BaseChatListResponse {
  status: number
  message: string
  validation: null | unknown
  data: ChatListResponse
}

export interface BaseMessageListResponse {
  status: number
  message: string
  validation: null | unknown
  data: MessageListResponse
}

export interface BaseConversationResponse {
  status: number
  message: string
  validation: null | unknown
  data: ConversationResp
}

export interface BaseMessageResponse {
  status: number
  message: string
  validation: null | unknown
  data: MessageResp
}

export interface WebSocketMessage {
  event: string
  data: any
}
