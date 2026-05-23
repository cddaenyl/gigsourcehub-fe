import axios, { AxiosError } from 'axios'
import type {
  FAQListResponse,
  FAQSingleResponse,
  CreateFAQPayload,
  UpdateFAQPayload,
} from '@/models/FAQ'

export const getFAQsApi = async (params: Record<string, unknown> = {}): Promise<FAQListResponse> => {
  try {
    const response = await axios.get<FAQListResponse>('/faqs', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getFAQByIdApi = async (id: string): Promise<FAQSingleResponse> => {
  try {
    const response = await axios.get<FAQSingleResponse>(`/faqs/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createFAQApi = async (data: CreateFAQPayload): Promise<FAQSingleResponse> => {
  try {
    const response = await axios.post<FAQSingleResponse>('/faqs', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateFAQApi = async (
  id: string,
  data: UpdateFAQPayload,
): Promise<FAQSingleResponse> => {
  try {
    const response = await axios.put<FAQSingleResponse>(`/faqs/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteFAQApi = async (id: string): Promise<{ status: number; message: string }> => {
  try {
    const response = await axios.delete<{ status: number; message: string }>(`/faqs/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getFAQApprovalsApi = async (params: Record<string, unknown> = {}): Promise<any> => {
  try {
    const response = await axios.get('/faqs/approvals', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const approveFAQApi = async (id: string): Promise<any> => {
  try {
    const response = await axios.post(`/faqs/approvals/${id}/approve`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const rejectFAQApi = async (id: string, reason: string): Promise<any> => {
  try {
    const response = await axios.post(`/faqs/approvals/${id}/reject`, {
      rejected_reason: reason,
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

