<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NDrawer, NSpin, NEmpty, NPopconfirm } from 'naive-ui'
import type { DrawerPlacement } from 'naive-ui'
import { ApiApp, Send, X, ChevronRight, User, History, MessagePlus, Trash } from '@vicons/tabler'
import SearchInput from './shared/SearchInput.vue'
import { useAICandidateSearch } from '../composables/useAICandidateSearch'
import { useAIChatHistory } from '../composables/useAIChatHistory'
import { useAuthStore } from '../stores/auth.store'
import { getUserProfilePictureApi } from '../services/user.service'
import { getProfilePictureThumbnail } from '@/utils/image'
import type { ChatMessage } from '../models/CandidateSearch'
import CandidateLevelChip from './CandidateLevelChip.vue'

interface Props {
  placeholder?: string
  isAiEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Cari kandidat',
  isAiEnabled: true,
})

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)
const router = useRouter()
const searchValue = ref('')
const active = ref(false)
const showHistory = ref(false)
const placement = ref<DrawerPlacement>('right')
const queryInput = ref('')

const chatContainerRef = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  search: [value: string]
}>()

const handleSearch = () => {
  emit('search', searchValue.value)
}

const activate = (place: DrawerPlacement) => {
  if (!props.isAiEnabled) return
  active.value = true
  placement.value = place
}

const { 
  myChats, 
  isLoadingChats, 
  currentChatId, 
  createChat, 
  deleteChat, 
  storeMessage, 
  loadChatMessages 
} = useAIChatHistory(computed(() => props.isAiEnabled))

const chatHistory = ref<ChatMessage[]>([])
const { sendMessage, isLoading, aiSearchMutation } = useAICandidateSearch(chatHistory)

// Handle chat selection
const selectChat = async (id: string) => {
  currentChatId.value = id
  chatHistory.value = await loadChatMessages(id)
  showHistory.value = false
  await nextTick()
  scrollToBottom()
}

const handleNewChat = () => {
  currentChatId.value = null
  chatHistory.value = []
  showHistory.value = false
}

const handleDeleteChat = async (id: string) => {
  await deleteChat(id)
}

const handleSendMessage = async () => {
  if (!queryInput.value.trim() || isLoading.value) return
  
  const originalQuery = queryInput.value
  
  // 1. If no current chat, create one
  if (!currentChatId.value) {
    const res = await createChat(originalQuery)
    if (res.data) {
      currentChatId.value = res.data.id
    }
  }

  // 2. Store user message to DB
  if (currentChatId.value) {
    await storeMessage({ chatId: currentChatId.value, role: 'user', content: originalQuery })
  }

  // 3. Send via AI service (which adds to chatHistory and triggers mutation)
  sendMessage(originalQuery)
  queryInput.value = ''
  
  await nextTick()
  scrollToBottom()
}

// Intercept AI response to store it in DB
watch(() => aiSearchMutation.isSuccess.value, async (success) => {
  if (success && currentChatId.value) {
    const data = aiSearchMutation.data.value
    if (data && data.data && data.data.length > 0) {
      const item = data.data[0]
      if (item) {
        // Store full JSON content as AI message
        await storeMessage({ 
          chatId: currentChatId.value, 
          role: 'ai',
          content: item.content, 
          isLast: true 
        })
      }
    }
  }
})

watch(chatHistory, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

const scrollToBottom = () => {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const getInitials = (name: string) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const goToCandidate = (id: string) => {
  if (id) {
    router.push(`/admin/daftar-kandidat/${id}`)
    active.value = false
  }
}

const profilePics = ref<Record<string, string | null>>({})
const fetchProfilePic = async (id: string) => {
  if (profilePics.value[id] !== undefined) return
  
  try {
    const res = await getUserProfilePictureApi(id)
    profilePics.value[id] = getProfilePictureThumbnail(res.profile_picture_url) || null
  } catch (err) {
    console.error(`Failed to fetch profile pic for candidate ${id}`, err)
    profilePics.value[id] = null
  }
}

// Watch chat history to trigger profile pic fetches for new AI messages
watch(chatHistory, (newHistory) => {
  newHistory.forEach(msg => {
    if (msg.role === 'ai' && msg.displayParsedContent && msg.parsedContent?.candidates) {
      msg.parsedContent.candidates.forEach(cand => {
        fetchProfilePic(cand.id)
      })
    }
  })
}, { deep: true, immediate: true })

const startAiSearch = async (promptText: string, autoSend: boolean = true) => {
  active.value = true
  queryInput.value = promptText
  if (autoSend) {
    await nextTick()
    await handleSendMessage()
  }
}

// Auto-load the last active or most recent conversation when drawer is opened
watch([active, () => myChats.value?.data], async ([isOpen, chats]) => {
  if (isOpen && chatHistory.value.length === 0) {
    if (currentChatId.value) {
      chatHistory.value = await loadChatMessages(currentChatId.value)
    } else if (chats && chats.length > 0) {
      const mostRecentChat = chats[0]
      if (mostRecentChat && mostRecentChat.id) {
        currentChatId.value = mostRecentChat.id
        chatHistory.value = await loadChatMessages(mostRecentChat.id)
      }
    }
  }
}, { immediate: true })

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustTextareaHeight = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  const scrollHeight = textareaRef.value.scrollHeight
  textareaRef.value.style.height = `${Math.min(scrollHeight, 88)}px`
}

watch(queryInput, () => {
  nextTick(adjustTextareaHeight)
})

defineExpose({
  startAiSearch,
  activate,
})
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Existing external search bar -->
    <SearchInput
      v-model="searchValue"
      :placeholder="props.placeholder"
      @search="handleSearch"
    />

    <n-button type="primary" @click="activate('right')" :disabled="!props.isAiEnabled">
      <template #icon>
        <n-icon>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
            <path d="M5 4L5.6 5.4L7 6L5.6 6.6L5 8L4.4 6.6L3 6L4.4 5.4L5 4Z" fill="currentColor"/>
            <path d="M19 19L19.6 20.4L21 21L19.6 21.6L19 23L18.4 21.6L17 21L18.4 20.4L19 19Z" fill="currentColor"/>
          </svg>
        </n-icon>
      </template>
      AI Assistant
    </n-button>

    <n-drawer v-model:show="active" :width="500" placement="right">
      <!-- Full drawer container without default internal padding -->
      <div class="h-full w-full flex flex-col bg-white font-sans overflow-hidden">
        
        <!-- Minimalist White Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 shadow-[0_4px_10px_-10px_rgba(0,0,0,0.1)] z-10 bg-white relative">
          <div class="flex items-center space-x-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-[#0014B2]">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
              <path d="M5 4L5.6 5.4L7 6L5.6 6.6L5 8L4.4 6.6L3 6L4.4 5.4L5 4Z" fill="currentColor"/>
              <path d="M19 19L19.6 20.4L21 21L19.6 21.6L19 23L18.4 21.6L17 21L18.4 20.4L19 19Z" fill="currentColor"/>
            </svg>
            <h2 class="text-[17px] font-semibold text-slate-800 tracking-tight">AI Assistant</h2>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="showHistory = !showHistory" 
              class="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              :class="{ 'bg-blue-50 border-blue-200 text-[#0014B2]': showHistory }"
              title="History"
            >
              <n-icon :component="History" size="18" />
            </button>
            <button 
              @click="handleNewChat" 
              class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all"
              title="New Chat"
            >
              <n-icon :component="MessagePlus" size="18" />
            </button>
            <button @click="active = false" class="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 transition-colors">
              <n-icon :component="X" size="16" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-hidden relative flex flex-col">
          <!-- Chat History Overlay -->
          <Transition name="fade">
            <div v-show="showHistory" class="absolute inset-0 bg-white z-20 flex flex-col p-5 overflow-y-auto space-y-3">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Riwayat Chat</h3>
                <span class="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  {{ myChats?.data?.length || 0 }} Sesi
                </span>
              </div>
              
              <div v-if="isLoadingChats" class="flex flex-col items-center justify-center py-12 space-y-3">
                <n-spin size="medium" />
                <span class="text-xs text-slate-400">Memuat riwayat...</span>
              </div>

              <div v-else-if="!myChats?.data || myChats.data.length === 0" class="py-12">
                <n-empty description="Belum ada riwayat chat" />
              </div>

              <div v-else class="space-y-2">
                <div 
                  v-for="chat in myChats.data" 
                  :key="chat.id"
                  class="group relative flex items-center p-3.5 rounded-xl border border-slate-100 transition-all cursor-pointer hover:border-blue-200 hover:bg-blue-50/30"
                  :class="{ 'border-blue-400 bg-blue-50/50 ring-2 ring-blue-500/5': currentChatId === chat.id }"
                  @click="selectChat(chat.id)"
                >
                  <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mr-3 shrink-0 group-hover:bg-blue-100 transition-colors">
                    <n-icon :component="ApiApp" size="18" class="text-slate-500 group-hover:text-[#0014B2]" />
                  </div>
                  <div class="flex flex-col overflow-hidden flex-1 pr-8">
                    <span class="text-[13px] font-semibold text-slate-700 truncate mb-0.5">
                      {{ chat.title || `Chat #${chat.id?.substring(0, 8) || 'Session'}` }}
                    </span>
                    <span class="text-[11px] text-slate-400">{{ chat.created_at ? new Date(chat.created_at).toLocaleDateString() : '-' }}</span>
                  </div>
                  
                  <n-popconfirm @positive-click.stop="handleDeleteChat(chat.id)">
                    <template #trigger>
                      <button 
                        @click.stop 
                        class="absolute right-3 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-md hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-300 transition-all border border-transparent hover:border-red-100"
                      >
                        <n-icon :component="Trash" size="16" />
                      </button>
                    </template>
                    Hapus sesi chat ini?
                  </n-popconfirm>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Scrollable Chat Body -->
          <div ref="chatContainerRef" class="flex-1 overflow-y-auto px-5 py-6 space-y-7">
            <!-- Initial State if empty -->
            <div v-if="chatHistory.length === 0 && !isLoading" class="h-full flex flex-col items-center justify-center py-20 text-center space-y-5 px-10">
               <div class="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-[#0014B2]">
                   <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                 </svg>
               </div>
               <div class="space-y-2">
                 <h3 class="text-lg font-bold text-slate-800">Tanyakan apa saja ke AI Assistant</h3>
                 <p class="text-sm text-slate-500 leading-relaxed">Cari kandidat berdasarkan kriteria teknis, lokasi, atau pengalaman dengan bahasa natural.</p>
               </div>
               <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
                 <button @click="queryInput = 'Cari Frontend Developer di Jakarta'; handleSendMessage()" class="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">"Cari Frontend Developer di Jakarta"</button>
                 <button @click="queryInput = 'Kandidat yang ahli React dan Node.js'; handleSendMessage()" class="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">"React & Node.js specialist"</button>
               </div>
            </div>

            <div v-for="msg in chatHistory" :key="msg.id" class="flex flex-col w-full">
              
              <!-- User Message Bubbles -->
              <div v-if="msg.role === 'user'" class="flex flex-col items-end w-full mb-1">
                 <div class="flex items-center justify-end space-x-2.5 mb-2 w-full pr-1">
                   <span class="font-bold text-[14px] text-slate-800">You</span>
                   <span class="text-xs text-slate-400">{{ msg.timestamp }}</span>
                   <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 shadow-sm ml-1 border border-slate-200 flex items-center justify-center text-slate-500">
                      <img v-if="currentUser?.profile_picture" :src="getProfilePictureThumbnail(currentUser.profile_picture)" alt="User avatar" class="w-full h-full object-cover" />
                      <n-icon v-else :component="User" size="18" />
                   </div>
                 </div>
                 
                 <div class="bg-[#F8FAFC] text-slate-600 px-6 py-4 rounded-[20px] rounded-tr-sm text-[15px] shadow-sm leading-relaxed max-w-[90%] border border-slate-100 whitespace-pre-wrap">
                   {{ msg.text }}
                 </div>
              </div>

              <!-- AI Message Bubble & Containers -->
              <div v-if="msg.role === 'ai'" class="flex w-full justify-start space-x-4 mt-2">
                <div class="shrink-0 w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-[#0014B2]">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                    <path d="M5 4L5.6 5.4L7 6L5.6 6.6L5 8L4.4 6.6L3 6L4.4 5.4L5 4Z" fill="currentColor"/>
                  </svg>
                </div>
                
                <div class="flex flex-col w-full max-w-[90%]">
                  <!-- Summary Text -->
                  <div class="bg-white border border-slate-100 px-6 py-5 rounded-[20px] rounded-tl-sm text-[15px] text-slate-600 leading-relaxed shadow-sm relative group whitespace-pre-wrap">
                    {{ msg.text }}
                    <div v-if="msg.isTyping" class="inline-flex items-center ml-2 space-x-1">
                      <span class="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                      <span class="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span class="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                  </div>

                  <!-- Top Candidates List -->
                  <Transition name="slide-up">
                    <div v-if="msg.displayParsedContent && msg.parsedContent && msg.parsedContent.candidates && msg.parsedContent.candidates.length > 0" class="mt-7 w-full overflow-visible">
                      <div class="text-[13px] font-bold text-slate-700 mb-3 px-1 tracking-wide uppercase flex items-center space-x-2">
                        <div class="w-1 h-4 bg-[#0014B2] rounded-full"></div>
                        <span>Kandidat Teratas</span>
                      </div>
                      
                      <div class="space-y-3.5">
                        <div 
                          v-for="cand in msg.parsedContent.candidates" 
                          :key="cand.id" 
                          @click="goToCandidate(cand.id)"
                          class="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group bg-white shadow-[0_2px_12px_-5px_rgba(0,0,0,0.06)] border border-slate-100 hover:border-blue-100"
                        >
                          <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                               <img v-if="profilePics[cand.id]" :src="profilePics[cand.id]!" class="w-full h-full object-cover" />
                               <div v-else class="text-blue-600 font-bold text-lg">
                                 {{ getInitials(cand.name) }}
                               </div>
                            </div>
                            
                             <div class="flex flex-col space-y-1">
                              <div class="flex items-center gap-2">
                                <span class="font-semibold text-[14px] text-slate-700 truncate group-hover:text-[#0014B2] transition-colors">{{ cand.name }}</span>
                                <CandidateLevelChip 
                                  v-if="cand.candidate_level" 
                                  :level="cand.candidate_level" 
                                  class="scale-75 origin-left" 
                                />
                              </div>
                              <!-- Row 1: all job roles as tags, wrap if needed -->
                              <div class="flex items-center flex-wrap gap-1">
                                <template v-if="cand.job_roles && cand.job_roles.length > 0">
                                  <span
                                    v-for="role in cand.job_roles"
                                    :key="role"
                                    class="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200"
                                  >{{ role }}</span>
                                </template>
                                <template v-else>
                                  <span class="text-[13px] text-slate-400">Kandidat</span>
                                </template>
                              </div>
                              <!-- Row 2: % match always below -->
                              <span class="bg-blue-50 text-[#0014B2] px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100 self-start">{{ cand.score }}% Match</span>
                            </div>
                          </div>
                          
                          <div class="flex items-center justify-center w-6 h-6 text-slate-400 group-hover:text-[#0014B2] group-hover:translate-x-0.5 transition-all">
                            <n-icon :component="ChevronRight" size="20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
              
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="flex w-full justify-start space-x-4 mt-2">
              <div class="shrink-0 w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-[#0014B2]">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                  </svg>
              </div>
              <div class="bg-white border border-slate-100 px-5 py-3 rounded-[20px] rounded-tl-sm shadow-sm flex items-center space-x-3 w-24 h-12">
                 <n-spin size="small" />
              </div>
            </div>
          </div>
        </div>

        <!-- Fade out effect shadow on bottom of list -->
        <div class="h-6 w-full bg-linear-to-b from-transparent to-white pointer-events-none -mt-6 z-10"></div>

        <!-- Footer / Input Section -->
        <div class="bg-white p-5 border-t border-slate-100 shrink-0 z-20 w-full flex items-center justify-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.02)]">
          
          <!-- Text Input (Full width rounded pill) -->
          <div class="flex items-end gap-2 w-full bg-white border border-slate-300 hover:border-slate-400 focus-within:border-[#0014B2] focus-within:ring-4 focus-within:ring-blue-600/10 rounded-[24px] pl-5 pr-2 py-2 shadow-sm transition-all">
            <textarea
              ref="textareaRef"
              v-model="queryInput"
              rows="1"
              placeholder="Masukkan kriteria pencarian kandidat..."
              class="flex-1 bg-transparent border-0 resize-none max-h-[88px] overflow-y-auto text-[14px] font-medium text-slate-700 focus:outline-none py-2"
              @keydown.enter.exact.prevent="handleSendMessage"
            />
            
            <button 
              @click="handleSendMessage"
              :disabled="isLoading || !queryInput.trim()"
              class="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-[#0014B2] hover:bg-blue-800 text-white disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-50 transition-colors shadow-sm shrink-0 mb-[1px]"
            >
               <n-icon :component="Send" size="18" />
            </button>
          </div>
        </div>

      </div>
    </n-drawer>
  </div>
</template>

<style scoped>
/* Base custom drawer reset overrides */
:deep(.n-drawer-content-wrapper) {
  padding: 0 !important;
}

:deep(.n-drawer-body-content-wrapper) {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Slide up transition for candidate list */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
