import axios, { AxiosError } from 'axios'
import type { AISearchResponse } from '@/models/CandidateSearch'

export const searchCandidatesApi = async (query: string): Promise<AISearchResponse> => {
  try {
    const response = await axios.post<AISearchResponse>('/search', { query })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
