<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '@/composables/useChat'
import { useChatWebSocket } from '@/composables/useChatWebSocket'
import { NInput, NAvatar, NBadge, NSpin, NEmpty, NIcon, NTag, useMessage } from 'naive-ui'
import { Search, Send, FilePlus, Copy, User, Eye, Message, ArrowBackUp, X } from '@vicons/tabler'
import type { ConversationResp, MessageResp } from '@/models/Chat'
import { useQueryClient } from '@tanstack/vue-query'

const authStore = useAuthStore()
const queryClient = useQueryClient()
const router = useRouter()
const naiveMessage = useMessage()

// Local state
const page = ref(1)
const limit = ref(50)
const selectedConversationId = ref<string | null>(null)
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const activeTab = ref('All')
const replyingTo = ref<MessageResp | null>(null)

// Composables
const { data: conversationsData, isLoading: isLoadingConversations } = useConversations(page, limit)
const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useMessages(selectedConversationId, ref(1), ref(100))
const sendMessageMutation = useSendMessage()
const markAsReadMutation = useMarkAsRead()
const { incomingMessage, readReceipt, typingStatus, sendTyping } = useChatWebSocket()

// Computed data
const conversations = computed(() => conversationsData.value?.data.list || [])
const messages = computed(() => {
  // Sort messages oldest first for display
  return [...(messagesData.value?.data.list || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

const lastReadMsgId = computed(() => {
  const userMessages = messages.value.filter((m: any) => m.sender_user_id === authStore.user?.id && m.read_at)
  if (userMessages.length > 0) {
    return userMessages[userMessages.length - 1]?.id
  }
  return null
})

const activeConversation = computed(() => {
  return conversations.value.find((c: ConversationResp) => c.id === selectedConversationId.value) || null
})

const filteredConversations = computed(() => {
  let list = conversations.value
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c: ConversationResp) => c.candidate_user_name?.toLowerCase().includes(q))
  }

  if (activeTab.value === 'Unread') {
    list = list.filter((c: ConversationResp) => {
      // Check if last message is from candidate and unread
      const lm = c.last_message
      return lm && lm.sender_user_id !== authStore.user?.id && !lm.read_at
    })
  }

  return list
})

const getThumbUrl = (url: string | null | undefined) => {
  if (!url) return undefined
  const parts = url.split('.')
  if (parts.length > 1) {
    const ext = parts.pop()
    return `${parts.join('.')}_thumb.${ext}`
  }
  return `${url}_thumb`
}

// Scroll to bottom helper
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watchers
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

watch(selectedConversationId, (newId) => {
  if (newId) {
    refetchMessages()
    // Check if we need to mark as read
    const conv = conversations.value.find((c: ConversationResp) => c.id === newId)
    if (conv?.last_message && conv.last_message.sender_user_id !== authStore.user?.id && !conv.last_message.read_at) {
      markAsReadMutation.mutate(newId)
    }
  }
})

// WebSocket Watchers
watch(incomingMessage, (msg) => {
  if (!msg) return
  
  // Update messages if it belongs to active conversation
  if (msg.conversation_id === selectedConversationId.value) {
    // Optimistic update of messages cache
    queryClient.setQueryData(['messages', msg.conversation_id, 1, 100], (oldData: any) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        data: {
          ...oldData.data,
          list: [msg, ...oldData.data.list]
        }
      }
    })

    // Auto mark as read if it's open
    if (msg.sender_user_id !== authStore.user?.id) {
      markAsReadMutation.mutate(msg.conversation_id)
    }
  }

  // Update conversation list's last message
  queryClient.setQueryData(['conversations', page.value, limit.value], (oldData: any) => {
    if (!oldData) return oldData
    const newList = oldData.data.list.map((c: ConversationResp) => {
      if (c.id === msg.conversation_id) {
        return { ...c, last_message: msg }
      }
      return c
    })
    return { ...oldData, data: { ...oldData.data, list: newList } }
  })
})

watch(readReceipt, (receipt) => {
  if (!receipt) return
  if (receipt.conversation_id === selectedConversationId.value) {
     // Trigger refetch to update read status indicators
     refetchMessages()
  }
})

// Methods
let typingTimeout: number | null = null
const handleTyping = () => {
  if (selectedConversationId.value && activeConversation.value?.candidate_user_id) {
    if (!typingTimeout) {
      sendTyping(selectedConversationId.value, activeConversation.value.candidate_user_id)
    } else {
      window.clearTimeout(typingTimeout)
    }
    typingTimeout = window.setTimeout(() => {
      typingTimeout = null
    }, 1500)
  }
}

const selectConversation = (id: string) => {
  selectedConversationId.value = id
}

const copyName = async () => {
  if (activeConversation.value?.candidate_user_name) {
    try {
      await navigator.clipboard.writeText(activeConversation.value.candidate_user_name)
      naiveMessage.success('Candidate name copied to clipboard')
    } catch (e) {
      naiveMessage.error('Failed to copy name')
    }
  }
}

const goToProfile = () => {
  if (activeConversation.value?.candidate_user_id) {
    // Navigate to candidate detail profile, using standard route structure if available
    router.push(`/admin/daftar-kandidat/${activeConversation.value.candidate_user_id}`)
  }
}

const sendMessage = () => {
  if (!messageInput.value.trim() || !selectedConversationId.value) return
  
  const content = messageInput.value
  const replyToId = replyingTo.value?.id
  
  messageInput.value = ''
  replyingTo.value = null
  
  sendMessageMutation.mutate(
    { id: selectedConversationId.value, payload: { content, reply_to_message_id: replyToId } },
    {
      onSuccess: (res) => {
        // Optimistically add to list
        queryClient.setQueryData(['messages', selectedConversationId.value, 1, 100], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: {
              ...oldData.data,
              list: [res.data, ...oldData.data.list]
            }
          }
        })
        
        // Update conversation list
        queryClient.setQueryData(['conversations', page.value, limit.value], (oldData: any) => {
          if (!oldData) return oldData
          const newList = oldData.data.list.map((c: ConversationResp) => {
            if (c.id === selectedConversationId.value) {
              return { ...c, last_message: res.data }
            }
            return c
          })
          return { ...oldData, data: { ...oldData.data, list: newList } }
        })
      }
    }
  )
}

const handleReply = (msg: MessageResp) => {
  replyingTo.value = msg
  nextTick(() => {
    // Focus the input if possible, though n-input might need a ref
  })
}

const scrollToMessage = (id: string) => {
  const el = document.getElementById(`msg-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Brief highlight effect
    const bubble = el.querySelector('.rounded-2xl')
    if (bubble) {
      bubble.classList.add('ring-4', 'ring-primary/30')
      setTimeout(() => {
        bubble.classList.remove('ring-4', 'ring-primary/30')
      }, 2000)
    }
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const formatTime = (isoString: string) => {
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatMessage = (content: string) => {
  if (!content) return ''
  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
  let escaped = escapeHtml(content)
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all">${url}</a>`
  })
}

const isUnread = (c: ConversationResp) => {
  return c.last_message && c.last_message.sender_user_id !== authStore.user?.id && !c.last_message.read_at
}
</script>

<template>
  <AdminLayout no-padding>
    <div class="flex flex-1 bg-white shadow-sm overflow-hidden">
      
      <!-- LEFT PANEL: Conversation List -->
      <div class="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <!-- Header & Search -->
        <div class="p-4 bg-primary text-white space-y-4">
          <div class="flex items-center gap-2">
            <n-icon size="24"><Message /></n-icon>
            <h2 class="text-xl font-semibold">Chats</h2>
          </div>
          <n-input v-model:value="searchQuery" placeholder="Cari Kandidat..." round class="bg-white/10 text-white">
            <template #prefix>
              <n-icon :component="Search" class="text-white/60" />
            </template>
          </n-input>
          
          <div class="flex gap-2">
            <n-tag :color="{ color: activeTab === 'All' ? 'white' : 'transparent', textColor: activeTab === 'All' ? '#0A1A5C' : 'white' }" 
                   round class="cursor-pointer font-medium" :bordered="false" @click="activeTab = 'All'">All</n-tag>
            <n-tag :color="{ color: activeTab === 'Unread' ? 'white' : 'transparent', textColor: activeTab === 'Unread' ? '#0A1A5C' : 'white' }" 
                   round class="cursor-pointer font-medium" :bordered="false" @click="activeTab = 'Unread'">Unread</n-tag>
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="isLoadingConversations" class="flex justify-center p-8">
            <n-spin size="medium" />
          </div>
          <div v-else-if="filteredConversations.length === 0" class="p-8 text-center text-gray-500">
            No conversations found.
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div 
              v-for="conv in filteredConversations" 
              :key="conv.id"
              class="p-4 hover:bg-gray-100 cursor-pointer transition-colors"
              :class="{'bg-blue-50/50': selectedConversationId === conv.id}"
              @click="selectConversation(conv.id)"
            >
              <div class="flex items-start gap-3">
                <n-avatar round :size="48" :src="getThumbUrl(conv.candidate_user_profile_picture) || undefined">
                  <template #fallback><n-icon><User /></n-icon></template>
                </n-avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                    <h4 class="font-semibold text-gray-900 truncate pr-2">{{ conv.candidate_user_name || 'Unknown Candidate' }}</h4>
                    <span class="text-xs text-gray-500 shrink-0" v-if="conv.last_message">{{ formatTime(conv.last_message.created_at) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-600 truncate pr-2" :class="{'font-semibold text-gray-900': isUnread(conv)}">
                      <span v-if="typingStatus[conv.id]" class="text-blue-500 italic">typing...</span>
                      <template v-else>
                        {{ conv.last_message?.content || 'No messages yet' }}
                      </template>
                    </p>
                    <n-badge v-if="isUnread(conv)" dot type="error" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Active Chat -->
      <div class="w-2/3 flex flex-col bg-white">
        <template v-if="activeConversation">
          <!-- Chat Header -->
          <div class="h-16 border-b border-gray-200 px-6 flex justify-between items-center bg-white shrink-0">
            <div class="flex items-center gap-4">
              <n-avatar round :size="40" :src="getThumbUrl(activeConversation.candidate_user_profile_picture) || undefined">
                <template #fallback><n-icon><User /></n-icon></template>
              </n-avatar>
              <div>
                <h3 class="font-semibold text-gray-900">{{ activeConversation.candidate_user_name }}</h3>
              </div>
            </div>
            <div class="flex items-center gap-4 text-gray-400">
              <n-icon size="20" class="hover:text-primary cursor-pointer" @click="copyName" title="Copy Name"><Copy /></n-icon>
              <n-icon size="20" class="hover:text-primary cursor-pointer" @click="goToProfile" title="View Profile"><User /></n-icon>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="flex-1 overflow-y-auto p-6 bg-gray-50" ref="messagesContainer">
            <div v-if="isLoadingMessages" class="flex justify-center p-8">
              <n-spin size="medium" />
            </div>
            <div v-else class="space-y-6">
              <div v-for="msg in messages" :key="msg.id" :id="'msg-' + msg.id" class="flex flex-col group" 
                   :class="msg.sender_user_id === authStore.user?.id ? 'items-end' : 'items-start'">
                
                <div class="flex items-center gap-2 max-w-[75%]">
                  <!-- Reply Button for Received Messages -->
                  <div v-if="msg.sender_user_id !== authStore.user?.id" 
                       class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700 order-2 shrink-0"
                       @click="handleReply(msg)">
                    <n-icon size="16"><ArrowBackUp /></n-icon>
                  </div>

                  <div class="rounded-md px-4 py-2.5 shadow-sm relative overflow-hidden"
                       :class="msg.sender_user_id === authStore.user?.id ? 'bg-gray-200 text-gray-900 order-2' : 'bg-gray-100 text-gray-800 border border-gray-100 order-1'">
                    
                    <!-- Reply Context -->
                    <div v-if="msg.reply_to" 
                         class="mb-2 p-2 rounded bg-black/5 border-l-4 border-primary text-xs cursor-pointer hover:bg-black/10 transition-colors"
                         @click="scrollToMessage(msg.reply_to.id)">
                      <div class="font-bold opacity-70 mb-0.5">{{ msg.reply_to.sender_name }}</div>
                      <div class="line-clamp-2 opacity-60">{{ msg.reply_to.content }}</div>
                    </div>

                    <div class="flex flex-col">
                      <p class="text-[15px] whitespace-pre-wrap leading-relaxed pb-3" v-html="formatMessage(msg.content)"></p>
                      
                      <!-- Inline Timestamp -->
                      <div class="absolute bottom-1 right-2 flex items-center gap-1">
                        <span class="text-[10px] opacity-50 font-medium">{{ formatTime(msg.created_at) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Reply Button for Sent Messages (on the left of bubble) -->
                  <div v-if="msg.sender_user_id === authStore.user?.id" 
                       class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700 order-1 shrink-0"
                       @click="handleReply(msg)">
                    <n-icon size="16"><ArrowBackUp /></n-icon>
                  </div>
                </div>
                
                <!-- Read Status Icon (External) -->
                <div v-if="msg.sender_user_id === authStore.user?.id && msg.id === lastReadMsgId" class="mt-0.5 px-1">
                  <n-icon size="14" class="text-blue-500" title="Read"><Eye /></n-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator & Input Area -->
          <div class="shrink-0 bg-white border-t border-gray-200">
            <!-- Reply Preview Bar -->
            <div v-if="replyingTo" class="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <div class="w-1 h-8 bg-primary rounded-full"></div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-primary">Replying to {{ replyingTo.sender_name }}</div>
                <div class="text-xs text-gray-500 truncate">{{ replyingTo.content }}</div>
              </div>
              <div class="p-1 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400" @click="replyingTo = null">
                <n-icon size="16"><X /></n-icon>
              </div>
            </div>

            <div class="px-6 py-1 h-6 bg-gray-50 flex items-center gap-2">
              <template v-if="selectedConversationId && typingStatus[selectedConversationId]">
                <div class="flex gap-1 items-center">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
                <span class="text-[11px] text-gray-400 font-medium italic">Typing...</span>
              </template>
            </div>
            <div class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors shrink-0">
                  <n-icon size="20"><FilePlus /></n-icon>
                </div>
                <n-input 
                  v-model:value="messageInput" 
                  type="textarea" 
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  placeholder="Type here..." 
                  size="large"
                  class="flex-1 bg-gray-50 !rounded-xl"
                  @input="handleTyping"
                  @keydown.enter="handleEnter"
                />
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0"
                :class="messageInput.trim() ? 'bg-[#0A1A5C] text-white hover:bg-blue-800' : 'bg-gray-200 text-gray-400 pointer-events-none'"
                @click="sendMessage"
              >
                <n-icon size="18"><Send /></n-icon>
              </div>
            </div>
          </div>
          </div>
        </template>
        
        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
          <n-empty description="Select a conversation to start chatting">
            <template #icon>
              <n-icon><Message /></n-icon>
            </template>
          </n-empty>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<style scoped>
.typing-dot {
  width: 4px;
  height: 4px;
  background-color: #9CA3AF;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 80%, 100% { 
    transform: translateY(0);
    opacity: 0.4;
  }
  40% { 
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
