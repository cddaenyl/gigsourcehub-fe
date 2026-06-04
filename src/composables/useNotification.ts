import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  getUnreadNotificationCountApi,
} from '@/services/notification.service'
import type { NotificationQueryParams } from '@/models/Notification'
import type { Ref } from 'vue'

export function useNotificationsQuery(params: Ref<NotificationQueryParams>) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotificationsApi(params.value),
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationAsReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsAsReadApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: () => getUnreadNotificationCountApi(),
    refetchInterval: 60000, // Optional: Poll every 1 minute
  })
}
