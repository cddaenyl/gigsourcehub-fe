import axios, { AxiosError } from 'axios'
import type { UsersResponse, UsersQueryParams, UserResponse } from '@/models/User'

export const getUsersApi = async (params: UsersQueryParams = {}): Promise<UsersResponse> => {
  try {
    const response = await axios.get<UsersResponse>('/users/candidates', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getUserByIdApi = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axios.get<UserResponse>(`/users/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getBookmarkApi = async (params: UsersQueryParams = {}): Promise<UsersResponse> => {
  try {
    const response = await axios.get<UsersResponse>('/users/candidates', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const addBookmarkApi = async (candidateId: string): Promise<void> => {
  try {
    await axios.post('/bookmarks', { candidate_id: candidateId })
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const removeBookmarkApi = async (candidateId: string): Promise<void> => {
  try {
    await axios.delete(`/bookmarks/${candidateId}`)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
