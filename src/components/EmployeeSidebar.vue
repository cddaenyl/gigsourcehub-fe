<script setup lang="ts">
import { ref, h, watch, onMounted } from 'vue'
import type { Component } from 'vue'
import { NMenu, NAvatar, NSpace } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { Users, Bell, Logout, Note, Circles } from '@vicons/tabler'
import { useLogout } from '@/composables/useAuth'
const router = useRouter()
const route = useRoute()
const sidebarStore = useSidebarStore()
const logout = useLogout()

const userInfo = ref({
  name: 'John Doe',
  email: 'john.doe@gigsource.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
})

function renderIcon(icon: Component) {
  return () => h(icon)
}

const menuOptions: MenuOption[] = [
  {
    label: 'Kebutuhan Talenta',
    key: 'talent-needs',
    icon: renderIcon(Note),
  },
  {
    label: 'Daftar Kandidat',
    key: 'candidate-list',
    icon: renderIcon(Users),
  },
  {
    label: 'Tim Saya',
    key: 'my-team',
    icon: renderIcon(Circles),
  },
]

const bottomMenuOptions: MenuOption[] = [
  {
    label: 'Notifikasi',
    key: 'notifications',
    icon: renderIcon(Bell),
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(Logout),
  },
]

const handleMenuSelect = (key: string) => {
  sidebarStore.setActiveKey(key)
  router.push(`/employee/${key}`)
}

const handleBottomMenuSelect = (key: string) => {
  if (key === 'notifications') {
    console.log('Open notifications')
    // Add notification logic here
  } else if (key === 'logout') {
    logout()
  }
}

// Update sidebar state when route changes
watch(
  () => route.path,
  (newPath) => {
    sidebarStore.setActiveFromRoute(newPath)
  },
  { immediate: true },
)

// Initialize sidebar state on mount
onMounted(() => {
  sidebarStore.setActiveFromRoute(route.path)
})
</script>

<template>
  <div class="flex flex-col h-full bg-background-secondary border-r border-[#C7D0F3]">
    <!-- Logo Section -->
    <div class="flex items-center justify-center p-6 border-gray-200">
      <img src="../assets/LogoGigSource.svg" alt="GigSource Logo" class="h-18" />
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

      <!-- Account Info -->
      <div class="px-4 pb-4 border-gray-200">
        <n-space align="center">
          <n-avatar round :size="40" :src="userInfo.avatar" />
          <div class="flex-1 min-w-0 pb-1">
            <div class="text-sm font-medium text-gray-900 truncate">Human Resource</div>
            <div class="text-xs text-gray-500 truncate">choiyeonjun@gmail.com</div>
          </div>
        </n-space>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
