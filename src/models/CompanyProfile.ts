export interface PendingApproval {
  id: string
  requested_by_admin_id: string
  table_name: string
  record_id: string
  action: string
  proposed_data?: string | null
  status: string
  rejected_reason?: string | null
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  email?: string | null
  phone?: string | null
  address?: string | null
  facebook_url?: string | null
  twitter_url?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
  created_at: string
  updated_at: string
  pending_approval?: PendingApproval | null
}

export interface CompanyProfileResponse {
  status: number
  message: string
  validation: null | unknown
  data: CompanyProfile
}

export interface UpdateCompanyProfilePayload {
  email?: string | null
  phone?: string | null
  address?: string | null
  facebook_url?: string | null
  twitter_url?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
}
