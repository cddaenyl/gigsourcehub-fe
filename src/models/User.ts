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
  profile_picture: string | null
  candidate_level?: string | null
  recruitment_status_id: string | null
  unavailable_until: string | null
  system_role_name: string | null
  assigned_role_id: string | null
  account_status: string | null
  is_bookmark?: boolean
  job_title_id?: string | null
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

export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  tab?: string
}
