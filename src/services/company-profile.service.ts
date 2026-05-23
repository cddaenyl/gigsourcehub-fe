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
