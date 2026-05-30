import axios, { AxiosError } from 'axios'
import type { JobTitle } from '@/models/JobTitle'

export interface JobTitlesListData {
  list: JobTitle[]
  limit: number
  page: number
  total: number
}

export interface JobTitlesResponse {
  data: JobTitlesListData
}

export const getJobTitlesApi = async (params: any = {}): Promise<JobTitlesResponse> => {
  try {
    const response = await axios.get<JobTitlesResponse>('/job-titles', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getJobTitleByIdApi = async (id: string): Promise<JobTitle> => {
  try {
    const response = await axios.get<any>(`/job-titles/${id}`)
    return response.data.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createJobTitleApi = async (data: { name: string, sector_id: string }) => {
  try {
    const response = await axios.post('/job-titles', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateJobTitleApi = async (id: string, data: { name: string, sector_id: string, is_active?: boolean }) => {
  try {
    const response = await axios.put(`/job-titles/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteJobTitleApi = async (id: string) => {
  try {
    const response = await axios.delete(`/job-titles/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
