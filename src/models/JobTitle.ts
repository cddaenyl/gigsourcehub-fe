export interface JobTitle {
  id: string
  sector_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface JobTitlesListData {
  list: JobTitle[]
  limit: number
  page: number
  total: number
}

export interface JobTitlesResponse {
  status: number
  message: string
  validation: null | unknown
  data: JobTitlesListData
}
