import axios, { AxiosError } from 'axios'
import type { SectorsResponse, Sector } from '@/models/Sector'

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

export const getSectorByIdApi = async (id: string): Promise<{ data: Sector }> => {
  try {
    const response = await axios.get<{ data: Sector }>(`/sectors/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createSectorApi = async (data: Partial<Sector>): Promise<any> => {
  try {
    const response = await axios.post('/sectors', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateSectorApi = async (id: string, data: Partial<Sector>): Promise<any> => {
  try {
    const response = await axios.put(`/sectors/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteSectorApi = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(`/sectors/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
