<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useProfile } from '@/composables/useProfile'
import { useLogout } from '@/composables/useAuth'
import { onMounted, onUnmounted, ref } from 'vue'
import Footer from '@/components/Footer.vue'
import { 
  User, 
  Message, 
  Briefcase, 
  Bell, 
  Settings, 
  Logout
} from '@vicons/tabler'
import { NIcon, NAvatar, NBadge } from 'naive-ui'
import logoSrc from '@/assets/LogoGigSource.svg'

defineOptions({
  name: 'CandidateLayout',
})

defineProps<{
  containerClass?: string
}>()

import { useConversations } from '@/composables/useChat'
import { useChatWebSocket } from '@/composables/useChatWebSocket'
import { useQueryClient } from '@tanstack/vue-query'
import { useUnreadNotificationCount } from '@/composables/useNotification'

const route = useRoute()
const authStore = useAuthStore()
const { profile } = useProfile()
const logout = useLogout()
const queryClient = useQueryClient()

const { data: chatData } = useConversations(ref(1), ref(10))
const unreadMessagesCount = computed(() => chatData.value?.data.unread_total || 0)

const { data: unreadNotifData } = useUnreadNotificationCount()
const unreadNotifCount = computed(() => unreadNotifData.value?.data.unread_count || 0)

const { incomingMessage } = useChatWebSocket()
watch(incomingMessage, (msg) => {
  if (msg) {
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  }
})

const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const menuItems = computed(() => [
  { label: 'Profile', icon: User, path: '/candidate/profile' },
  { label: 'Message', icon: Message, path: '/candidate/chat', badge: unreadMessagesCount.value },
  { label: 'Recruitment', icon: Briefcase, path: '/candidate/recruitment' },
  { label: 'Notifications', icon: Bell, path: '/candidate/notifications', badge: unreadNotifCount.value },
  { label: 'Account', icon: Settings, path: '/candidate/account' },
])

const isActive = (path: string) => {
  return route.path === path || (path !== '/candidate' && route.path.startsWith(path))
}

const handleLogout = () => {
  logout()
}

const candidateName = computed(() => profile.value?.name || authStore.user?.name || 'Candidate')
const userInitials = computed(() => {
  const name = profile.value?.name || authStore.user?.name || ''
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  const first = parts[0] || ''
  if (!first) return 'U'
  if (parts.length === 1) return first.substring(0, 2).toUpperCase()
  const last = parts[parts.length - 1] || ''
  return (first[0] + (last[0] || '')).toUpperCase()
})
const candidateRole = computed(() => {
  if (profile.value?.job_roles?.length) {
    return profile.value.job_roles.map((r: any) => r.name).join(', ')
  }
  return 'Candidate'
})

const recruitmentStatus = computed(() => profile.value?.recruitment_status_name || 'Avaliable')
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header/Navigation -->
    <header 
      class="sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl"
      :class="isScrolled ? 'bg-white/65 border-b border-slate-200/80' : 'bg-linear-to-r from-violet-950 to-black to-60%'"
    >
      <div class="max-w-7xl mx-auto px-8 h-18 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <img 
            :src="logoSrc" 
            alt="Logo" 
            class="h-9 transition-all duration-300"
            :class="!isScrolled ? 'brightness-0 invert' : ''"
          />
        </RouterLink>
        
        <div class="flex items-center gap-6">
          <RouterLink 
            to="/" 
            class="text-sm font-medium transition-colors"
            :class="isScrolled ? 'text-slate-900 hover:text-primary' : 'text-white hover:text-white/80'"
          >
            Home
          </RouterLink>
          <button 
            @click="handleLogout"
            class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold outline -outline-offset-1 transition-all duration-200"
            :class="isScrolled 
              ? 'bg-slate-900/5 text-slate-900 outline-slate-900/10 hover:bg-slate-900/10 hover:scale-105' 
              : 'bg-white/10 text-white outline-white/10 hover:bg-white/20 hover:scale-105'"
          >
            Logout
            <n-icon :size="18"><Logout /></n-icon>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section (Always shown on candidate pages) -->
    <section v-if="route.path.startsWith('/candidate')" class="bg-linear-to-r from-violet-950 to-black to-60% text-white overflow-hidden relative">
      <!-- Background elements -->
      <div class="absolute top-0 right-0 w-1/3 h-full bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-rgb),0.15),transparent_70%)] pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto px-8 py-4 pb-12 relative z-10">
        <div class="flex items-center gap-10">
          <div class="relative group">
            <n-avatar
              round
              :size="110"
              :src="authStore.user?.profile_picture || profile?.profile_picture || undefined" 
              class="border-4 border-white/10 shadow-2xl transition-transform group-hover:scale-105 bg-blue-600 text-white font-bold text-4xl flex items-center justify-center"
            >
              {{ userInitials }}
            </n-avatar>
          </div>
          
          <div class="space-y-2">
            <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ candidateName }}</h1>
            <p class="text-white/60 text-lg font-medium">{{ candidateRole }}</p>
            
            <div class="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 text-white/80 rounded-full text-[10px] font-semibold border border-white/10">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              {{ recruitmentStatus }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="flex-1 pb-20 mt-8 relative z-20">
      <div class="max-w-7xl mx-auto px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Sidebar -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-26">
              <div class="p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-2">Menu</h3>
                <nav class="space-y-1.5">
                  <RouterLink 
                    v-for="item in menuItems" 
                    :key="item.path"
                    :to="item.path"
                    class="flex items-center justify-between px-3 py-2 rounded-3xl transition-all duration-200 group"
                    :class="isActive(item.path) 
                      ? 'bg-primary/5 text-primary border border-primary shadow-xs font-semibold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'"
                  >
                    <div class="flex items-center gap-3">
                      <n-icon 
                        :size="20" 
                        :component="item.icon" 
                        :class="isActive(item.path) ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'"
                      />
                      <span>{{ item.label }}</span>
                    </div>
                    <n-badge v-if="item.badge" :value="item.badge" type="error" />
                  </RouterLink>
                </nav>
              </div>
            </div>
          </div>

          <!-- Page Content -->
          <div class="lg:col-span-9 flex flex-col">
            <div :class="containerClass || 'bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col'">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
