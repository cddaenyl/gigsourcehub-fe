import axios, { AxiosError } from 'axios'
import type { SectorsResponse } from '@/models/Sector'

export const getSectorsApi = async (params: any = {}): Promise<SectorsResponse> => {
  try {
    const response = await axios.get<SectorsResponse>('/sectors', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
