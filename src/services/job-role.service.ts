import axios, { AxiosError } from 'axios'
import type { Sector, JobRole } from '@/models/JobRole'

export interface SectorsResponse {
  data: {
    list: Sector[]
  }
}

export interface JobRolesListData {
  list: JobRole[]
  limit: number
  page: number
  total: number
}

export interface JobRolesResponse {
  data: JobRolesListData
}

export const getSectorsApi = async (): Promise<Sector[]> => {
  try {
    const response = await axios.get<SectorsResponse>('/sectors')
    return response.data.data.list
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Simple version for existing selectors (returns array)
export const getJobRolesApi = async (sectorId?: string): Promise<JobRole[]> => {
  try {
    const params = sectorId ? { sector_id: sectorId } : {}
    const response = await axios.get<any>('/roles', { params })
    return response.data.data.list
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Paginated version for Master Data Posisi
export const getJobRolesPaginatedApi = async (params: any = {}): Promise<JobRolesResponse> => {
  try {
    const response = await axios.get<JobRolesResponse>('/roles', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getJobRoleByIdApi = async (id: string): Promise<JobRole> => {
  try {
    const response = await axios.get<any>(`/roles/${id}`)
    return response.data.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createJobRoleApi = async (data: { name: string, sector_id: string }) => {
  try {
    const response = await axios.post('/roles', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateJobRoleApi = async (id: string, data: { name: string, sector_id: string }) => {
  try {
    const response = await axios.put(`/roles/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteJobRoleApi = async (id: string) => {
  try {
    const response = await axios.delete(`/roles/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
