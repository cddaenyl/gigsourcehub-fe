import axios, { AxiosError } from 'axios'
import type {
  NotificationQueryParams,
  GetNotificationsResponse,
  NotificationActionResponse,
  UnreadCountResponse,
} from '@/models/Notification'

export const getNotificationsApi = async (
  params: NotificationQueryParams = {},
): Promise<GetNotificationsResponse> => {
  try {
    const response = await axios.get<GetNotificationsResponse>('/notifications', { params })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const markNotificationAsReadApi = async (
  id: string,
): Promise<NotificationActionResponse> => {
  try {
    const response = await axios.patch<NotificationActionResponse>(`/notifications/${id}/read`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const markAllNotificationsAsReadApi = async (): Promise<NotificationActionResponse> => {
  try {
    const response = await axios.patch<NotificationActionResponse>('/notifications/read-all')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getUnreadNotificationCountApi = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await axios.get<UnreadCountResponse>('/notifications/unread-count')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
