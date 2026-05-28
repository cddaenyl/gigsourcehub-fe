<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard, NIcon, NSpin, NSpace } from 'naive-ui'
import { ArrowRight, Calendar, Eye } from '@vicons/tabler'
import { useCandidateOnboardingHistory } from '@/composables/useOnboarding'
import type { OnboardingSnapshot } from '@/models/Onboarding'

const props = defineProps<{
  userId: string
}>()

const { history, isLoading, isError, error } = useCandidateOnboardingHistory(
  computed(() => props.userId),
)

const parseSnapshot = (value: string | null | undefined): OnboardingSnapshot | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as OnboardingSnapshot
  } catch {
    return null
  }
}

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const historyItems = computed(() =>
  history.value.map((item) => ({
    ...item,
    parsedSnapshot: parseSnapshot(item.snapshot),
  })),
)
</script>

<template>
  <n-space vertical :size="8">
    <n-space vertical :size="2">
      <h4 class="font-bold text-sm text-gray-500">On Boarding History</h4>
      <p class="text-xs text-gray-400">History on boarding kandidat</p>
    </n-space>
    <n-card v-if="isLoading" class="onboarding-card">
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <n-spin size="small" />
        Memuat riwayat onboarding...
      </div>
    </n-card>
    <n-card v-else-if="isError" class="onboarding-card">
      <p class="text-xs text-red-500">{{ error?.message || 'Gagal memuat riwayat onboarding.' }}</p>
    </n-card>
    <n-card v-else-if="historyItems.length === 0" class="onboarding-card">
      <h4 class="font-bold text-xs text-gray-500">Belum ada riwayat onboarding</h4>
    </n-card>
    <template v-else>
      <n-card v-for="item in historyItems" :key="item.id" class="onboarding-card">
        <div
          class="flex items-center justify-between gap-4 bg-gray-50 border-l-2 border-l-primary px-3 py-2"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-semibold text-slate-800">
              {{ item.parsedSnapshot?.job_role_name || 'Posisi belum tersedia' }}
            </h3>
            <p class="text-sm text-primary">
              {{ item.parsedSnapshot?.project_name || 'Proyek belum tersedia' }}
            </p>
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <n-icon :component="Calendar" size="14" />
              <span class="flex items-center gap-1">
                {{ formatDate(item.start_date) }} <n-icon :component="ArrowRight" size="14" />
                {{ formatDate(item.end_date) }}
              </span>
            </div>
          </div>
          <div>
            <n-button secondary size="small" class="onboarding-action">
              <template #icon>
                <n-icon :component="Eye" />
              </template>
              Lihat Penilaian
            </n-button>
          </div>
        </div>
      </n-card>
    </template>
  </n-space>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.onboarding-action {
  align-self: flex-start;
}
</style>
