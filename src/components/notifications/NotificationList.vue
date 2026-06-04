<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NIcon, NEmpty, NPagination, NSpin } from 'naive-ui'
import { Bell, Check } from '@vicons/tabler'
import {
  useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/composables/useNotification'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale' // Use Indonesian locale for date by default, can conditionally switch

const props = withDefaults(
  defineProps<{
    isCandidate?: boolean
    title?: string
  }>(),
  {
    isCandidate: false,
    title: 'Notifikasi',
  },
)

const page = ref(1)
const limit = ref(10)
const queryParams = computed(() => ({
  page: page.value,
  limit: limit.value,
}))

const { data: notificationsData, isLoading } = useNotificationsQuery(queryParams)
const { mutate: markAsRead } = useMarkNotificationAsRead()
const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead()

const handleMarkAllRead = () => {
  markAllAsRead()
}

const handleMarkAsRead = (itemId: string, isRead: boolean) => {
  if (!isRead) {
    markAsRead(itemId)
  }
}

const formatTime = (dateString: string) => {
  try {
    const localeToUse = props.isCandidate ? undefined : id
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: localeToUse })
  } catch (e) {
    return dateString
  }
}
</script>

<template>
  <div class="w-full flex flex-col relative" :class="isCandidate ? 'h-full' : 'bg-[#f8fafc] h-full'">
    <!-- Header -->
    <div
      class="flex shrink-0 items-center justify-between"
      :class="isCandidate ? 'mb-4' : 'h-24 px-6 py-4 w-full max-w-[1200px] mx-auto'"
    >
      <div v-if="!isCandidate" class="flex flex-col gap-2">
        <h1 class="text-xl font-semibold text-slate-700">{{ title }}</h1>
      </div>
      <div v-else class="flex w-full">
        <h1 class="text-xl font-semibold text-[#061b7e]">{{ title }}</h1>
      </div>

      <div v-if="!isCandidate" class="flex gap-2 items-center">
        <n-button @click="handleMarkAllRead" :loading="isMarkingAll" type="primary" color="#07229e">
          <template #icon>
            <n-icon><Check /></n-icon>
          </template>
          Tandai sudah dibaca semua
        </n-button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto rounded-md flex flex-col pb-6" :class="isCandidate ? '' : 'px-6 max-w-[1200px] mx-auto w-full'">
      <div v-if="isLoading" class="flex justify-center items-center h-40">
        <n-spin size="large" />
      </div>

      <div v-else-if="!notificationsData?.data?.list?.length" class="flex justify-center items-center h-64 bg-white border border-gray-200 rounded-md">
        <n-empty :description="isCandidate ? 'No notifications yet' : 'Belum ada notifikasi saat ini'">
          <template #icon>
            <n-icon class="text-slate-300"><Bell /></n-icon>
          </template>
        </n-empty>
      </div>

      <div v-else class="flex flex-col rounded-md overflow-hidden bg-white border border-gray-200">
        <div
          v-for="item in notificationsData.data.list"
          :key="item.id"
          class="flex gap-3 items-start p-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
          :class="item.is_read ? 'bg-white' : 'bg-slate-100'"
          @click="handleMarkAsRead(item.id, item.is_read)"
        >
          <div class="bg-[#07229e] flex items-center p-1.5 rounded shrink-0 mt-0.5">
            <n-icon size="18" class="text-white">
              <Bell />
            </n-icon>
          </div>
          
          <div class="flex flex-col flex-1 min-w-0 pr-4">
            <p class="font-semibold text-sm text-slate-800 truncate">
              {{ item.title }}
            </p>
            <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-snug">
              {{ item.description }}
            </p>
          </div>
          
          <div class="flex flex-col items-end shrink-0 whitespace-nowrap">
            <p class="text-xs text-slate-500">{{ formatTime(item.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="notificationsData?.data?.total && notificationsData.data.total > limit" class="flex justify-center mt-6">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(notificationsData.data.total / limit)"
        />
      </div>
    </div>
  </div>
</template>
