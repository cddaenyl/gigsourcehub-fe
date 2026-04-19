export interface RecruitmentStatus {
  id: string
  name: string
  hex_code: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface RecruitmentStatusesResponse {
  data: {
    list: RecruitmentStatus[]
    total: number
    page: number
    limit: number
    cursor?: string
  }
  status: number
  message: string
}
