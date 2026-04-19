import axios, { AxiosError } from 'axios'
import type { RecruitmentStatusesResponse, RecruitmentStatus } from '@/models/RecruitmentStatus'

export const getRecruitmentStatusesApi = async (params: any = {}): Promise<RecruitmentStatusesResponse> => {
  try {
    const response = await axios.get<RecruitmentStatusesResponse>('/recruitment-statuses', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getRecruitmentStatusByIdApi = async (id: string): Promise<{ data: RecruitmentStatus }> => {
  try {
    const response = await axios.get<{ data: RecruitmentStatus }>(`/recruitment-statuses/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createRecruitmentStatusApi = async (data: Partial<RecruitmentStatus>): Promise<any> => {
  try {
    const response = await axios.post('/recruitment-statuses', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateRecruitmentStatusApi = async (id: string, data: Partial<RecruitmentStatus>): Promise<any> => {
  try {
    const response = await axios.put(`/recruitment-statuses/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteRecruitmentStatusApi = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(`/recruitment-statuses/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
