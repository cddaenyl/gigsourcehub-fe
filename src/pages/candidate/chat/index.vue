<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '@/composables/useChat'
import { useChatWebSocket } from '@/composables/useChatWebSocket'
import { NInput, NSpin, NEmpty, NIcon } from 'naive-ui'
import {
  Send,
  FilePlus,
  Eye,
  ArrowBackUp,
  X,
  Clock,
  CalendarTime,
  Video,
  MapPin,
  ExternalLink,
  CalendarEvent,
} from '@vicons/tabler'
import type { ConversationResp, MessageResp } from '@/models/Chat'
import { useQueryClient } from '@tanstack/vue-query'

const authStore = useAuthStore()
const queryClient = useQueryClient()

// Local state
const page = ref(1)
const limit = ref(50)
const selectedConversationId = ref<string | null>(null)
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const replyingTo = ref<MessageResp | null>(null)

// Composables
const { data: conversationsData, isLoading: isLoadingConversations } = useConversations(page, limit)
const conversations = computed(() => conversationsData.value?.data.list || [])
const firstUnreadId = ref<string | null>(null)

// Select first conversation by default if none selected
watch(conversations, (list) => {
  if (list.length > 0 && !selectedConversationId.value) {
    selectedConversationId.value = list[0]?.id || null
  }
}, { immediate: true })

const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useMessages(selectedConversationId, ref(1), ref(100))
const sendMessageMutation = useSendMessage()
const markAsReadMutation = useMarkAsRead()
const { incomingMessage, readReceipt, typingStatus, sendTyping } = useChatWebSocket()

const messages = computed(() => {
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

const otherParticipantId = computed(() => {
  if (activeConversation.value?.admin_user_id) return activeConversation.value.admin_user_id
  const msgFromOther = messages.value.find(m => m.sender_user_id !== authStore.user?.id)
  return msgFromOther ? msgFromOther.sender_user_id : null
})

let typingTimeout: number | null = null
const handleTyping = () => {
  if (selectedConversationId.value && otherParticipantId.value) {
    if (!typingTimeout) {
      sendTyping(selectedConversationId.value, otherParticipantId.value)
    } else {
      window.clearTimeout(typingTimeout)
    }
    typingTimeout = window.setTimeout(() => {
      typingTimeout = null
    }, 1500)
  }
}

// Scroll to bottom helper
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(messages, (newMessages) => {
  if (!firstUnreadId.value && newMessages.length > 0) {
    const unread = newMessages.find(m => m.sender_user_id !== authStore.user?.id && !m.read_at)
    if (unread) {
      firstUnreadId.value = unread.id
    }
  }
  scrollToBottom()
}, { deep: true })

watch(selectedConversationId, (newId) => {
  if (newId) {
    firstUnreadId.value = null
    refetchMessages()
    // Mark as read if last message is from admin and unread
    const conv = conversations.value.find((c: ConversationResp) => c.id === newId)
    if (conv?.last_message && conv.last_message.sender_user_id !== authStore.user?.id && !conv.last_message.read_at) {
      markAsReadMutation.mutate(newId)
    }
  }
})



// WebSocket Watchers
watch(incomingMessage, (msg) => {
  if (!msg) return
  
  if (msg.conversation_id === selectedConversationId.value) {
    queryClient.setQueryData(['messages', msg.conversation_id, 1, 100], (oldData: any) => {
      if (!oldData) return oldData
      return { ...oldData, data: { ...oldData.data, list: [msg, ...oldData.data.list] } }
    })

    if (msg.sender_user_id !== authStore.user?.id) {
      markAsReadMutation.mutate(msg.conversation_id)
    }
  }

  queryClient.setQueryData(['conversations', page.value, limit.value], (oldData: any) => {
    if (!oldData) return oldData
    const newList = oldData.data.list.map((c: ConversationResp) => {
      if (c.id === msg.conversation_id) return { ...c, last_message: msg }
      return c
    })
    return { ...oldData, data: { ...oldData.data, list: newList } }
  })
})

watch(readReceipt, (receipt) => {
  if (!receipt) return
  if (receipt.conversation_id === selectedConversationId.value) {
     refetchMessages()
  }
})

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
}

const scrollToMessage = (id: string) => {
  const el = document.getElementById(`msg-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

const formatDateDivider = (isoString: string) => {
  const d = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const isChatAvailable = computed(() => {
  return !!activeConversation.value
})

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

const INTERVIEW_MESSAGE_PREFIX = '__interview_chat__:'

interface InterviewChatMessagePayload {
  interview_id: string
  title: string
  scheduled_at: string
  method: string
  meeting_link: string
  meeting_location: string
  stage_name?: string
}

const parseInterviewMessageContent = (content: string) => {
  if (!content.startsWith(INTERVIEW_MESSAGE_PREFIX)) {
    return null
  }

  try {
    const parsed = JSON.parse(
      content.slice(INTERVIEW_MESSAGE_PREFIX.length),
    ) as InterviewChatMessagePayload
    if (!parsed?.interview_id || !parsed?.title || !parsed?.scheduled_at) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const getMessagePreviewText = (content: string) => {
  const interviewMessage = parseInterviewMessageContent(content)
  return interviewMessage?.title || content
}

const formatInterviewDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatInterviewTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <CandidateLayout>
    <div class="h-[calc(100vh-95px)] flex flex-col relative">
      <template v-if="isLoadingConversations">
          <div class="flex-1 flex items-center justify-center min-h-[500px]">
            <n-spin size="large" />
          </div>
      </template>
      <template v-else-if="!activeConversation">
          <div class="flex-1 flex items-center justify-center min-h-[500px]">
            <n-empty description="You don't have any active chats with HR yet." />
          </div>
      </template>
      <div v-else class="flex flex-col h-full absolute inset-0">
        <!-- Chat Header -->
        <div class="p-6 border-b border-gray-100 flex items-center gap-4 bg-white shrink-0">
          <div>
              <h2 class="text-xl font-bold text-primary">{{ activeConversation.admin_user_name || 'Human Resource' }}</h2>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50/30" ref="messagesContainer">
          <div v-if="isLoadingMessages" class="flex justify-center p-8">
            <n-spin size="medium" />
          </div>
          <div v-else class="space-y-6">
            <template v-for="(msg, index) in messages" :key="msg.id">
              <!-- Date Divider -->
              <div v-if="index === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[index-1]?.created_at || '').toDateString()" class="flex items-center gap-4 my-8">
                <div class="flex-1 h-px bg-gray-200"></div>
                <span class="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm">{{ formatDateDivider(msg.created_at) }}</span>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>

              <!-- New Messages Separator -->
              <div v-if="msg.id === firstUnreadId" class="flex items-center gap-4 my-8">
                <div class="flex-1 h-px bg-gray-200"></div>
                <span class="text-xs font-bold text-primary/60 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm">New Messages</span>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>

              <div :id="'msg-' + msg.id" class="flex flex-col group"
                    :class="msg.sender_user_id === authStore.user?.id ? 'items-end' : 'items-start'">
              
              <div class="flex items-center gap-2 max-w-[75%]">
                <!-- Reply Button for Received Messages -->
                <div v-if="msg.sender_user_id !== authStore.user?.id" 
                      class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700 order-2 shrink-0"
                      @click="handleReply(msg)">
                  <n-icon size="16"><ArrowBackUp /></n-icon>
                </div>

                <div class="relative overflow-hidden"
                      :class="[
                        msg.sender_user_id === authStore.user?.id ? 'order-2' : 'order-1',
                        parseInterviewMessageContent(msg.content)
                          ? ''
                          : msg.sender_user_id === authStore.user?.id
                            ? 'rounded-md px-5 py-3 shadow-sm bg-gray-200 text-gray-900'
                            : 'rounded-md px-5 py-3 shadow-sm bg-gray-100 border border-gray-100 text-gray-800'
                      ]">
                  
                  <!-- Reply Context -->
                  <div v-if="msg.reply_to" 
                        class="mb-2 p-2 rounded bg-black/5 border-l-4 border-primary text-xs cursor-pointer hover:bg-black/10 transition-colors"
                        @click="scrollToMessage(msg.reply_to.id)">
                    <div class="font-bold opacity-70 mb-0.5">{{ msg.reply_to.sender_name }}</div>
                    <div class="line-clamp-2 opacity-60">
                      <template v-if="parseInterviewMessageContent(msg.reply_to.content)">
                        <span class="inline-flex items-center gap-1 text-blue-600 font-medium">
                          <n-icon size="12"><CalendarEvent /></n-icon>
                          {{ getMessagePreviewText(msg.reply_to.content) }}
                        </span>
                      </template>
                      <template v-else>
                        {{ msg.reply_to.content }}
                      </template>
                    </div>
                  </div>

                  <!-- Interview Message Content -->
                  <template v-if="parseInterviewMessageContent(msg.content)">
                    <div
                      class="w-85 max-w-full rounded-2xl border border-blue-100 bg-white p-4 pb-6 shadow-xs"
                    >
                      <div class="space-y-3">
                        <div>
                          <h4 class="text-[15px] font-semibold text-slate-800">
                            {{ parseInterviewMessageContent(msg.content)?.title }}
                          </h4>
                        </div>

                        <div class="space-y-2 text-sm text-slate-600">
                          <div class="flex items-center gap-2">
                            <n-icon size="16" class="text-slate-400"><Clock /></n-icon>
                            <span
                              >{{
                                formatInterviewTime(
                                  parseInterviewMessageContent(msg.content)?.scheduled_at || '',
                                )
                              }}
                              WIB</span
                            >
                          </div>
                          <div class="flex items-center gap-2">
                            <n-icon size="16" class="text-slate-400"><CalendarTime /></n-icon>
                            <span>{{
                              formatInterviewDate(
                                parseInterviewMessageContent(msg.content)?.scheduled_at || '',
                              )
                            }}</span>
                          </div>

                          <div class="flex items-start gap-2">
                            <template
                              v-if="
                                parseInterviewMessageContent(msg.content)?.method === 'Online'
                              "
                            >
                              <n-icon size="16" class="mt-0.5 text-slate-400"><Video /></n-icon>
                              <a
                                :href="
                                  parseInterviewMessageContent(msg.content)?.meeting_link || '#'
                                "
                                target="_blank"
                                rel="noopener noreferrer"
                                class="wrap-break-word text-blue-600 underline flex items-center"
                              >
                                Online Meeting<span class="ml-1">
                                  <n-icon size="16" class="text-blue-500"
                                    ><ExternalLink
                                  /></n-icon>
                                </span>
                              </a>
                            </template>
                            <template v-else>
                              <n-icon size="16" class="mt-0.5 text-slate-400"
                                ><MapPin
                              /></n-icon>
                              <span class="wrap-break-word">{{
                                parseInterviewMessageContent(msg.content)?.meeting_location ||
                                '-'
                              }}</span>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <div v-else class="flex flex-col">
                    <p class="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed pb-3" v-html="formatMessage(msg.content)"></p>
                  </div>
                  
                  <!-- Inline Timestamp -->
                  <div class="absolute bottom-1 right-2 flex items-center gap-1">
                    <span class="text-[10px] opacity-50 font-medium">{{ formatTime(msg.created_at) }}</span>
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
                <div v-if="msg.sender_user_id === authStore.user?.id && msg.id === lastReadMsgId" class="mt-1 px-1">
                  <n-icon size="14" class="text-blue-500" title="Read"><Eye /></n-icon>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Typing Indicator & Input Area -->
        <div class="shrink-0 bg-white border-t border-gray-100">
          <!-- Reply Preview Bar -->
          <div v-if="replyingTo" class="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-3 animate-in slide-in-from-bottom-2">
            <div class="w-1 h-8 bg-primary rounded-full"></div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-primary">Replying to {{ replyingTo.sender_name }}</div>
              <div class="text-xs text-gray-500 truncate">
                <template v-if="parseInterviewMessageContent(replyingTo.content)">
                  <span class="inline-flex items-center gap-1 text-blue-600 font-medium">
                    <n-icon size="12"><CalendarEvent /></n-icon>
                    {{ getMessagePreviewText(replyingTo.content) }}
                  </span>
                </template>
                <template v-else>
                  {{ replyingTo.content }}
                </template>
              </div>
            </div>
            <div class="p-1 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400" @click="replyingTo = null">
              <n-icon size="16"><X /></n-icon>
            </div>
          </div>

          <div class="px-6 py-1 h-6 bg-gray-50/50 flex items-center gap-2">
            <template v-if="selectedConversationId && typingStatus[selectedConversationId]">
              <div class="flex gap-1 items-center">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <span class="text-[11px] text-gray-400 font-medium italic">Typing...</span>
            </template>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors shrink-0" :class="{ 'opacity-50 pointer-events-none': !isChatAvailable }">
                <n-icon size="24"><FilePlus /></n-icon>
              </div>
              <n-input 
                v-model:value="messageInput" 
                type="textarea" 
                :autosize="{ minRows: 1, maxRows: 5 }"
                :placeholder="'Type here...'" 
                :disabled="!isChatAvailable"
                size="large"
                class="flex-1 bg-gray-50 text-base !rounded-xl"
                @input="handleTyping"
                @keydown.enter="handleEnter"
              />
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
              :class="messageInput.trim() && isChatAvailable ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 pointer-events-none'"
              @click="sendMessage"
            >
              <n-icon size="20"><Send /></n-icon>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CandidateLayout>
</template>


<style scoped>
/* Scoped overrides to allow full height filling inside the card */
:deep(.n-card > .n-card__content) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

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
