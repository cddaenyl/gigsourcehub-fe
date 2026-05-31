export type CareerDepartmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED'

export interface CareerDepartment {
  id: string
  name: string
  description: string
  image_url?: string | null
  author?: string | null
  status: CareerDepartmentStatus | null
  rejected_reason?: string | null
  created_at: string
  published_at?: string | null
  updated_at: string
}

export interface CareerDepartmentListData {
  list: CareerDepartment[]
  limit: number
  page: number
  total: number
}

export interface CareerDepartmentListResponse {
  status: number
  message: string
  validation: null | unknown
  data: CareerDepartmentListData
}

export interface CareerDepartmentSingleResponse {
  status: number
  message: string
  validation: null | unknown
  data: CareerDepartment
}

export interface CreateCareerDepartmentPayload {
  name: string
  description: string
}

export interface UpdateCareerDepartmentPayload {
  name: string
  description: string
}
