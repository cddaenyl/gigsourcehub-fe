import axios, { AxiosError } from 'axios'
import type {
  JobVacancyListResponse,
  JobVacancySingleResponse,
  CreateJobVacancyPayload,
  UpdateJobVacancyPayload,
} from '@/models/JobVacancy'

export const getJobVacanciesApi = async (params: Record<string, unknown> = {}): Promise<JobVacancyListResponse> => {
  try {
    const response = await axios.get<JobVacancyListResponse>('/job-vacancies', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getJobVacancyByIdApi = async (id: string): Promise<JobVacancySingleResponse> => {
  try {
    const response = await axios.get<JobVacancySingleResponse>(`/job-vacancies/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createJobVacancyApi = async (data: CreateJobVacancyPayload): Promise<JobVacancySingleResponse> => {
  try {
    const response = await axios.post<JobVacancySingleResponse>('/job-vacancies', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateJobVacancyApi = async (
  id: string,
  data: UpdateJobVacancyPayload,
): Promise<JobVacancySingleResponse> => {
  try {
    const response = await axios.put<JobVacancySingleResponse>(`/job-vacancies/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteJobVacancyApi = async (id: string): Promise<{ status: number; message: string }> => {
  try {
    const response = await axios.delete<{ status: number; message: string }>(`/job-vacancies/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getPublicJobVacanciesApi = async (params: Record<string, unknown> = {}): Promise<JobVacancyListResponse> => {
  try {
    const response = await axios.get<JobVacancyListResponse>('/public/job-vacancies', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
