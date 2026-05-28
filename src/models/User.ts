import type { JobRole } from './JobRole'

export interface User {
  id: string
  name: string
  email: string
  birthdate: string | null
  school_university: string | null
  major: string | null
  gpa: number | null
  phone_number: string | null
  portofolio_link: string | null
  kabupaten_kota_id: string | null
  years_experience: number | null
  tech_stack: string | null
  summary: string | null
  profile_picture: string | null
  candidate_level?: string | null
  recruitment_status_id: string | null
  recruitment_status_name: string | null
  recruitment_status_hex_code: string | null
  unavailable_until: string | null
  system_role_name: string | null
  system_role_id: string | null
  assigned_role_id: string | null
  account_status: string | null
  must_reset_password?: boolean
  is_bookmark?: boolean
  job_title_id?: string | null
  bidang?: string | null
  job_roles?: JobRole[]
  province?: {
    id: string
    name: string
  } | null
  cv: {
    id: string
    name: string
    url: string
    created_at: string
  }
}

export interface UserRecruitmentStatusPayload {
  candidate_level: string | null
  recruitment_status_id: string | null
}

export interface FinalizeRecruitmentPayload {
  candidate_user_id: string
  start_date: string
  end_date: string
  subrequest_id: string
}

export interface UsersListData {
  list: User[]
  limit: number
  page: number
  total: number
}

export interface UsersResponse {
  status: number
  message: string
  validation: null | unknown
  data: UsersListData
}

export interface UserResponse {
  status: number
  message: string
  validation: null | unknown
  data: User
}

export interface ActiveSubrequest {
  subrequest_id: string
  request_id: string
  project_name: string
  job_role: string
}

export interface ActiveSubrequestResponse {
  status: number
  message: string
  validation: null | unknown
  data: ActiveSubrequest | null
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  tab?: string
  role?: string
}
