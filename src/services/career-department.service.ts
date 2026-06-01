import axios, { AxiosError } from 'axios'
import type {
  CareerDepartmentListResponse,
  CareerDepartmentSingleResponse,
  CreateCareerDepartmentPayload,
  UpdateCareerDepartmentPayload,
} from '@/models/CareerDepartment'

export const getCareerDepartmentsApi = async (
  params: Record<string, unknown> = {},
): Promise<CareerDepartmentListResponse> => {
  try {
    const response = await axios.get<CareerDepartmentListResponse>('/career-departments', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getCareerDepartmentByIdApi = async (
  id: string,
): Promise<CareerDepartmentSingleResponse> => {
  try {
    const response = await axios.get<CareerDepartmentSingleResponse>(`/career-departments/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createCareerDepartmentApi = async (
  data: CreateCareerDepartmentPayload,
): Promise<CareerDepartmentSingleResponse> => {
  try {
    const response = await axios.post<CareerDepartmentSingleResponse>('/career-departments', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateCareerDepartmentApi = async (
  id: string,
  data: UpdateCareerDepartmentPayload,
): Promise<CareerDepartmentSingleResponse> => {
  try {
    const response = await axios.put<CareerDepartmentSingleResponse>(
      `/career-departments/${id}`,
      data,
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteCareerDepartmentApi = async (
  id: string,
): Promise<{ status: number; message: string }> => {
  try {
    const response = await axios.delete<{ status: number; message: string }>(
      `/career-departments/${id}`,
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const uploadCareerDepartmentImageApi = async (
  id: string,
  file: File,
): Promise<{ status: number; message: string; data: { image_url: string } }> => {
  try {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axios.post<{
      status: number
      message: string
      data: { image_url: string }
    }>(`/career-departments/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getCareerDepartmentApprovalsApi = async (
  params: Record<string, unknown> = {},
): Promise<unknown> => {
  try {
    const response = await axios.get('/career-departments/approvals', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const approveCareerDepartmentApi = async (id: string): Promise<unknown> => {
  try {
    const response = await axios.post(`/career-departments/approvals/${id}/approve`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const rejectCareerDepartmentApi = async (
  id: string,
  reason: string,
): Promise<unknown> => {
  try {
    const response = await axios.post(`/career-departments/approvals/${id}/reject`, {
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

export const getPublicCareerDepartmentsApi = async (
  params: Record<string, unknown> = {},
): Promise<CareerDepartmentListResponse> => {
  try {
    const response = await axios.get<CareerDepartmentListResponse>('/public/career-departments', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const takedownCareerDepartmentApi = async (id: string): Promise<unknown> => {
  try {
    const response = await axios.post(`/career-departments/approvals/${id}/takedown`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}


