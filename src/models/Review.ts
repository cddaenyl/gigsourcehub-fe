export interface ReviewAnswer {
  question_id: string
  indicator: string
  question_text: string
  question_order: number
  score: number
}

export const REVIEW_FINAL_RECOMMENDATIONS = [
  'HIGHLY_RECOMMENDED',
  'RECOMMENDED',
  'CONSIDERED',
  'NOT_RECOMMENDED',
] as const

export type ReviewFinalRecommendation = (typeof REVIEW_FINAL_RECOMMENDATIONS)[number]

export interface Review {
  id: string
  subrequest_id: string
  candidate_user_id: string
  employee_user_id: string
  onboard_history_id: string
  final_recommendation: ReviewFinalRecommendation
  notes: string
  answers: ReviewAnswer[]
  created_at?: string
  updated_at?: string
}

export interface ReviewQuestion {
  id: string
  indicator: string // WORK_QUALITY, TIMELINESS, COMMUNICATION_COLLABORATION, PROBLEM_SOLVING_INITIATIVE
  question_text: string
  question_order: number
}

export interface ReviewQuestionResponse {
  status: number
  message: string
  validation: null | unknown
  data: ReviewQuestion[]
}

export interface ReviewDetailResponse {
  status: number
  message: string
  validation: null | unknown
  data: Review
}

export interface ReviewCreatePayload {
  onboard_history_id: string
  final_recommendation: ReviewFinalRecommendation
  notes: string
  work_quality: number[]
  timeliness: number[]
  communication_collaboration: number[]
  problem_solving_initiative: number[]
}
