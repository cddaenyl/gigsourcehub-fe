import axios, { AxiosError } from 'axios'
import type { ActivityLog } from '@/models/ActivityLog'

export interface ActivityLogsResponse {
  status: number
  message: string
  data: {
    list: ActivityLog[]
    limit: number
    page: number
    total?: number
    cursor?: string | null
  }
}

export const getActivityLogsApi = async (params: any = {}): Promise<ActivityLogsResponse> => {
  try {
    const response = await axios.get<ActivityLogsResponse>('/activity-logs', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
export const downloadActivityLogsApi = async (params: any = {}): Promise<Blob> => {
  try {
    const response = await axios.get('/activity-logs/export', { 
      params, 
      responseType: 'blob'
    })
    return new Blob([response.data], { type: response.headers['content-type'] })
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
