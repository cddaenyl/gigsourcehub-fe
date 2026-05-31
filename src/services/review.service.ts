import axios, { AxiosError } from 'axios'
import type {
  ReviewQuestionResponse,
  ReviewDetailResponse,
  ReviewCreatePayload,
} from '@/models/Review'

export const getReviewQuestionsApi = async (): Promise<ReviewQuestionResponse> => {
  try {
    const response = await axios.get<ReviewQuestionResponse>('/review/question')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createReviewApi = async (payload: ReviewCreatePayload): Promise<ReviewDetailResponse> => {
  try {
    const response = await axios.post<ReviewDetailResponse>('/review', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getReviewDetailApi = async (id: string): Promise<ReviewDetailResponse> => {
  try {
    const response = await axios.get<ReviewDetailResponse>(`/review/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
