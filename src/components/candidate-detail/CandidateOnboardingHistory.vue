<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NSpin, NSpace } from 'naive-ui'
import { ArrowRight, Calendar, Eye, Plus } from '@vicons/tabler'
import { useCandidateOnboardingHistory } from '@/composables/useOnboarding'
import type { OnboardingSnapshot, OnboardingItem } from '@/models/Onboarding'

const props = defineProps<{
  userId: string
  reviewDetailBasePath?: string
  allowCreateReview?: boolean
  disableActionBeforeEndDate?: boolean
}>()

const { history, isLoading, isError, error } = useCandidateOnboardingHistory(
  computed(() => props.userId),
)

const reviewDetailBasePath = computed(
  () => props.reviewDetailBasePath || '/employee/candidate-list/penilaian-kandidat',
)
const allowCreateReview = computed(() => props.allowCreateReview !== false)

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

const router = useRouter()

const getReviewId = (item: OnboardingItem): string | null => {
  return item.review_id || item.review?.id || null
}

const isOnboardingFinished = (item: OnboardingItem): boolean => {
  const endDate = new Date(item.end_date)
  if (Number.isNaN(endDate.getTime())) return true
  return endDate.getTime() <= Date.now()
}

const shouldShowActionButton = (item: OnboardingItem): boolean => {
  return Boolean(getReviewId(item)) || allowCreateReview.value
}

const isActionDisabled = (item: OnboardingItem): boolean => {
  return Boolean(props.disableActionBeforeEndDate && !isOnboardingFinished(item))
}

const handleOnboardingAction = (item: OnboardingItem) => {
  if (isActionDisabled(item)) return

  const reviewId = getReviewId(item)
  if (reviewId) {
    router.push(`${reviewDetailBasePath.value}/${reviewId}`)
  } else if (allowCreateReview.value) {
    router.push({
      path: `/employee/candidate-list/penilaian-kandidat/tambah/${item.id}`,
      query: { candidate_id: props.userId },
    })
  } else {
    return
  }
}
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
          <div v-if="shouldShowActionButton(item)">
            <n-button
              secondary
              size="small"
              class="onboarding-action"
              :disabled="isActionDisabled(item)"
              @click="handleOnboardingAction(item)"
            >
              <template #icon>
                <n-icon :component="getReviewId(item) ? Eye : Plus" />
              </template>
              {{ getReviewId(item) ? 'Lihat Penilaian' : 'Tambah Penilaian' }}
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
