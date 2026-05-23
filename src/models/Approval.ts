export interface ApprovalRequest {
  id: string
  requested_by_admin_id: string
  requested_by_admin_name?: string | null
  table_name: string
  record_id: string
  action: string
  proposed_data?: string | null
  status: string
  rejected_reason?: string | null
  reviewed_by_superadmin_id?: string | null
  created_at: string
  updated_at: string
}

export interface ApprovalListData {
  list: ApprovalRequest[]
  limit: number
  page: number
  total: number
}

export interface ApprovalListResponse {
  status: number
  message: string
  validation: null | unknown
  data: ApprovalListData
}
