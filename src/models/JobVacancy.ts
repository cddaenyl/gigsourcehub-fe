export type JobVacancyStatus = 'DRAFT' | 'ARCHIVED' | 'PUBLISHED'
export type JobVacancySchema = 'ONSITE' | 'REMOTE' | 'HYBRID'

/** Struktur JSON yang disimpan di kolom `description` (type: jsonb) */
export interface JobVacancyDescription {
  job_desc: string[]
  qualifications: string[]
  benefits: string[]
}

export interface JobVacancySubrequest {
  id: string
  request_id: string
  job_role_id?: string | null
  job_role?: string | null
  bidang?: string | null
  level?: string | null
  tech_stack?: string | null
  notes?: string | null
  is_filled: boolean
  overview?: string | null
  project_duration?: string | null
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
  /** JSON string dengan struktur JobVacancyDescription */
  description: string | null
  overview: string | null
  created_at: string
  updated_at: string

  // Flattened fields from subrequest for public API
  project_name?: string
  project_duration?: string | null
  level?: string | null
  bidang?: string | null
  tech_stack?: string | null
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
  /** JSON.stringify dari JobVacancyDescription */
  description?: string | null
  overview?: string | null
}

export type UpdateJobVacancyPayload = CreateJobVacancyPayload

/** Helper: parse description string ke JobVacancyDescription dengan fallback aman */
export function parseJobVacancyDescription(description: string | null | undefined): JobVacancyDescription {
  if (!description) return { job_desc: [], qualifications: [], benefits: [] }
  try {
    const parsed = JSON.parse(description)
    return {
      job_desc: Array.isArray(parsed.job_desc) ? parsed.job_desc : [],
      qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
    }
  } catch {
    return { job_desc: [], qualifications: [], benefits: [] }
  }
}

/** Helper: stringify JobVacancyDescription ke JSON string, return null jika semua kosong */
export function stringifyJobVacancyDescription(desc: JobVacancyDescription): string | null {
  if (!desc.job_desc.length && !desc.qualifications.length && !desc.benefits.length) return null
  return JSON.stringify(desc)
}
