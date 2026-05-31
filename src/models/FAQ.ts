export type FAQStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED'

export interface FAQ {
  id: string
  question: string
  answer: string
  author?: string | null
  status: FAQStatus | null
  rejected_reason?: string | null
  created_at: string
  published_at?: string | null
  updated_at: string
}

export interface FAQListData {
  list: FAQ[]
  limit: number
  page: number
  total: number
}

export interface FAQListResponse {
  status: number
  message: string
  validation: null | unknown
  data: FAQListData
}

export interface FAQSingleResponse {
  status: number
  message: string
  validation: null | unknown
  data: FAQ
}

export interface CreateFAQPayload {
  question: string
  answer: string
  status?: FAQStatus
}

export type UpdateFAQPayload = CreateFAQPayload
