import axios, { AxiosError } from 'axios'
import type { OnboardingListResponse, OnboardingQueryParams } from '@/models/Onboarding'

export const getOnboardingHistoryByCandidateApi = async (
  id: string,
  params: OnboardingQueryParams = {},
): Promise<OnboardingListResponse> => {
  try {
    const response = await axios.get<OnboardingListResponse>(`/onboarding/${id}`, { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getActiveTeamOnboardingApi = async (
  params: OnboardingQueryParams = {},
): Promise<OnboardingListResponse> => {
  try {
    const response = await axios.get<OnboardingListResponse>('/onboarding/active-team', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getActiveOnboardingApi = async (
  params: OnboardingQueryParams = {},
): Promise<OnboardingListResponse> => {
  try {
    const response = await axios.get<OnboardingListResponse>('/onboarding/active', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getArchiveOnboardingApi = async (
  params: OnboardingQueryParams = {},
): Promise<OnboardingListResponse> => {
  try {
    const response = await axios.get<OnboardingListResponse>('/onboarding/archive', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getOnboardingHistoryApi = async (
  params: OnboardingQueryParams = {},
): Promise<OnboardingListResponse> => {
  try {
    const response = await axios.get<OnboardingListResponse>('/onboarding/history', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
