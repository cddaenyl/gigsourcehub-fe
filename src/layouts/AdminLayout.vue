<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import AdminSidebar from '../components/AdminSidebar.vue'

defineProps<{
  noPadding?: boolean
}>()

// You can customize Naive UI theme here
const themeOverrides = {
  common: {
    primaryColor: '#07229E',
    primaryColorHover: '#334155',
    primaryColorPressed: '#07229E',
  },
  Menu: {
    itemTextColor: '#334155',
    itemTextColorHover: '#07229E',
    itemTextColorActive: '#07229E',
    itemTextColorChildActive: '#07229E',
    itemTextColorActiveHover: '#07229E',
    itemIconColor: '#64748B',
    itemIconColorHover: '#07229E',
    itemIconColorActive: '#07229E',
    itemIconColorActiveHover: '#07229E',
    itemIconColorChildActive: '#07229E',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div class="flex h-screen w-screen overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 shrink-0">
        <AdminSidebar />
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 bg-gray-50 flex flex-col min-w-0 min-h-0" :class="noPadding ? 'overflow-hidden' : 'overflow-auto'">
        <div :class="noPadding ? 'flex-1 flex flex-col min-h-0' : 'container mx-auto p-6'">
          <slot />
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<style scoped>
/* Additional layout styles if needed */
</style>
