import axios, { AxiosError } from 'axios'
import type { InterviewStage, InterviewStagesResponse } from '@/models/InterviewStage'

export const getInterviewStagesApi = async (params: any = {}): Promise<InterviewStagesResponse> => {
  try {
    const response = await axios.get<InterviewStagesResponse>('/interview-stages', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getInterviewStageByIdApi = async (id: string): Promise<InterviewStage> => {
  try {
    const response = await axios.get<{ data: InterviewStage }>(`/interview-stages/${id}`)
    return response.data.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createInterviewStageApi = async (data: Partial<InterviewStage>): Promise<any> => {
  try {
    const response = await axios.post('/interview-stages', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateInterviewStageApi = async (
  id: string,
  data: Partial<InterviewStage>,
): Promise<any> => {
  try {
    const response = await axios.put(`/interview-stages/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
