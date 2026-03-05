export interface User {
  id: string
  name: string
  email: string
  birthdate: string | null
  school_university: string | null
  major: string | null
  gpa: string | null
  phone_number: string | null
  portofolio_link: string | null
  kabupaten_kota_id: string | null
  years_experience: number | null
  tech_stack: string | null
  profile_picture: string | null
  recruitment_status_id: string | null
  unavailable_until: string | null
  system_role_name: string
  assigned_role_id: string | null
  account_status: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  name: string
  password: string
}

export interface LoginResponse {
  status: number
  message: string
  validation: string | null
  data: {
    token: string
    user: User
  }
}

export interface RegisterResponse {
  status: number
  message: string
  validation: string | null
  data: {
    email: string
    name: string
    token: string
  }
}
