export type InterviewScheduleTab = 'semua' | 'scheduled'

export type InterviewMethod = 'Online' | 'Offline' | string
export type InterviewStatus = 'SCHEDULED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED' | string

export interface InterviewStageSummary {
  id: string
  name: string
  hex_code: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface InterviewSubrequestSummary {
  id: string
  request_id: string
  project_name: string
  level: string | null
  job_role_id: string
  job_role: string
  tech_stack: string
  notes: string
  is_filled: boolean
  overview: string | null
}

export interface InterviewScheduleItem {
  id: string
  admin_user_id: string
  candidate_user_id: string
  candidate_user_name: string
  subrequest_id: string
  subrequest: InterviewSubrequestSummary
  stage_id: string
  stage: InterviewStageSummary
  title: string
  description: string
  scheduled_at: string
  method: InterviewMethod
  status: InterviewStatus
  meeting_link: string
  meeting_location: string
  is_email_sent: boolean
  created_at: string
  updated_at: string
}

export interface InterviewScheduleListData {
  list: InterviewScheduleItem[]
  limit: number
  page: number
  total: number
}

export interface InterviewScheduleResponse {
  status: number
  message: string
  validation: string | null
  data: InterviewScheduleListData
}

export interface InterviewScheduleQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface InterviewSchedulePatchPayload {
  interview_id: string
  stage_id: string
  status: string
}
