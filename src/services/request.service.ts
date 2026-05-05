import axios, { AxiosError } from 'axios'
import type {
  CreateRequestPayload,
  CreateRequestResponse,
  GetRequestsResponse,
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
