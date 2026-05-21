export interface InterviewStage {
  id: string
  name: string
  hex_code: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface InterviewStagesListData {
  list: InterviewStage[]
  limit: number
  page: number
  total: number
}

export interface InterviewStagesResponse {
  data: InterviewStagesListData
  status: number
  message: string
}
