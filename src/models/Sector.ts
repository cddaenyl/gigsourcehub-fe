export interface Sector {
  id: string
  name: string
  hex_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SectorsListData {
  list: Sector[]
  limit: number
  page: number
  total: number
}

export interface SectorsResponse {
  status: number
  message: string
  validation: null | unknown
  data: SectorsListData
}
