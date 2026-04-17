import { ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  fetchMyAIChatsApi,
  createAIChatApi,
  deleteAIChatApi,
  fetchAIChatMessagesApi,
  storeAIChatMessageApi
} from '@/services/ai-chat.service'
import type { ChatMessage, AISearchParsedContent } from '@/models/CandidateSearch'

export function useAIChatHistory() {
  const queryClient = useQueryClient()
  const currentChatId = ref<string | null>(null)

  // Query for all chats
  const { data: myChats, isLoading: isLoadingChats, refetch: refetchChats } = useQuery({
    queryKey: ['ai-chats'],
    queryFn: () => fetchMyAIChatsApi()
  })

  // Mutation to create a chat
  const createChatMutation = useMutation({
    mutationFn: (firstQuery?: string) => createAIChatApi(firstQuery),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['ai-chats'] })
      if (res.data && res.data.id) {
        currentChatId.value = res.data.id
      }
    }
  })

  // Mutation to delete a chat
  const deleteChatMutation = useMutation({
    mutationFn: (id: string) => deleteAIChatApi(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ai-chats'] })
      if (currentChatId.value === id) {
        currentChatId.value = null
      }
    }
  })

  // Mutation to store a message
  const storeMessageMutation = useMutation({
    mutationFn: ({ chatId, role, content, isLast }: { chatId: string, role: string, content: string, isLast?: boolean }) => 
      storeAIChatMessageApi(chatId, role, content, isLast),
  })

  const loadChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
    const res = await fetchAIChatMessagesApi(chatId)
    if (res.data) {
      return res.data.map((msg: any) => {
        let parsed: AISearchParsedContent | undefined = undefined
        try {
          parsed = JSON.parse(msg.content)
        } catch (e) {
          // Fallback if not JSON
          return {
            id: msg.id,
            role: msg.role === 'user' ? 'user' : 'ai',
            text: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
          }
        }

        return {
          id: msg.id,
          role: msg.role === 'user' ? 'user' : 'ai',
          text: parsed?.summary || '',
          parsedContent: parsed,
          displayParsedContent: true,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
        }
      })
    }
    return []
  }

  return {
    myChats,
    isLoadingChats,
    currentChatId,
    createChat: createChatMutation.mutateAsync,
    deleteChat: deleteChatMutation.mutateAsync,
    storeMessage: storeMessageMutation.mutateAsync,
    loadChatMessages,
    refetchChats
  }
}
