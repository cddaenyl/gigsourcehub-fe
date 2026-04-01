<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton, NIcon, NDrawer, NSpin } from 'naive-ui'
import type { DrawerPlacement } from 'naive-ui'
import { Search, ApiApp, Send, X, ChevronRight, User } from '@vicons/tabler'
import { useAICandidateSearch } from '../composables/useAICandidateSearch'
import { useAuthStore } from '../stores/auth.store'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)
const router = useRouter()
const searchValue = ref('')
const active = ref(false)
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
  active.value = true
  placement.value = place
}

const { chatHistory, sendMessage, isLoading } = useAICandidateSearch()

const handleSendMessage = async () => {
  if (!queryInput.value.trim() || isLoading.value) return
  sendMessage(queryInput.value)
  queryInput.value = ''
  
  await nextTick()
  scrollToBottom()
  
  // reset textarea height if we kept it, but we are using input now
}

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

// Function to navigate to candidate detail
const goToCandidate = (id: string) => {
  if (id) {
    router.push(`/admin/daftar-kandidat/${id}`)
    active.value = false // perfectly valid UX to close the drawer after navigation
  }
}

</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Existing external search bar -->
    <n-input
      v-model:value="searchValue"
      placeholder="Cari kandidat"
      class="w-80"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <n-icon :component="Search" />
      </template>
    </n-input>

    <n-button type="primary" @click="activate('right')">
      <template #icon>
        <n-icon :component="ApiApp" />
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
            <h2 class="text-[17px] font-semibold text-slate-800 tracking-tight">AI Overview</h2>
          </div>
          <button @click="active = false" class="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/60 transition-colors">
            <n-icon :component="X" size="16" />
          </button>
        </div>

        <!-- Scrollable Chat Body -->
        <div ref="chatContainerRef" class="flex-1 overflow-y-auto px-5 py-6 space-y-7">
          <div v-for="msg in chatHistory" :key="msg.id" class="flex flex-col w-full">
            
            <!-- User Message Bubbles -->
            <div v-if="msg.role === 'user'" class="flex flex-col items-end w-full mb-1">
               <div class="flex items-center justify-end space-x-2.5 mb-2 w-full pr-1">
                 <span class="font-bold text-[14px] text-slate-800">You</span>
                 <span class="text-xs text-slate-400">{{ msg.timestamp }}</span>
                 <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 shadow-sm ml-1 border border-slate-200 flex items-center justify-center text-slate-500">
                    <img v-if="currentUser?.profile_picture" :src="currentUser.profile_picture" alt="User avatar" class="w-full h-full object-cover" />
                    <n-icon v-else :component="User" size="18" />
                 </div>
               </div>
               
               <div class="bg-[#F8FAFC] text-slate-600 px-6 py-4 rounded-[20px] rounded-tr-sm text-[15px] shadow-sm leading-relaxed max-w-[90%] border border-slate-100">
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
                <!-- Summary Text bg-slate-50 is very light gray -->
                <div class="bg-[#F8FAFC] px-6 py-5 rounded-[20px] rounded-tl-sm text-[15px] text-slate-600 leading-relaxed shadow-sm border border-slate-100 relative group">
                  {{ msg.text }}
                </div>

                <!-- Top Candidates List -->
                <Transition name="slide-up">
                  <div v-if="msg.displayParsedContent && msg.parsedContent && msg.parsedContent.candidates && msg.parsedContent.candidates.length > 0" class="mt-7 w-full overflow-visible">
                    <div class="text-[13px] font-bold text-slate-700 mb-3 px-1 tracking-wide">
                      Kandidat Teratas
                    </div>
                    
                    <div class="space-y-3.5">
                      <div 
                        v-for="cand in msg.parsedContent.candidates" 
                        :key="cand.id" 
                        @click="goToCandidate(cand.id)"
                        class="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group bg-white shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)]"
                      >
                        <div class="flex items-center space-x-4">
                          <!-- User Thumbnail format matching the Document mockup -->
                          <div class="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                             <img v-if="cand.profile_picture_url" :src="cand.profile_picture_url" class="w-full h-full object-cover" />
                             <div v-else class="text-blue-600 font-bold text-lg">
                               {{ getInitials(cand.name) }}
                             </div>
                          </div>
                          
                          <div class="flex flex-col overflow-hidden max-w-[210px] space-y-1">
                            <span class="font-semibold text-[14px] text-slate-700 truncate group-hover:text-[#0014B2] transition-colors">{{ cand.name }}</span>
                            <span class="text-[13px] text-slate-500 truncate">Front End Developer &bull; Score {{ cand.score }}%</span>
                          </div>
                        </div>
                        
                        <div class="flex items-center justify-center w-6 h-6 text-slate-400 group-hover:text-slate-600">
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
            <div class="bg-[#F8FAFC] border border-slate-100 px-5 py-3 rounded-[20px] rounded-tl-sm shadow-sm flex items-center space-x-3 w-24 h-12">
               <n-spin size="small" />
            </div>
          </div>
        </div>

        <!-- Fade out effect shadow on bottom of list -->
        <div class="h-6 w-full bg-linear-to-b from-transparent to-white pointer-events-none -mt-6 z-10"></div>

        <!-- Footer / Input Section -->
        <div class="bg-white p-5 border-t border-slate-100 shrink-0 z-20 w-full flex items-center justify-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.02)]">
          
          <!-- Text Input (Full width rounded pill) -->
          <div class="relative flex items-center w-full">
            <input
              v-model="queryInput"
              type="text"
              placeholder="Masukkan pertanyaan atau perintah anda"
              class="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-[#0014B2] rounded-full pl-6 pr-14 py-3.5 text-[14px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-sm transition-all"
              @keydown.enter.prevent="handleSendMessage"
            />
            
            <button 
              @click="handleSendMessage"
              :disabled="isLoading || !queryInput.trim()"
              class="absolute right-[6px] w-[38px] h-[38px] flex items-center justify-center rounded-full bg-[#0014B2] hover:bg-blue-800 text-white disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-50 transition-colors shadow-sm"
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
</style>
