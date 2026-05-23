import axios, { AxiosError } from 'axios'
import type {
  CompanyProfileResponse,
  UpdateCompanyProfilePayload,
} from '@/models/CompanyProfile'

export const getCompanyProfileApi = async (): Promise<CompanyProfileResponse> => {
  try {
    const response = await axios.get<CompanyProfileResponse>('/company-profile')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateCompanyProfileApi = async (
  data: UpdateCompanyProfilePayload,
): Promise<CompanyProfileResponse> => {
  try {
    const response = await axios.put<CompanyProfileResponse>('/company-profile', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const cancelCompanyProfileApprovalApi = async (id: string): Promise<{ status: number; message: string }> => {
  try {
    const response = await axios.delete<{ status: number; message: string }>(`/company-profile/approvals/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getCompanyProfileApprovalsApi = async (params: Record<string, unknown> = {}): Promise<any> => {
  try {
    const response = await axios.get('/company-profile/approvals', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const approveCompanyProfileApi = async (id: string): Promise<any> => {
  try {
    const response = await axios.post(`/company-profile/approvals/${id}/approve`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const rejectCompanyProfileApi = async (id: string, reason: string): Promise<any> => {
  try {
    const response = await axios.post(`/company-profile/approvals/${id}/reject`, {
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

