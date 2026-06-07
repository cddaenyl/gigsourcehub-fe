import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import type { MessageResp, WebSocketMessage } from '@/models/Chat'

export interface NotificationResp {
  id: string
  title: string
  description: string | null
  is_read: boolean
  created_at: string
}

const ws = ref<WebSocket | null>(null)
const isConnected = ref(false)
const incomingMessage = ref<MessageResp | null>(null)
const readReceipt = ref<{ conversation_id: string, reader_user_id: string } | null>(null)
const incomingNotification = ref<NotificationResp | null>(null)
const typingStatus = ref<Record<string, boolean>>({})
const typingTimers: Record<string, number> = {}

let reconnectTimer: number | null = null

export const useChatWebSocket = () => {
  const connect = () => {
    const authStore = useAuthStore()
    if (!authStore.token) return
    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) {
      return
    }

    // Determine WS URL based on API base URL
    const apiBase = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8080/api'
    // Convert http:// to ws:// or https:// to wss://
    let wsBase = apiBase.replace('http://', 'ws://').replace('https://', 'wss://')

    const wsUrl = `${wsBase}/ws/chat?token=${authStore.token}`
    
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      isConnected.value = true
      console.log('Chat WebSocket connected')
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    ws.value.onmessage = (event) => {
      try {
        const payload: WebSocketMessage = JSON.parse(event.data)
        if (payload.event === 'new_message') {
          incomingMessage.value = payload.data as MessageResp
          // clear typing if a message arrived
          if (payload.data.conversation_id) {
            typingStatus.value[payload.data.conversation_id] = false
          }
        } else if (payload.event === 'message_read') {
          readReceipt.value = payload.data as { conversation_id: string, reader_user_id: string }
        } else if (payload.event === 'new_notification') {
          incomingNotification.value = payload.data as NotificationResp
        } else if (payload.event === 'typing') {
          const typingData = payload.data as { conversation_id: string, sender_user_id: string }
          if (typingData.conversation_id) {
            typingStatus.value[typingData.conversation_id] = true
            
            if (typingTimers[typingData.conversation_id]) {
              window.clearTimeout(typingTimers[typingData.conversation_id])
            }
            typingTimers[typingData.conversation_id] = window.setTimeout(() => {
              typingStatus.value[typingData.conversation_id] = false
            }, 3000)
          }
        }
      } catch (e) {
        console.error('Error parsing WS message', e)
      }
    }

    ws.value.onclose = () => {
      isConnected.value = false
      console.log('Chat WebSocket disconnected, attempting reconnect...')
      const authStore = useAuthStore()
      if (authStore.token) {
        reconnectTimer = window.setTimeout(() => {
          connect()
        }, 5000) // Reconnect after 5s
      }
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
      ws.value?.close()
    }
  }

  const disconnect = () => {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    for (const key in typingTimers) {
      window.clearTimeout(typingTimers[key])
    }
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isConnected.value = false
  }

  // Auto connect when composable is used and user is logged in
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && (!ws.value || ws.value.readyState === WebSocket.CLOSED)) {
    connect()
  }

  // Listen to logout to disconnect WebSocket
  authStore.$subscribe((_, state) => {
    if (!state.token) {
      disconnect()
    }
  })

  return {
    isConnected,
    incomingMessage,
    incomingNotification,
    readReceipt,
    typingStatus,
    sendTyping: (conversationId: string, targetUserId: string) => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({
          event: 'typing',
          data: {
            conversation_id: conversationId,
            target_user_id: targetUserId
          }
        }))
      }
    },
    reconnect: connect,
    disconnect
  }
}
