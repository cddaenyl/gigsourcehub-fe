<script setup lang="ts">
import { ref, h } from 'vue'
import type { Component } from 'vue'
import { NMenu, NAvatar, NSpace } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { useRouter } from 'vue-router'
import {
  Users,
  Bell,
  Logout,
  Layout2,
  LayoutBoard,
  Note,
} from '@vicons/tabler'

const router = useRouter()

const userInfo = ref({
  name: 'John Doe',
  email: 'john.doe@gigsource.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
})

function renderIcon(icon: Component) {
  return () => h(icon)
}

const menuOptions: MenuOption[] = [
  {
    label: 'Dashboard',
    key: 'dashboard',
    icon: renderIcon(Layout2)
  },
  {
    label: 'Kandidat',
    key: 'kandidat',
    icon: renderIcon(Users),
    children: [
      {
        label: 'Daftar Kandidat',
        key: 'daftar-kandidat',
      },
      {
        label: 'Jadwal Interview',
        key: 'jadwal-interview'
      },
      {
        label: 'Chat',
        key: 'kandidat-chat'
      }
    ]
  },
  {
    label: 'CMS',
    key: 'cms',
    icon: renderIcon(LayoutBoard)
  },
  {
    label: 'Kebutuhan Talenta',
    key: 'talent-needs',
    icon: renderIcon(Note)
  }
]

const bottomMenuOptions: MenuOption[] = [
  {
    label: 'Notifikasi',
    key: 'notifications',
    icon: renderIcon(Bell)
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(Logout)
  }
]

const handleMenuSelect = (key: string) => {
  router.push(`/admin/${key}`)
}

const handleBottomMenuSelect = (key: string) => {
  if (key === 'notifications') {
    console.log('Open notifications')
    // Add notification logic here
  } else if (key === 'logout') {
    console.log('Logout')
    // Add logout logic here
    // router.push('/login')
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-background-secondary border-r border-[#C7D0F3]">
    <!-- Logo Section -->
    <div class="flex items-center justify-center p-6  border-gray-200">
      <img src="../assets/LogoGigSource.svg" alt="GigSource Logo" class="h-18" />
    </div>

    <!-- Main Menu -->
    <div class="flex-1 overflow-y-auto">
      <n-menu
        :options="menuOptions"
        @update:value="handleMenuSelect"
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
      <div class="px-4 pb-4  border-gray-200 ">
        <n-space align="center" >
          <n-avatar
            round
            :size="40"
            :src="userInfo.avatar"

          />
          <div class="flex-1 min-w-0 pb-1">
            <div class="text-sm font-medium text-gray-900 truncate">
              Human Resource
            </div>
            <div class="text-xs text-gray-500 truncate">
              choiyeonjun@gmail.com
            </div>
          </div>
        </n-space>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
