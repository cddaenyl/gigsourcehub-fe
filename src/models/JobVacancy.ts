export type JobVacancyStatus = 'DRAFT' | 'ARCHIVED' | 'PUBLISHED'
export type JobVacancySchema = 'ONSITE' | 'REMOTE' | 'HYBRID'

export interface JobVacancySubrequest {
  id: string
  request_id: string
  job_role_id?: string | null
  job_role?: string | null
  level?: string | null
  tech_stack?: string | null
  notes?: string | null
  is_filled: boolean
  overview?: string | null
}

export interface JobVacancy {
  id: string
  subrequest_id: string
  subrequest?: JobVacancySubrequest
  name: string
  takedown_date: string | null
  fulfillment_date: string | null
  schema: JobVacancySchema | null
  status: JobVacancyStatus | null
  description: string | null
  overview: string | null
  created_at: string
  updated_at: string
}

export interface JobVacancyListData {
  list: JobVacancy[]
  limit: number
  page: number
  total: number
  cursor?: string | null
}

export interface JobVacancyListResponse {
  status: number
  message: string
  validation: null | unknown
  data: JobVacancyListData
}

export interface JobVacancySingleResponse {
  status: number
  message: string
  validation: null | unknown
  data: JobVacancy
}

export interface CreateJobVacancyPayload {
  subrequest_id: string
  name: string
  takedown_date?: string | null
  fulfillment_date?: string | null
  schema?: JobVacancySchema | null
  status?: JobVacancyStatus | null
  description?: string | null
  overview?: string | null
}

export type UpdateJobVacancyPayload = CreateJobVacancyPayload
