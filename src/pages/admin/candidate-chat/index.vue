<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '@/composables/useChat'
import { useChatWebSocket } from '@/composables/useChatWebSocket'
import {
  NInput,
  NAvatar,
  NBadge,
  NSpin,
  NEmpty,
  NIcon,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NDatePicker,
  NButton,
  useMessage,
  type FormInst,
  type FormRules,
  type SelectOption,
} from 'naive-ui'
import {
  Search,
  Send,
  Plus,
  Copy,
  User,
  Eye,
  Message,
  ArrowBackUp,
  X,
  Clock,
  DeviceLaptop,
  MapPin,
  Video,
  CalendarTime,
  ExternalLink,
  Home,
  CalendarEvent,
  FileText,
} from '@vicons/tabler'
import type { ConversationResp, MessageResp } from '@/models/Chat'
import { useQueryClient } from '@tanstack/vue-query'
import { useInterviewStages } from '@/composables/useInterviewStages'
import { useCreateInterview, useInterviewById } from '@/composables/useInterviews'
import type { CreateInterviewPayload } from '@/models/InterviewSchedule'

type MessageQueryCache = {
  data?: {
    list?: MessageResp[]
  }
}

type ConversationQueryCache = {
  data?: {
    list?: ConversationResp[]
  }
}

type PendingMessage = MessageResp & {
  _pending: true
  file_url: null
}

interface InterviewChatMessagePayload {
  interview_id: string
  title: string
  scheduled_at: string
  method: string
  meeting_link: string
  meeting_location: string
  stage_name?: string
}

const INTERVIEW_MESSAGE_PREFIX = '__interview_chat__:'

const authStore = useAuthStore()
const queryClient = useQueryClient()
const router = useRouter()
const route = useRoute()
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
const firstUnreadId = ref<string | null>(null)
const pendingMessages = ref<Array<MessageResp & { _pending: true }>>([])
const showInterviewModal = ref(false)
const showInterviewDetailModal = ref(false)
const selectedInterviewId = ref<string | null>(null)
const showActionMenu = ref(false)
const actionMenuRef = ref<HTMLElement | null>(null)
const interviewFormRef = ref<FormInst | null>(null)
const isInterviewSubmitting = ref(false)
const interviewForm = reactive({
  stage_id: '',
  title: '',
  description: '',
  scheduled_at: null as number | null,
  method: 'Online',
  meeting_link: '',
  meeting_location: '',
})
let _tempIdCounter = 0

// Composables
const { data: conversationsData, isLoading: isLoadingConversations } = useConversations(page, limit)
const {
  data: messagesData,
  isLoading: isLoadingMessages,
  refetch: refetchMessages,
} = useMessages(selectedConversationId, ref(1), ref(100))
const sendMessageMutation = useSendMessage()
const markAsReadMutation = useMarkAsRead()
const { incomingMessage, readReceipt, typingStatus, sendTyping } = useChatWebSocket()
const { mutateAsync: createInterview } = useCreateInterview()
const interviewStageQueryParams = computed(() => ({ page: 1, limit: 1000 }))
const { interviewStages, isLoading: isLoadingInterviewStages } =
  useInterviewStages(interviewStageQueryParams)
const {
  interview: selectedInterview,
  isLoading: isLoadingInterviewDetail,
  refetch: refetchInterviewDetail,
} = useInterviewById(selectedInterviewId)

// Computed data
const conversations = computed(() => conversationsData.value?.data.list || [])
const messages = computed(() => {
  // Sort messages oldest first for display
  const confirmed = [...(messagesData.value?.data.list || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
  // Append pending messages that haven't been confirmed yet
  const pending = pendingMessages.value.filter(
    (pm) =>
      !confirmed.some((m) => m.content === pm.content && m.sender_user_id === pm.sender_user_id),
  )
  return [...confirmed, ...pending] as Array<MessageResp & { _pending?: true }>
})

const lastReadMsgId = computed(() => {
  const userMessages = messages.value.filter(
    (m) => m.sender_user_id === authStore.user?.id && m.read_at,
  )
  if (userMessages.length > 0) {
    return userMessages[userMessages.length - 1]?.id
  }
  return null
})

const activeConversation = computed(() => {
  return (
    conversations.value.find((c: ConversationResp) => c.id === selectedConversationId.value) || null
  )
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
watch(
  messages,
  (newMessages) => {
    if (!firstUnreadId.value && newMessages.length > 0) {
      const unread = newMessages.find((m) => m.sender_user_id !== authStore.user?.id && !m.read_at)
      if (unread) {
        firstUnreadId.value = unread.id
      }
    }
    scrollToBottom()
  },
  { deep: true },
)

watch(selectedConversationId, (newId) => {
  if (newId) {
    firstUnreadId.value = null
    refetchMessages()
    // Check if we need to mark as read
    const conv = conversations.value.find((c: ConversationResp) => c.id === newId)
    if (
      conv?.last_message &&
      conv.last_message.sender_user_id !== authStore.user?.id &&
      !conv.last_message.read_at
    ) {
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
    queryClient.setQueryData<MessageQueryCache>(
      ['messages', msg.conversation_id, 1, 100],
      (oldData) => {
        const newList = oldData?.data?.list ?? []
        return {
          ...(oldData ?? {}),
          data: {
            ...(oldData?.data ?? {}),
            list: [msg, ...newList],
          },
        }
      },
    )

    // Auto mark as read if it's open
    if (msg.sender_user_id !== authStore.user?.id) {
      markAsReadMutation.mutate(msg.conversation_id)
    }
  }

  // Update conversation list's last message
  queryClient.setQueryData<ConversationQueryCache>(
    ['conversations', page.value, limit.value],
    (oldData) => {
      if (!oldData) return oldData
      const newList =
        oldData.data?.list?.map((c) => {
          if (c.id === msg.conversation_id) {
            return { ...c, last_message: msg }
          }
          return c
        }) ?? []
      return { ...oldData, data: { ...oldData.data, list: newList } }
    },
  )
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
  router.replace({ query: { ...route.query, conversation_id: id } })
}

// Restore selected conversation from URL on mount
onMounted(() => {
  const qId = route.query.conversation_id
  if (typeof qId === 'string' && qId) {
    selectedConversationId.value = qId
  }

  document.addEventListener('click', handleMenuOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleMenuOutsideClick)
})

// Also react if the query changes externally (e.g. browser back/forward)
watch(
  () => route.query.conversation_id,
  (qId) => {
    if (typeof qId === 'string' && qId && qId !== selectedConversationId.value) {
      selectedConversationId.value = qId
    }
  },
)

watch(selectedConversationId, () => {
  showActionMenu.value = false
})

const copyName = async () => {
  if (activeConversation.value?.candidate_user_name) {
    try {
      await navigator.clipboard.writeText(activeConversation.value.candidate_user_name)
      naiveMessage.success('Candidate name copied to clipboard')
    } catch {
      naiveMessage.error('Failed to copy name')
    }
  }
}

const goToProfile = () => {
  if (activeConversation.value?.candidate_user_id) {
    router.push(`/admin/daftar-kandidat/${activeConversation.value.candidate_user_id}`)
  }
}

const sendMessage = () => {
  if (!messageInput.value.trim() || !selectedConversationId.value) return

  const content = messageInput.value
  const replyToId = replyingTo.value?.id
  const convId = selectedConversationId.value

  messageInput.value = ''
  replyingTo.value = null

  const tempId = `pending-${++_tempIdCounter}`
  const optimisticMsg = {
    id: tempId,
    conversation_id: convId,
    sender_user_id: authStore.user?.id ?? '',
    sender_name: authStore.user?.name ?? '',
    content,
    reply_to_message_id: replyToId ?? null,
    reply_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    read_at: null,
    file_url: null,
    _pending: true as const,
  } as PendingMessage
  pendingMessages.value.push(optimisticMsg)
  scrollToBottom()

  sendMessageMutation.mutate(
    { id: convId, payload: { content, reply_to_message_id: replyToId } },
    {
      onSuccess: (res) => {
        pendingMessages.value = pendingMessages.value.filter((m) => m.id !== tempId)

        queryClient.setQueryData<MessageQueryCache>(['messages', convId, 1, 100], (oldData) => {
          const newList = oldData?.data?.list ?? []
          return {
            ...(oldData ?? {}),
            data: {
              ...(oldData?.data ?? {}),
              list: [res.data, ...newList],
            },
          }
        })

        queryClient.setQueryData<ConversationQueryCache>(
          ['conversations', page.value, limit.value],
          (oldData) => {
            if (!oldData) return oldData
            const newList =
              oldData.data?.list?.map((c) => {
                if (c.id === convId) {
                  return { ...c, last_message: res.data }
                }
                return c
              }) ?? []
            return { ...oldData, data: { ...oldData.data, list: newList } }
          },
        )
      },
      onError: () => {
        pendingMessages.value = pendingMessages.value.filter((m) => m.id !== tempId)
      },
    },
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
    const bubble = el.querySelector('.rounded-2xl')
    if (bubble) {
      bubble.classList.add('ring-4', 'ring-primary/30')
      setTimeout(() => {
        bubble.classList.remove('ring-4', 'ring-primary/30')
      }, 2000)
    }
  }
}

const toggleActionMenu = () => {
  if (!isChatAvailable.value) return
  showActionMenu.value = !showActionMenu.value
}

const closeActionMenu = () => {
  showActionMenu.value = false
}

const handleMenuOutsideClick = (event: MouseEvent) => {
  if (!showActionMenu.value) return

  const target = event.target as Node
  if (actionMenuRef.value && !actionMenuRef.value.contains(target)) {
    closeActionMenu()
  }
}

const handleInterviewActionClick = (actionKey: string) => {
  const selectedAction = interviewActions.find((action) => action.key === actionKey)
  if (!selectedAction) return

  selectedAction.onClick()
  closeActionMenu()
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

const interviewStageOptions = computed<SelectOption[]>(() =>
  interviewStages.value.map((stage) => ({
    label: stage.name,
    value: stage.id,
  })),
)

const buildInterviewMessageContent = (payload: InterviewChatMessagePayload) =>
  `${INTERVIEW_MESSAGE_PREFIX}${JSON.stringify(payload)}`

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

const getMessagePreviewText = (content: string) => {
  const interviewMessage = parseInterviewMessageContent(content)

  return interviewMessage?.title || content
}

const openInterviewDetail = async (interviewId: string) => {
  selectedInterviewId.value = interviewId
  showInterviewDetailModal.value = true
  await refetchInterviewDetail()
}

const interviewActions = [
  {
    title: 'Jadwalkan Interview',
    subtitle: 'Jadwalkan interview dengan kandidat',
    key: 'schedule-interview',
    icon: CalendarTime,
    iconBackgroundColor: '#DBEAFE',
    iconColor: '#2563EB',
    onClick: () => {
      if (!isChatAvailable.value) return
      showInterviewModal.value = true
    },
  },
  {
    title: 'Kirim Dokumen',
    subtitle: 'Kirim dokumen',
    key: 'send-document',
    icon: FileText,
    iconBackgroundColor: '#FEE2E2',
    iconColor: '#EF4444',
    onClick: () => {
      if (!isChatAvailable.value) return
      naiveMessage.info('Fitur Kirim Dokumen belum tersedia.')
    },
  },
]

const interviewRules: FormRules = {
  stage_id: {
    required: true,
    message: 'Tahap interview wajib dipilih',
    trigger: ['change', 'blur'],
  },
  title: {
    required: true,
    message: 'Judul interview wajib diisi',
    trigger: ['input', 'blur'],
  },
  scheduled_at: {
    required: true,
    message: 'Waktu interview wajib dipilih',
    trigger: ['change', 'blur'],
  },
  meeting_link: {
    validator: () => {
      if (interviewForm.method !== 'Online') {
        return true
      }

      if (!interviewForm.meeting_link.trim()) {
        return new Error('Link Meeting wajib diisi untuk metode Online')
      }

      return true
    },
    trigger: ['input', 'blur', 'change'],
  },
  meeting_location: {
    validator: () => {
      if (interviewForm.method !== 'Offline') {
        return true
      }

      if (!interviewForm.meeting_location.trim()) {
        return new Error('Lokasi wajib diisi untuk metode Offline')
      }

      return true
    },
    trigger: ['input', 'blur', 'change'],
  },
  method: {
    required: true,
    message: 'Metode interview wajib dipilih',
    trigger: ['change', 'blur'],
  },
}

watch(
  () => interviewForm.method,
  (method) => {
    if (method !== 'Online') {
      interviewForm.meeting_link = ''
      interviewForm.meeting_location = ''
    }
  },
)

const resetInterviewForm = () => {
  interviewForm.stage_id = ''
  interviewForm.title = ''
  interviewForm.description = ''
  interviewForm.scheduled_at = null
  interviewForm.method = 'Online'
  interviewForm.meeting_link = ''
  interviewForm.meeting_location = ''
}

watch(showInterviewModal, (visible) => {
  if (visible) {
    resetInterviewForm()
  }
})

watch(showInterviewDetailModal, (visible) => {
  if (!visible) {
    selectedInterviewId.value = null
  }
})

const toIsoDatetime = (value: number | null) => {
  if (!value) return ''
  return new Date(value).toISOString()
}

const handleSubmitInterview = () => {
  interviewFormRef.value?.validate(async (errors) => {
    if (errors) return

    const currentConversation = activeConversation.value
    if (!currentConversation?.candidate_user_id || !currentConversation.subrequest_id) {
      naiveMessage.error('Data kandidat atau subrequest belum tersedia.')
      return
    }

    if (interviewForm.method === 'Online' && !interviewForm.meeting_link.trim()) {
      naiveMessage.error('Link meeting wajib diisi untuk interview online.')
      return
    }

    isInterviewSubmitting.value = true
    try {
      const payload: CreateInterviewPayload = {
        candidate_user_id: currentConversation.candidate_user_id,
        description: interviewForm.description.trim(),
        meeting_link: interviewForm.method === 'Online' ? interviewForm.meeting_link.trim() : '',
        meeting_location:
          interviewForm.method === 'Offline' ? interviewForm.meeting_location.trim() : '',
        method: interviewForm.method,
        scheduled_at: toIsoDatetime(interviewForm.scheduled_at),
        stage_id: interviewForm.stage_id,
        subrequest_id: currentConversation.subrequest_id,
        title: interviewForm.title.trim(),
      }

      const createdInterview = await createInterview(payload)

      const selectedStage = interviewStages.value.find(
        (stage) => stage.id === interviewForm.stage_id,
      )
      const interviewMessageContent = buildInterviewMessageContent({
        interview_id: createdInterview.data.id,
        title: createdInterview.data.title || interviewForm.title.trim(),
        scheduled_at:
          createdInterview.data.scheduled_at || toIsoDatetime(interviewForm.scheduled_at),
        method: createdInterview.data.method || interviewForm.method,
        meeting_link: createdInterview.data.meeting_link || interviewForm.meeting_link.trim(),
        meeting_location:
          createdInterview.data.meeting_location || interviewForm.meeting_location.trim(),
        stage_name: selectedStage?.name,
      })

      const previousDraft = messageInput.value
      messageInput.value = interviewMessageContent
      sendMessage()
      messageInput.value = previousDraft

      naiveMessage.success('Jadwal interview berhasil dibuat.')
      showInterviewModal.value = false
      resetInterviewForm()
    } catch (error) {
      naiveMessage.error(error instanceof Error ? error.message : 'Gagal membuat jadwal interview.')
    } finally {
      isInterviewSubmitting.value = false
    }
  })
}

const formatMessage = (content: string) => {
  if (!content) return ''
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
  const escaped = escapeHtml(content)
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all">${url}</a>`
  })
}

const isUnread = (c: ConversationResp) => {
  return (
    c.last_message &&
    c.last_message.sender_user_id !== authStore.user?.id &&
    !c.last_message.read_at
  )
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
          <n-input
            v-model:value="searchQuery"
            placeholder="Cari Kandidat..."
            round
            class="bg-white/10 text-white"
          >
            <template #prefix>
              <n-icon :component="Search" class="text-white/60" />
            </template>
          </n-input>

          <div class="flex gap-2">
            <n-tag
              :color="{
                color: activeTab === 'All' ? 'white' : 'transparent',
                textColor: activeTab === 'All' ? '#0A1A5C' : 'white',
              }"
              round
              class="cursor-pointer font-medium"
              :bordered="false"
              @click="activeTab = 'All'"
              >All</n-tag
            >
            <n-tag
              :color="{
                color: activeTab === 'Unread' ? 'white' : 'transparent',
                textColor: activeTab === 'Unread' ? '#0A1A5C' : 'white',
              }"
              round
              class="cursor-pointer font-medium"
              :bordered="false"
              @click="activeTab = 'Unread'"
              >Unread</n-tag
            >
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
              :class="{ 'bg-blue-50/50': selectedConversationId === conv.id }"
              @click="selectConversation(conv.id)"
            >
              <div class="flex items-start gap-3">
                <n-avatar
                  round
                  :size="48"
                  :src="getThumbUrl(conv.candidate_user_profile_picture) || undefined"
                  :style="
                    !conv.candidate_user_profile_picture
                      ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: 700; font-size: 18px;'
                      : ''
                  "
                >
                  <template #fallback>
                    {{ conv.candidate_user_name?.charAt(0)?.toUpperCase() || '?' }}
                  </template>
                </n-avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                    <h4 class="font-semibold text-gray-900 truncate pr-2">
                      {{ conv.candidate_user_name || 'Unknown Candidate' }}
                    </h4>
                    <span class="text-xs text-gray-500 shrink-0" v-if="conv.last_message">{{
                      formatTime(conv.last_message.created_at)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <p
                      class="text-sm text-gray-600 truncate pr-2"
                      :class="{ 'font-semibold text-gray-900': isUnread(conv) }"
                    >
                      <span v-if="typingStatus[conv.id]" class="text-blue-500 italic"
                        >typing...</span
                      >
                      <template v-else>
                        <span
                          v-if="conv.last_message?.sender_user_id === authStore.user?.id"
                          class="text-gray-400"
                          >You:
                        </span>
                        <template
                          v-if="
                            conv.last_message?.content &&
                            parseInterviewMessageContent(conv.last_message.content)
                          "
                        >
                          <span class="inline-flex items-center gap-1 text-blue-600 font-medium">
                            <n-icon size="14"><CalendarEvent /></n-icon>
                            {{ getMessagePreviewText(conv.last_message.content) }}
                          </span>
                        </template>
                        <template v-else>
                          {{ conv.last_message?.content || 'No messages yet' }}
                        </template>
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
          <div
            class="h-16 border-b border-gray-200 px-6 flex justify-between items-center bg-white shrink-0"
          >
            <div class="flex items-center gap-4">
              <n-avatar
                round
                :size="40"
                :src="getThumbUrl(activeConversation.candidate_user_profile_picture) || undefined"
                :style="
                  !activeConversation.candidate_user_profile_picture
                    ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: 700; font-size: 16px;'
                    : ''
                "
              >
                <template #fallback>
                  {{ activeConversation.candidate_user_name?.charAt(0)?.toUpperCase() || '?' }}
                </template>
              </n-avatar>
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ activeConversation.candidate_user_name }}
                </h3>
              </div>
            </div>
            <div class="flex items-center gap-4 text-gray-400">
              <n-icon
                size="20"
                class="hover:text-primary cursor-pointer"
                @click="copyName"
                title="Copy Name"
                ><Copy
              /></n-icon>
              <n-icon
                size="20"
                class="hover:text-primary cursor-pointer"
                @click="goToProfile"
                title="View Profile"
                ><User
              /></n-icon>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="flex-1 overflow-y-auto p-6 bg-gray-50" ref="messagesContainer">
            <div v-if="isLoadingMessages" class="flex justify-center p-8">
              <n-spin size="medium" />
            </div>
            <div v-else class="space-y-6">
              <template v-for="(msg, index) in messages" :key="msg.id">
                <!-- Date Divider -->
                <div
                  v-if="
                    index === 0 ||
                    new Date(msg.created_at).toDateString() !==
                      new Date(messages[index - 1]?.created_at || '').toDateString()
                  "
                  class="flex items-center gap-4 my-8"
                >
                  <div class="flex-1 h-px bg-gray-200"></div>
                  <span
                    class="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm"
                    >{{ formatDateDivider(msg.created_at) }}</span
                  >
                  <div class="flex-1 h-px bg-gray-200"></div>
                </div>

                <!-- New Messages Separator -->
                <div v-if="msg.id === firstUnreadId" class="flex items-center gap-4 my-8">
                  <div class="flex-1 h-px bg-gray-200"></div>
                  <span
                    class="text-xs font-bold text-primary/60 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm"
                    >New Messages</span
                  >
                  <div class="flex-1 h-px bg-gray-200"></div>
                </div>

                <div
                  :id="'msg-' + msg.id"
                  class="flex flex-col group"
                  :class="msg.sender_user_id === authStore.user?.id ? 'items-end' : 'items-start'"
                >
                  <div class="flex items-center gap-2 max-w-[75%]">
                    <!-- Reply Button for Received Messages -->
                    <div
                      v-if="msg.sender_user_id !== authStore.user?.id"
                      class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700 order-2 shrink-0"
                      @click="handleReply(msg)"
                    >
                      <n-icon size="16"><ArrowBackUp /></n-icon>
                    </div>

                    <div
                      class="relative"
                      :class="[
                        msg.sender_user_id === authStore.user?.id ? 'order-2' : 'order-1',
                        parseInterviewMessageContent(msg.content)
                          ? ''
                          : msg.sender_user_id === authStore.user?.id
                            ? 'rounded-md px-4 py-2.5 shadow-sm overflow-hidden bg-gray-200 text-gray-900'
                            : 'rounded-md px-4 py-2.5 shadow-sm overflow-hidden bg-gray-100 text-gray-800 border border-gray-100',
                      ]"
                    >
                      <!-- Reply Context -->
                      <div
                        v-if="msg.reply_to"
                        class="mb-2 p-2 rounded bg-black/5 border-l-4 border-primary text-xs cursor-pointer hover:bg-black/10 transition-colors"
                        @click="scrollToMessage(msg.reply_to.id)"
                      >
                        <div class="font-bold opacity-70 mb-0.5">
                          {{ msg.reply_to.sender_name }}
                        </div>
                        <div class="line-clamp-2 opacity-60">{{ msg.reply_to.content }}</div>
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

                              <!-- <div class="flex items-center gap-2">
                                <n-icon size="16" class="text-slate-400"><DeviceLaptop /></n-icon>
                                <span>{{
                                  parseInterviewMessageContent(msg.content)?.method === 'Online'
                                    ? 'Online Meeting'
                                    : 'Offline Meeting'
                                }}</span>
                              </div> -->

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

                            <div class="pt-1">
                              <n-button
                                type="primary"
                                block
                                @click="
                                  openInterviewDetail(
                                    parseInterviewMessageContent(msg.content)?.interview_id || '',
                                  )
                                "
                              >
                                Lihat Detail
                              </n-button>
                            </div>
                          </div>
                        </div>
                      </template>

                      <div v-else class="flex flex-col">
                        <p
                          class="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed pb-3"
                          v-html="formatMessage(msg.content)"
                        ></p>
                      </div>

                      <!-- Inline Timestamp -->
                      <div class="absolute bottom-1 right-2 flex items-center gap-1">
                        <template v-if="(msg as PendingMessage)._pending">
                          <n-icon size="11" class="opacity-40"><Clock /></n-icon>
                        </template>
                        <template v-else>
                          <span class="text-[10px] opacity-50 font-medium">
                            {{ formatTime(msg.created_at) }}
                          </span>
                        </template>
                      </div>
                    </div>

                    <!-- Reply Button for Sent Messages (on the left of bubble) -->
                    <div
                      v-if="msg.sender_user_id === authStore.user?.id"
                      class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-700 order-1 shrink-0"
                      @click="handleReply(msg)"
                    >
                      <n-icon size="16"><ArrowBackUp /></n-icon>
                    </div>
                  </div>

                  <!-- Read Status Icon (External) -->
                  <div
                    v-if="msg.sender_user_id === authStore.user?.id && msg.id === lastReadMsgId"
                    class="mt-0.5 px-1"
                  >
                    <n-icon size="14" class="text-blue-500" title="Read"><Eye /></n-icon>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Typing Indicator & Input Area -->
          <div class="shrink-0 bg-white border-gray-200">
            <!-- Reply Preview Bar -->
            <div
              v-if="replyingTo"
              class="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-3 animate-in slide-in-from-bottom-2"
            >
              <div class="w-1 h-8 bg-primary rounded-full"></div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-primary">
                  Replying to {{ replyingTo.sender_name }}
                </div>
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
              <div
                class="p-1 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400"
                @click="replyingTo = null"
              >
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
            <div class="p-6">
              <div class="flex items-center gap-4">
                <div class="relative shrink-0" ref="actionMenuRef">
                  <div
                    class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors shrink-0"
                    :class="{ 'opacity-50 pointer-events-none': !isChatAvailable }"
                    @click.stop="toggleActionMenu"
                  >
                    <n-icon size="24"><Plus /></n-icon>
                  </div>

                  <div
                    v-if="showActionMenu && isChatAvailable"
                    class="absolute bottom-14 left-0 z-30 w-[20rem] rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
                  >
                    <div
                      v-for="action in interviewActions"
                      :key="action.key"
                      class="flex cursor-pointer items-center gap-3 px-3 py-1.5 transition-colors hover:bg-slate-50"
                      @click="handleInterviewActionClick(action.key)"
                    >
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full"
                        :style="{ backgroundColor: action.iconBackgroundColor }"
                      >
                        <n-icon :size="24" :color="action.iconColor">
                          <component :is="action.icon" />
                        </n-icon>
                      </div>

                      <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-semibold leading-tight text-slate-700">
                          {{ action.title }}
                        </span>
                        <span class="text-xs leading-tight text-slate-400">
                          {{ action.subtitle }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <n-input
                  v-model:value="messageInput"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  :placeholder="'Type here...'"
                  :disabled="!isChatAvailable"
                  size="large"
                  class="flex-1 bg-gray-50 text-base rounded-xl!"
                  @input="handleTyping"
                  @keydown.enter="handleEnter"
                />
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
                  :class="
                    messageInput.trim() && isChatAvailable
                      ? 'bg-primary text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 pointer-events-none'
                  "
                  @click="sendMessage"
                >
                  <n-icon size="20"><Send /></n-icon>
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

    <n-modal v-model:show="showInterviewModal" preset="card" :bordered="false" style="width: 40rem">
      <div class="-mt-8">
        <h3 class="text-lg font-semibold">Jadwalkan Interview</h3>
        <h4 class="text-sm text-gray-500 mb-6">Buat jadwal interview untuk kandidat ini</h4>
        <div class="space-y-1">
          <n-form
            ref="interviewFormRef"
            :model="interviewForm"
            :rules="interviewRules"
            label-placement="top"
          >
            <n-form-item label="Tahap Interview" path="stage_id">
              <n-select
                v-model:value="interviewForm.stage_id"
                :options="interviewStageOptions"
                placeholder="Pilih tahap interview"
                :loading="isLoadingInterviewStages"
                clearable
              />
            </n-form-item>

            <n-form-item label="Judul Interview" path="title">
              <n-input
                v-model:value="interviewForm.title"
                placeholder="Contoh: Interview HR - Front End Developer"
              />
            </n-form-item>

            <n-form-item label="Deskripsi" path="description">
              <n-input
                v-model:value="interviewForm.description"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="Tambahkan catatan atau detail tambahan (opsional)"
              />
            </n-form-item>

            <n-form-item label="Waktu Interview" path="scheduled_at">
              <n-date-picker
                v-model:value="interviewForm.scheduled_at"
                type="datetime"
                clearable
                placeholder="Pilih tanggal dan waktu"
                class="w-full"
                :default-time="'09:00:00'"
              />
            </n-form-item>

            <n-form-item label="Metode" path="method">
              <div class="grid grid-cols-2 gap-3 w-full">
                <n-button
                  :type="interviewForm.method === 'Online' ? 'primary' : 'default'"
                  @click="interviewForm.method = 'Online'"
                >
                  <template #icon>
                    <n-icon>
                      <DeviceLaptop />
                    </n-icon>
                  </template>
                  Interview Online
                </n-button>
                <n-button
                  :type="interviewForm.method === 'Offline' ? 'primary' : 'default'"
                  @click="interviewForm.method = 'Offline'"
                >
                  <n-icon>
                    <MapPin />
                  </n-icon>
                  Interview Offline
                </n-button>
              </div>
            </n-form-item>

            <template v-if="interviewForm.method === 'Online'">
              <n-form-item label="Link Meeting" path="meeting_link">
                <n-input v-model:value="interviewForm.meeting_link" placeholder="https://..." />
              </n-form-item>
            </template>
            <template v-if="interviewForm.method === 'Offline'">
              <n-form-item label="Lokasi" path="meeting_location">
                <n-input
                  v-model:value="interviewForm.meeting_location"
                  placeholder="Lokasi interview (misal: Kantor Pusat, Ruang Meeting 2)"
                />
              </n-form-item>
            </template>
          </n-form>

          <div class="flex justify-end gap-3 pt-2 w-full">
            <n-button secondary @click="showInterviewModal = false">Batal</n-button>
            <n-button
              type="primary"
              :loading="isInterviewSubmitting"
              @click="handleSubmitInterview"
            >
              Simpan Jadwal
            </n-button>
          </div>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="showInterviewDetailModal"
      preset="card"
      :bordered="false"
      style="width: 40rem"
    >
      <div class="-mt-8">
        <div v-if="isLoadingInterviewDetail" class="flex justify-center py-10">
          <n-spin size="medium" />
        </div>

        <div v-else-if="selectedInterview" class="space-y-4">
          <h4 class="mt-1 text-lg font-semibold text-slate-800">{{ selectedInterview.title }}</h4>
          <div class="rounded-2xl py-1 space-y-3">
            <div class="grid gap-3 text-sm text-slate-600">
              <div v-if="selectedInterview.description" class="bg-white text-sm text-slate-600">
                {{ selectedInterview.description }}
              </div>
              <div class="space-y-3 p-3">
                <div class="flex items-start gap-2">
                  <n-icon size="16" class="mt-0.5 text-slate-500"><Clock /></n-icon>
                  <span class="text-gray-800"
                    >{{ formatInterviewTime(selectedInterview.scheduled_at) }} WIB</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <n-icon size="16" class="mt-0.5 text-slate-500"><CalendarTime /></n-icon>
                  <span class="text-gray-800">{{
                    formatInterviewDate(selectedInterview.scheduled_at)
                  }}</span>
                </div>
                <!-- <div class="flex items-start gap-2">
                  <n-icon size="16" class="mt-0.5 text-slate-400"><Message /></n-icon>
                  <span>{{ selectedInterview.stage?.name || '-' }}</span>
                </div> -->
                <div class="flex items-start gap-2">
                  <n-icon
                    v-if="selectedInterview.method === 'Online'"
                    size="16"
                    class="mt-0.5 text-slate-500"
                    ><DeviceLaptop
                  /></n-icon>
                  <n-icon v-else size="16" class="mt-0.5 text-slate-500"><Home /></n-icon>
                  <span class="text-gray-800">{{
                    selectedInterview.method === 'Online' ? 'Interview Online' : 'Interview Offline'
                  }}</span>
                </div>
                <div v-if="selectedInterview.method === 'Online'" class="flex items-start gap-2">
                  <n-icon size="16" class="mt-0.5 text-slate-500"><Video /></n-icon>
                  <a
                    :href="selectedInterview.meeting_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-500 hover:text-blue-600 underline break-all"
                  >
                    {{ selectedInterview.meeting_link }}
                  </a>
                </div>
                <div v-else class="flex items-start gap-2">
                  <n-icon size="16" class="mt-0.5 text-slate-500"><MapPin /></n-icon>
                  <p class="text-gray-800">{{ selectedInterview.meeting_location || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-10 text-center text-gray-500">Detail interview tidak ditemukan.</div>

        <div class="flex justify-center gap-3 pt-4 w-full">
          <n-button type="error" @click="showInterviewDetailModal = false" style="width: 25%"
            >Batalkan Jadwal</n-button
          >
        </div>
      </div>
    </n-modal>
  </AdminLayout>
</template>

<style scoped>
.typing-dot {
  width: 4px;
  height: 4px;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

:deep(.n-input .n-input__input-el),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-input),
:deep(.n-date-picker .n-input__input-el),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-input) {
  font-size: 12px;
}

:deep(.n-input .n-input__placeholder),
:deep(.n-base-selection-label__placeholder),
:deep(.n-date-picker .n-input__placeholder),
:deep(.n-form-item .n-form-item-label),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-placeholder) {
  color: #cbd5e1;
}

:deep(.n-form-item .n-form-item-label) {
  color: #64748b;
  font-weight: 600;
}

@keyframes typing-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
