import type { User } from './User'

export interface OnboardingSnapshot {
  job_role_id?: string
  job_role_name?: string
  project_name?: string
  employee_name?: string
  subrequest_id?: string
  employee_user_id?: string
}

export interface OnboardingItem {
  id: string
  candidate_user_id: string
  candidate_user: User
  start_date: string
  end_date: string
  project_name?: string | null
  job_role_name?: string | null
  snapshot: string
  created_at: string
  updated_at: string
  review_id?: string | null
  review?: {
    id: string
  } | null
}

export interface OnboardingListData {
  list: OnboardingItem[]
  limit: number
  page: number
  total: number
}

export interface OnboardingListResponse {
  status: number
  message: string
  validation: string | null
  data: OnboardingListData
}

export interface OnboardingQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface OnboardingTeamRow {
  id: string
  no: number
  nama: string
  posisi: string
  project: string
  kontrakMulai: string
  kontrakBerakhir: string
  candidateUserId: string
}
