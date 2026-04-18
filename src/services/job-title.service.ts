import axios, { AxiosError } from 'axios'
import type { JobTitlesResponse } from '@/models/JobTitle'

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
