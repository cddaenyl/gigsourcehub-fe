import axios, { AxiosError } from 'axios'
import type { RolesQueryParams, RolesResponse } from '@/models/Role'
import type { SystemRolesResponse as SystemRoleRes } from '@/models/SystemRole'

export const getRolesApi = async (params: RolesQueryParams = {}): Promise<RolesResponse> => {
  try {
    const response = await axios.get<RolesResponse>('/roles', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getSystemRolesApi = async (): Promise<SystemRoleRes> => {
  try {
    const response = await axios.get<SystemRoleRes>('/roles/system')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
