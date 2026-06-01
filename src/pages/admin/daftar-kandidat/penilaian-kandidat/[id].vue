<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NAvatar, NSpin } from 'naive-ui'
import { Calendar } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateDetailHeader from '@/components/candidate-detail/CandidateDetailHeader.vue'
import { useUser } from '@/composables/useUser'
import { useCandidateOnboardingHistory } from '@/composables/useOnboarding'
import { useReviewDetail } from '@/composables/useReview'
import type { OnboardingItem, OnboardingSnapshot } from '@/models/Onboarding'
import type { ReviewFinalRecommendation } from '@/models/Review'

const route = useRoute()
const router = useRouter()

const reviewId = computed((): string => {
  const params = route.params as Record<string, string | string[]>
  const id = params.id
  if (Array.isArray(id)) return id[0] || ''
  return id || ''
})

const {
  review,
  isLoading: isReviewLoading,
  isError: isReviewError,
  error: reviewError,
} = useReviewDetail(reviewId)

const candidateUserId = computed((): string => {
  return review.value?.candidate_user_id || ''
})

const onboardHistoryId = computed((): string => {
  return review.value?.onboard_history_id || ''
})

const { user: candidateUser, isLoading: isUserLoading } = useUser(candidateUserId)

const { history: onboardingHistory, isLoading: isOnboardingLoading } =
  useCandidateOnboardingHistory(candidateUserId)

const onboardingItem = computed((): OnboardingItem | null => {
  if (!onboardingHistory.value || !onboardHistoryId.value) return null
  return onboardingHistory.value.find((item) => item.id === onboardHistoryId.value) || null
})

const parsedSnapshot = computed((): OnboardingSnapshot | null => {
  if (!onboardingItem.value?.snapshot) return null
  try {
    return JSON.parse(onboardingItem.value.snapshot) as OnboardingSnapshot
  } catch {
    return null
  }
})

const indicators = [
  {
    key: 'WORK_QUALITY',
    title: 'Kualitas Pekerjaan (Work Quality)',
    desc: 'Menilai kesesuaian hasil kerja kandidat dengan spesifikasi, kerapian struktur kode, tingkat bug, serta pemenuhan standar kualitas perusahaan.',
  },
  {
    key: 'TIMELINESS',
    title: 'Ketepatan Waktu (Timeliness)',
    desc: 'Menilai kedisiplinan kandidat dalam memenuhi deadline, kecepatan merespon revisi, serta manajemen waktu selama proyek berlangsung.',
  },
  {
    key: 'COMMUNICATION_COLLABORATION',
    title: 'Komunikasi & Kolaborasi (Communication & Collaboration)',
    desc: 'Menilai keaktifan, transparansi, serta kemampuan bekerja sama kandidat dengan anggota tim lainnya.',
  },
  {
    key: 'PROBLEM_SOLVING_INITIATIVE',
    title: 'Penyelesaian Masalah & Inisiatif (Problem Solving & Initiative)',
    desc: 'Menilai kemampuan mandiri kandidat dalam mengatasi hambatan, memberikan ide perbaikan, serta mencari solusi yang konstruktif.',
  },
]

const getAnswersByIndicator = (indicatorKey: string) => {
  if (!review.value?.answers) return []
  return review.value.answers
    .filter((a) => a.indicator === indicatorKey)
    .sort((a, b) => a.question_order - b.question_order)
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

const handleBack = (): void => {
  if (candidateUserId.value) {
    router.push(`/admin/daftar-kandidat/${candidateUserId.value}`)
  } else {
    router.back()
  }
}

const recommendationConfig: Record<
  ReviewFinalRecommendation,
  { label: string; className: string }
> = {
  HIGHLY_RECOMMENDED: {
    label: 'Sangat Direkomendasikan',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  RECOMMENDED: {
    label: 'Direkomendasikan',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CONSIDERED: {
    label: 'Dipertimbangkan',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  NOT_RECOMMENDED: {
    label: 'Tidak Direkomendasikan',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}
</script>

<template>
  <AdminLayout>
    <div class="mx-auto space-y-6 max-w-4xl">
      <CandidateDetailHeader title="Penilaian Kandidat" @back="handleBack" />

      <div
        v-if="isReviewLoading || isUserLoading || isOnboardingLoading"
        class="flex justify-center items-center py-20"
      >
        <n-spin size="large" />
      </div>

      <div
        v-else-if="isReviewError"
        class="text-center py-20 bg-white rounded-lg border border-gray-200 p-6"
      >
        <p class="text-red-500">
          {{ reviewError?.message || 'Gagal memuat detail penilaian' }}
        </p>
        <n-button type="primary" @click="handleBack" class="mt-4"> Kembali </n-button>
      </div>

      <div v-else-if="review" class="space-y-6">
        <n-card class="shadow-sm border border-slate-200">
          <div class="flex items-center gap-4">
            <n-avatar round :size="56" :src="candidateUser?.profile_picture || undefined" />
            <div class="flex-1">
              <h2 class="text-lg font-bold text-slate-800">
                {{ candidateUser?.name || 'Kandidat' }}
              </h2>
              <p class="text-sm font-semibold text-primary">
                {{ parsedSnapshot?.job_role_name || '-' }} -
                {{ parsedSnapshot?.project_name || '-' }}
              </p>
              <div class="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <n-icon :component="Calendar" size="14" />
                <span>
                  {{ formatDate(onboardingItem?.start_date) }} &rarr;
                  {{ formatDate(onboardingItem?.end_date) }}
                </span>
              </div>
            </div>
          </div>
        </n-card>

        <n-card
          v-for="indicator in indicators"
          :key="indicator.key"
          class="shadow-sm border border-slate-200"
        >
          <div class="space-y-4">
            <div>
              <h3 class="font-bold text-sm text-slate-800">{{ indicator.title }}</h3>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ indicator.desc }}</p>
            </div>

            <div class="divide-y divide-slate-100">
              <div
                v-for="ans in getAnswersByIndicator(indicator.key)"
                :key="ans.question_id"
                class="flex flex-col items-center justify-center text-center py-5 gap-3"
              >
                <p class="text-xs font-semibold text-slate-700 max-w-xl">
                  {{ ans.question_text }}
                </p>
                <div class="flex items-center gap-2">
                  <div
                    v-for="val in [1, 2, 3, 4, 5]"
                    :key="val"
                    class="flex items-center justify-center w-9 h-9 rounded-full border text-sm font-semibold transition-all"
                    :class="[
                      ans.score === val
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-400 border-slate-100',
                    ]"
                  >
                    {{ val }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <n-card class="shadow-sm border border-slate-200">
          <div class="space-y-4">
            <h3 class="font-bold text-sm text-slate-800">Rekomendasi Akhir & Catatan</h3>

            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-600 block">Rekomendasi Akhir</span>
              <div
                class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border"
                :class="recommendationConfig[review.final_recommendation].className"
              >
                {{ recommendationConfig[review.final_recommendation].label }}
              </div>
            </div>

            <div class="space-y-2 mt-4" v-if="review.notes">
              <span class="text-xs font-bold text-slate-600 block">Catatan Tambahan</span>
              <div
                class="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap"
              >
                {{ review.notes }}
              </div>
            </div>
          </div>
        </n-card>

        <div class="flex items-center justify-end gap-3 pt-4">
          <n-button type="primary" @click="handleBack"> Kembali ke Detail Kandidat </n-button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.05),
    0 1px 2px 0 rgba(0, 0, 0, 0.03);
}
</style>
