export interface CandidateNote {
  id: string
  admin_user_id: string
  admin_user_name: string
  candidate_user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface NotesResponse {
  status: number
  message: string
  validation: null | unknown
  data: CandidateNote[]
}

export interface CreateNotePayload {
  content: string
}

export interface CreateNoteResponse {
  status: number
  message: string
  validation: null | unknown
  data: CandidateNote
}
