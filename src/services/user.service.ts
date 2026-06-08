import axios, { AxiosError } from 'axios'
import type {
  ActiveSubrequestResponse,
  UsersResponse,
  UsersQueryParams,
  UserResponse,
  UserRecruitmentStatusPayload,
  FinalizeRecruitmentPayload,
  CandidateDirectoryUser,
  PaginatedListResponse,
} from '@/models/User'

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

export const getAllUsersApi = async (params: UsersQueryParams = {}): Promise<UsersResponse> => {
  try {
    const response = await axios.get<UsersResponse>('/users', { params })
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

export const getActiveSubrequestApi = async (id: string): Promise<ActiveSubrequestResponse> => {
  try {
    const response = await axios.get<ActiveSubrequestResponse>(`/users/${id}/active-subrequest`)
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
    const response = await axios.get<UsersResponse>('/users/candidate-bookmarked', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getCandidateRecruitmentApi = async (
  params: UsersQueryParams = {},
): Promise<PaginatedListResponse<CandidateDirectoryUser>> => {
  try {
    const response = await axios.get<PaginatedListResponse<CandidateDirectoryUser>>(
      '/users/candidate-recruitment',
      { params },
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getCandidateBookmarkedApi = async (
  params: UsersQueryParams = {},
): Promise<PaginatedListResponse<CandidateDirectoryUser>> => {
  try {
    const response = await axios.get<PaginatedListResponse<CandidateDirectoryUser>>(
      '/users/candidate-bookmarked',
      { params },
    )
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

export const getProfileApi = async (): Promise<UserResponse> => {
  try {
    const response = await axios.get<UserResponse>('/profile')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const uploadProfilePictureApi = async (file: File): Promise<void> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    await axios.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getUserProfilePictureApi = async (
  id: string,
): Promise<{ profile_picture_url: string | null }> => {
  try {
    const response = await axios.get<{ data: { profile_picture_url: string | null } }>(
      `/users/${id}/profile-picture`,
    )
    return response.data.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateProfileApi = async (data: any): Promise<void> => {
  try {
    await axios.put('/profile', data)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const changePasswordApi = async (data: any): Promise<void> => {
  try {
    await axios.put('/profile/change-password', data)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const blockUserApi = async (id: string): Promise<void> => {
  try {
    await axios.patch(`/users/${id}/block`)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const disableUserApi = async (id: string): Promise<void> => {
  try {
    await axios.patch(`/users/${id}/disable`)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const activateUserApi = async (id: string): Promise<void> => {
  try {
    await axios.patch(`/users/${id}/activate`)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createUserApi = async (data: any): Promise<void> => {
  try {
    await axios.post('/users', data)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateUserBySuperadminApi = async (id: string, data: any): Promise<void> => {
  try {
    await axios.put(`/users/${id}`, data)
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const updateUserRecruitmentStatusApi = async (
  id: string,
  payload: UserRecruitmentStatusPayload,
): Promise<UserResponse> => {
  try {
    const response = await axios.patch<UserResponse>(`/users/${id}/recruitment-status`, payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const cancelRecruitmentApi = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axios.patch<UserResponse>(`/users/${id}/cancel-recruitment`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const confirmDeclineConfirmationApi = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axios.patch<UserResponse>(`/users/${id}/decline-confirmation`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const stopOnboardingApi = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axios.patch<UserResponse>(`/users/${id}/stop-onboarding`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const finalizeRecruitmentApi = async (
  payload: FinalizeRecruitmentPayload,
): Promise<UserResponse> => {
  try {
    const response = await axios.post<UserResponse>('/users/finalize-recruitment', payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const declineRecruitmentApi = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axios.patch<UserResponse>(`/users/${id}/decline`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const deleteAccountApi = async (data: { password: string }): Promise<void> => {
  try {
    await axios.delete('/profile', { data })
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const exportCandidatesApi = async (params: UsersQueryParams = {}): Promise<Blob> => {
  try {
    const response = await axios.get('/users/candidates/export', { params, responseType: 'blob' })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const exportCandidateRecruitmentApi = async (
  params: UsersQueryParams = {},
): Promise<Blob> => {
  try {
    const response = await axios.get('/users/candidate-recruitment/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const exportCandidateBookmarkedApi = async (
  params: UsersQueryParams = {},
): Promise<Blob> => {
  try {
    const response = await axios.get('/users/candidate-bookmarked/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
