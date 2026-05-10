import axios, { AxiosError } from 'axios'
import type {
  CreateRequestPayload,
  CreateRequestResponse,
  GetRequestResponse,
  GetRequestsResponse,
  RequestActionResponse,
  RequestDecisionPayload,
  RequestQueryParams,
} from '@/models/Request'

export const getRequestsApi = async (
  params: RequestQueryParams = {},
): Promise<GetRequestsResponse> => {
  try {
    const response = await axios.get<GetRequestsResponse>('/requests', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getAdminRequestsApi = async (
  params: RequestQueryParams = {},
): Promise<GetRequestsResponse> => {
  try {
    const response = await axios.get<GetRequestsResponse>('/admin/requests', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getRequestDetail = async (id: string): Promise<GetRequestResponse> => {
  try {
    const response = await axios.get<GetRequestResponse>(`requests/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const rejectAdminRequestApi = async (
  id: string,
  payload: RequestDecisionPayload,
): Promise<RequestActionResponse> => {
  try {
    const response = await axios.patch<RequestActionResponse>(
      `/admin/requests/${id}/reject`,
      payload,
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const validateAdminRequestApi = async (id: string): Promise<RequestActionResponse> => {
  try {
    const response = await axios.patch<RequestActionResponse>(`/admin/requests/${id}/validate`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createRequestApi = async (
  payload: CreateRequestPayload,
): Promise<CreateRequestResponse> => {
  try {
    const response = await axios.post<CreateRequestResponse>('/requests', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
