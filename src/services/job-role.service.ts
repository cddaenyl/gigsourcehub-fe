import axios, { AxiosError } from 'axios'
import type { Sector, JobRole } from '@/models/JobRole'

export interface SectorsResponse {
  data: {
    list: Sector[]
  }
}

export interface JobRolesResponse {
  data: {
    list: JobRole[]
  }
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

export const getJobRolesApi = async (sectorId?: string): Promise<JobRole[]> => {
  try {
    const params = sectorId ? { sector_id: sectorId } : {}
    const response = await axios.get<JobRolesResponse>('/roles', { params })
    return response.data.data.list
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
