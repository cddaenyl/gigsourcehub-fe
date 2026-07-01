export type RequestUrgency = 'LOW' | 'MIDDLE' | 'HIGH'
export type RequestLevel = 'Junior' | 'Middle' | 'Senior'

export interface RequestSubrequest {
  id: string
  request_id: string
  level: RequestLevel | null
  job_role_id: string
  job_role: string
  bidang?: string | null
  tech_stack: string
  notes: string
  is_filled: boolean
  overview: string | null
}

export interface RequestItem {
  id: string
  project_name: string
  project_duration: string | null
  due_date: string
  admin_user_id: string | null
  admin_name: string
  employee_user_id: string | null
  required_headcount: number
  status: string
  urgency: RequestUrgency
  fulfillment_date: string | null
  rejected_reason: string | null
  subrequests: RequestSubrequest[]
  created_at: string
  updated_at: string
}

export interface RequestDecisionPayload {
  rejected_reason: string
}

export interface AssignCandidatePayload {
  candidate_user_id: string
}

export interface AssignCandidateResponse {
  status: number
  message: string
  validation: string | null
  data: unknown
}

export interface GetRequestResponse {
  status: number
  message: string
  validation: string | null
  data: RequestItem
}

export interface RequestActionResponse {
  status: number
  message: string
  validation: string | null
  data: RequestItem
}

export interface RequestListData {
  list: RequestItem[]
  limit: number
  page: number
  total: number
}

export interface RequestQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  urgency?: string
  proposed_by?: string
  admin_name?: string
  format?: string
}

export interface GetRequestsResponse {
  status: number
  message: string
  validation: string | null
  data: RequestListData
}

export interface CreateRequestPayload {
  due_date: string
  project_name: string
  project_duration: string | null
  subrequests: RequestSubrequestPayload[]
  urgency: RequestUrgency
}

export interface RequestSubrequestPayload {
  id?: string
  job_role_id: string
  level: RequestLevel
  overview: string | null
  notes: string
  tech_stack: string[]
}

export interface CreateRequestResponse {
  status: number
  message: string
  validation: string | null
  data: {
    request: CreateRequestPayload
  }
}

export interface TalentRequestSubrequestForm {
  id?: string
  overview: string | null
  jobRoleId: string | null
  level: RequestLevel | null
  notes: string
  techStack: string[]
}

export interface TalentRequestFormValues {
  dueDate: number | null
  projectName: string
  projectDuration: string
  subRequests: TalentRequestSubrequestForm[]
  urgency: RequestUrgency | null
}
