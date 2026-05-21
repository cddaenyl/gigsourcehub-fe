import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import type { Ref } from 'vue'
import {
  fetchMyConversationsApi,
  getConversationApi,
  fetchMessagesApi,
  sendMessageApi,
  markAsReadApi,
  createConversationApi,
  startChatApi,
} from '@/services/chat.service'
import type { CreateConversationRequest, SendMessageRequest } from '@/models/Chat'

export const useConversations = (page: Ref<number>, limit: Ref<number>) => {
  return useQuery({
    queryKey: ['conversations', page, limit],
    queryFn: () => fetchMyConversationsApi(page.value, limit.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useConversationDetail = (id: Ref<string | null>) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversationApi(id.value!),
    enabled: () => !!id.value,
  })
}

export const useMessages = (id: Ref<string | null>, page: Ref<number>, limit: Ref<number>) => {
  return useQuery({
    queryKey: computed(() => ['messages', id.value, page.value, limit.value]),
    queryFn: () => fetchMessagesApi(id.value!, page.value, limit.value),
    enabled: () => !!id.value,
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateConversationRequest) => createConversationApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SendMessageRequest }) =>
      sendMessageApi(id, payload),
    // onSuccess cache invalidation handled by component/websocket
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markAsReadApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', id] })
    },
  })
}

export const useStartChat = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { candidate_user_id: string; subrequest_id: string }) =>
      startChatApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
