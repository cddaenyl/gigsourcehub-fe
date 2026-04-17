export type RequestUrgency = 'LOW' | 'MIDDLE' | 'HIGH'

export interface CreateRequestPayload {
  due_date: string
  project_name: string
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
  subRequests: TalentRequestSubrequestForm[]
  urgency: RequestUrgency | null
}
