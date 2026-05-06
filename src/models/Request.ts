export type RequestUrgency = 'LOW' | 'MIDDLE' | 'HIGH'

export interface RequestSubrequest {
  id: string
  request_id: string
  min_years_experience: number
  job_role_id: string
  job_role: string
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
  job_role_id: string
  min_years_experience: number
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
  jobRoleId: string | null
  minYearsExperience: number | null
  notes: string
  techStack: string
}

export interface TalentRequestFormValues {
  dueDate: number | null
  projectName: string
  projectDuration: string
  subRequests: TalentRequestSubrequestForm[]
  urgency: RequestUrgency | null
}
