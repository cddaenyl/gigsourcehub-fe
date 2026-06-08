import axios, { AxiosError } from 'axios'

export interface AdminDashboardSummary {
  kpis: {
    time_to_hire_days: number
    offer_acceptance_rate: number
    active_job_vacancies: number
    interview_attendance_rate: number
    avg_review_score: number
  }
  upcoming_interviews: Array<{
    id: string
    candidate_user_id: string
    candidate_user_name?: string
    candidate_user_profile_picture?: string
    stage_id: string
    stage?: {
      id: string
      name: string
    }
    subrequest_id?: string
    subrequest?: {
      id: string
      project_name?: string
      job_role?: string
    }
    scheduled_at: string
    status: string
  }>
  requests_summary: {
    total_requests: number
    fulfilled_requests: number
    waiting_validation_requests: number
    in_progress_requests: number
    request_fulfillment_percentage: number
    required_headcount: number
    filled_headcount: number
    headcount_fulfillment_percentage: number
  }
  alerts: {
    pending_approvals: number
    overdue_requests: number
    interviews_scheduled_today: number
    unassigned_requests: number
    expiring_placements: number
  }
  recent_activities: Array<{
    id: string
    actor_name: string
    action_type: string
    module: string
    description: string
    created_at: string
  }>
}

export interface AdminDashboardSummaryResponse {
  status: number
  message: string
  data: AdminDashboardSummary
}

export interface DashboardAnalytics {
  trends: Array<{
    period: string
    applicants: number
    interviews: number
    hires: number
  }>
}

export interface DashboardAnalyticsResponse {
  status: number
  message: string
  data: DashboardAnalytics
}

export interface SuperadminDashboardSummary {
  pending_approvals_count: number
  total_candidates: number
  total_admins: number
  total_employees: number
  active_job_vacancies: number
  is_ai_mode_enabled: boolean
  recent_approvals: Array<{
    id: string
    table_name: string
    action: string
    status: string
    requested_by_name: string
    created_at: string
    updated_at: string
  }>
}

export interface SuperadminDashboardResponse {
  status: number
  message: string
  data: SuperadminDashboardSummary
}

export const getAdminDashboardSummaryApi = async (): Promise<AdminDashboardSummaryResponse> => {
  try {
    const response = await axios.get<AdminDashboardSummaryResponse>('/dashboard/admin/summary')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getAdminDashboardAnalyticsApi = async (period?: string): Promise<DashboardAnalyticsResponse> => {
  try {
    const response = await axios.get<DashboardAnalyticsResponse>('/dashboard/admin/analytics', {
      params: { period }
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getSuperadminDashboardSummaryApi = async (): Promise<SuperadminDashboardResponse> => {
  try {
    const response = await axios.get<SuperadminDashboardResponse>('/dashboard/superadmin/summary')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
