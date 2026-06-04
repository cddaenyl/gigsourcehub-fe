export interface NotificationItem {
  id: string
  user_id: string
  title: string
  description: string
  is_read: boolean
  created_at: string
}

export interface NotificationListData {
  list: NotificationItem[]
  limit: number
  page: number
  total: number
}

export interface NotificationQueryParams {
  page?: number
  limit?: number
}

export interface GetNotificationsResponse {
  status: number
  message: string
  validation: string | null
  data: NotificationListData
}

export interface NotificationActionResponse {
  status: number
  message: string
  validation: string | null
  data: NotificationItem | null
}

export interface UnreadCountResponse {
  status: number
  message: string
  validation: string | null
  data: {
    unread_count: number
  }
}
