export interface AISearchCandidateWeight {
  seniority_match: number;
  llm_location: number;
  llm_skills: number;
  qdrant_semantic: number;
  review_score?: number;
}

export interface AISearchCandidate {
  id: string;
  name: string;
  score: number;
  score_weight: AISearchCandidateWeight;
  profile_picture_url?: string;
  job_roles?: string[];
  candidate_level?: string;
}

export interface AISearchParsedContent {
  candidates: AISearchCandidate[];
  summary: string;
}

export interface AISearchResponseItem {
  id: string;
  content: string; // The stringified JSON containing candidates and summary
  score: number;
}

export interface AISearchResponse {
  status: number;
  message: string;
  validation: null | unknown;
  data: AISearchResponseItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  parsedContent?: AISearchParsedContent; // Only present if role === 'ai'
  displayParsedContent?: boolean; // For controlling when to show the candidates card after typing
  timestamp: string;
  isTyping?: boolean; // For showing the live typing effect
}

export interface BaseResponse<T> {
  status: number
  message: string
  data: T
  validation: any
}
