<script setup lang="ts">
import { computed, h, watch } from 'vue'
import type { Component } from 'vue'
import { NMenu, NAvatar, NSpace, NBadge } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { Bell, Logout } from '@vicons/tabler'
import { useLogout, useMeQuery } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth.store'

import { useProfile } from '@/composables/useProfile'
import { useUnreadNotificationCount } from '@/composables/useNotification'

interface Props {
  menuOptions: MenuOption[]
  basePath: string
}

const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const logout = useLogout()
const { data: me } = useMeQuery()
const { profile } = useProfile()

const { data: unreadNotifData } = useUnreadNotificationCount()
const unreadNotifCount = computed(() => unreadNotifData.value?.data.unread_count || 0)

const defaultAvatarSeed = 'HumanResource'

const getThumbUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined
  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) return url
  const filename = url.substring(0, lastDotIndex)
  const extension = url.substring(lastDotIndex)
  return `${filename}_thumb${extension}`
}

const userInfo = computed(() => {
  const user = profile.value || me.value || authStore.user
  const role = user?.system_role_name
  const name = user?.name || 'Human Resource'
  const email = user?.email || 'human.resource@gigsource.com'
  const avatar =
    getThumbUrl(user?.profile_picture) ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || defaultAvatarSeed)}`

  return {
    name,
    email,
    avatar,
    role,
  }
})

function renderIcon(icon: Component) {
  return () => h(icon)
}

function renderLabelWithBadge(label: string, count: number) {
  return () => h('div', { class: 'flex items-center justify-between w-full' }, [
    h('span', null, label),
    count > 0 ? h(NBadge, { value: count, type: 'error' }) : null
  ])
}

const bottomMenuOptions = computed<MenuOption[]>(() => [
  {
    label: renderLabelWithBadge('Notifikasi', unreadNotifCount.value),
    key: 'notifications',
    icon: renderIcon(Bell),
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(Logout),
  },
])

const handleMenuSelect = (key: string) => {
  sidebarStore.setActiveKey(key)
  if (key === 'dashboard') {
    router.push(props.basePath)
  } else {
    router.push(`${props.basePath}/${key}`)
  }
}

const handleBottomMenuSelect = (key: string) => {
  if (key === 'notifications') {
    router.push(`${props.basePath}/notifications`)
  } else if (key === 'logout') {
    logout()
  }
}

const handleProfileClick = () => {
  router.push(`${props.basePath}/profile`)
}

// Update sidebar state when route changes
watch(
  () => route.path,
  (newPath) => {
    sidebarStore.setActiveFromRoute(newPath)
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col h-full bg-background-secondary border-r border-[#C7D0F3]">
    <!-- Logo Section -->
    <div class="flex flex-col items-center justify-center p-6 border-gray-200">
      <img src="../../assets/LogoGigSource.svg" alt="GigSource Logo" class="h-18" />
      <p class="text-sm mt-1 font-bold text-primary">{{ userInfo.role }}</p>
    </div>

    <!-- Main Menu -->
    <div class="flex-1 overflow-y-auto">
      <n-menu
        :value="sidebarStore.activeKey"
        :expanded-keys="sidebarStore.expandedKeys"
        :options="menuOptions"
        @update:value="handleMenuSelect"
        @update:expanded-keys="sidebarStore.setExpandedKeys"
        :root-indent="20"
      />
    </div>

    <!-- Bottom Section -->
    <div class="flex-col border-gray-200 space-y-3">
      <n-menu
        :options="bottomMenuOptions"
        @update:value="handleBottomMenuSelect"
        :root-indent="20"
      />

      <!-- Account Info (Clickable Profile Trigger) -->
      <div
        @click="handleProfileClick"
        class="px-4 pb-4 border-gray-200 cursor-pointer group transition-all duration-200"
      >
        <div class="p-2 rounded-xl group-hover:bg-[#F0F2FD] border border-transparent group-hover:border-[#C7D0F3] transition-all">
          <n-space align="center" :wrap="false">
            <n-avatar round :size="40" :src="userInfo.avatar" class="shadow-sm border border-gray-100" />
            <div class="flex-1 min-w-0 pb-1">
              <div class="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">
                {{ userInfo.name }}
              </div>
              <div class="text-xs text-gray-500 truncate">{{ userInfo.email }}</div>
            </div>
          </n-space>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles */
</style>

