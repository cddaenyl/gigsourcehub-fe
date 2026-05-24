import axios, { AxiosError } from 'axios'
import type {
  CreateInterviewPayload,
  InterviewScheduleDetailResponse,
  InterviewSchedulePatchPayload,
  InterviewScheduleQueryParams,
  InterviewScheduleResponse,
} from '@/models/InterviewSchedule'

export const getInterviewsApi = async (
  params: InterviewScheduleQueryParams = {},
): Promise<InterviewScheduleResponse> => {
  try {
    const response = await axios.get<InterviewScheduleResponse>('/interview', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getScheduledInterviewsApi = async (
  params: InterviewScheduleQueryParams = {},
): Promise<InterviewScheduleResponse> => {
  try {
    const response = await axios.get<InterviewScheduleResponse>('/interview/scheduled', {
      params,
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const patchInterviewStageApi = async (
  payload: InterviewSchedulePatchPayload,
): Promise<InterviewScheduleResponse> => {
  try {
    const response = await axios.patch<InterviewScheduleResponse>('/interview/stage', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const patchInterviewStatusApi = async (
  payload: InterviewSchedulePatchPayload,
): Promise<InterviewScheduleResponse> => {
  try {
    const response = await axios.patch<InterviewScheduleResponse>('/interview/status', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createInterviewApi = async (
  payload: CreateInterviewPayload,
): Promise<InterviewScheduleDetailResponse> => {
  try {
    const response = await axios.post<InterviewScheduleDetailResponse>('/interview', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getInterviewByIdApi = async (id: string): Promise<InterviewScheduleDetailResponse> => {
  try {
    const response = await axios.get<InterviewScheduleDetailResponse>(`/interview/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
