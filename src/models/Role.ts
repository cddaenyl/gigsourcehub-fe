export interface Role {
  id: string
  sector_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface RolesListData {
  list: Role[]
  limit: number
  page: number
  total: number
}

export interface RolesResponse {
  status: number
  message: string
  validation: null | unknown
  data: RolesListData
}

export interface RolesQueryParams {
  page?: number
  limit?: number
  search?: string
}
