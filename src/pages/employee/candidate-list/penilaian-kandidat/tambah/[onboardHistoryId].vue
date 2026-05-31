<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NIcon,
  NAvatar,
  NSpin,
  NRadioGroup,
  NRadioButton,
  NInput,
  useMessage,
} from 'naive-ui'
import { Calendar, CirclePlus } from '@vicons/tabler'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import CandidateDetailHeader from '@/components/candidate-detail/CandidateDetailHeader.vue'
import { useUser } from '@/composables/useUser'
import { useCandidateOnboardingHistory } from '@/composables/useOnboarding'
import { useReviewQuestions, useCreateReview } from '@/composables/useReview'
import type { OnboardingItem, OnboardingSnapshot } from '@/models/Onboarding'
import type { ReviewFinalRecommendation } from '@/models/Review'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const onboardHistoryId = computed((): string => {
  const params = route.params as Record<string, string | string[]>
  const id = params.onboardHistoryId
  if (Array.isArray(id)) return id[0] || ''
  return id || ''
})

const candidateUserId = computed((): string => {
  const id = route.query.candidate_id
  if (Array.isArray(id)) return id[0] || ''
  return id || ''
})

// Fetch Candidate details
const {
  user: candidateUser,
  isLoading: isUserLoading,
  isError: isUserError,
  error: userError,
} = useUser(candidateUserId)

// Fetch Candidate onboarding history list to find this specific history item
const { history: onboardingHistory, isLoading: isOnboardingLoading } =
  useCandidateOnboardingHistory(candidateUserId)

const onboardingItem = computed((): OnboardingItem | null => {
  if (!onboardingHistory.value) return null
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

// Fetch Questions
const {
  questions,
  isLoading: isQuestionsLoading,
  isError: isQuestionsError,
  error: questionsError,
} = useReviewQuestions()

// Submitting state
const createReviewMutation = useCreateReview()
const isSubmitting = computed(() => createReviewMutation.isPending.value)

// Form State
const scores = ref<Record<string, number>>({})
const finalRecommendation = ref<ReviewFinalRecommendation>('RECOMMENDED')
const notes = ref('')

const finalRecommendationOptions: Array<{ value: ReviewFinalRecommendation; label: string }> = [
  { value: 'HIGHLY_RECOMMENDED', label: 'Sangat Direkomendasikan' },
  { value: 'RECOMMENDED', label: 'Direkomendasikan' },
  { value: 'CONSIDERED', label: 'Dipertimbangkan' },
  { value: 'NOT_RECOMMENDED', label: 'Tidak Direkomendasikan' },
]

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

const getQuestionsByIndicator = (indicatorKey: string) => {
  return questions.value
    .filter((q) => q.indicator === indicatorKey)
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
  router.push(`/employee/candidate-list/${candidateUserId.value}`)
}

const validateForm = (): boolean => {
  for (const indicator of indicators) {
    const list = getQuestionsByIndicator(indicator.key)
    for (const q of list) {
      if (!scores.value[q.id]) {
        message.warning(
          `Mohon berikan nilai untuk semua pertanyaan pada bagian "${indicator.title}"`,
        )
        return false
      }
    }
  }
  if (!finalRecommendation.value) {
    message.warning('Mohon pilih rekomendasi akhir untuk kandidat.')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const payload = {
    onboard_history_id: onboardHistoryId.value,
    final_recommendation: finalRecommendation.value,
    notes: notes.value,
    work_quality: getQuestionsByIndicator('WORK_QUALITY').map((q) => scores.value[q.id]!),
    timeliness: getQuestionsByIndicator('TIMELINESS').map((q) => scores.value[q.id]!),
    communication_collaboration: getQuestionsByIndicator('COMMUNICATION_COLLABORATION').map(
      (q) => scores.value[q.id]!,
    ),
    problem_solving_initiative: getQuestionsByIndicator('PROBLEM_SOLVING_INITIATIVE').map(
      (q) => scores.value[q.id]!,
    ),
  }

  try {
    await createReviewMutation.mutateAsync(payload)
    message.success('Penilaian berhasil disimpan!')
    router.push(`/employee/candidate-list/${candidateUserId.value}`)
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Gagal menyimpan penilaian.')
  }
}
</script>

<template>
  <EmployeeLayout>
    <div class="mx-auto space-y-6 max-w-4xl">
      <!-- Header -->
      <CandidateDetailHeader title="Penilaian Kandidat" @back="handleBack" />

      <!-- Loading State -->
      <div
        v-if="isUserLoading || isOnboardingLoading || isQuestionsLoading"
        class="flex justify-center items-center py-20"
      >
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="isUserError || isQuestionsError"
        class="text-center py-20 bg-white rounded-lg border border-gray-200 p-6"
      >
        <p class="text-red-500">
          {{ userError?.message || questionsError?.message || 'Gagal memuat data' }}
        </p>
        <n-button type="primary" @click="handleBack" class="mt-4">
          Kembali ke Detail Kandidat
        </n-button>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Candidate Profile Header Card -->
        <n-card class="shadow-sm border border-slate-200">
          <div class="flex items-center gap-4">
            <n-avatar round :size="56" :src="candidateUser?.profile_picture || undefined" />
            <div class="flex-1">
              <h2 class="text-lg font-bold text-slate-800">{{ candidateUser?.name }}</h2>
              <p class="text-sm font-semibold text-primary">
                {{ parsedSnapshot?.job_role_name || '-' }} –
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

        <!-- Guide Card -->
        <n-card class="shadow-sm border border-slate-200">
          <div class="space-y-3">
            <h3 class="font-bold text-sm text-slate-700">Panduan Penilaian</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Berikan penilaian berdasarkan pengalaman Anda selama bekerja dengan kandidat pada
              proyek ini. Gunakan skala berikut untuk menilai setiap pernyataan.
            </p>
            <div
              class="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center gap-3"
            >
              <p class="text-xs font-semibold text-slate-700">
                Apakah hasil pekerjaan kandidat sudah sesuai dengan requirement dan spesifikasi yang
                diberikan?
              </p>
              <div class="flex items-center gap-2">
                <div
                  v-for="val in [1, 2, 3, 4, 5]"
                  :key="val"
                  class="flex items-center justify-center w-9 h-9 rounded-full border text-xs font-bold transition-all"
                  :class="[
                    val === 3
                      ? 'bg-primary text-white border-primary'
                      : 'bg-slate-100 text-slate-500 border-slate-200',
                  ]"
                >
                  {{ val }}
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Questionnaire Indicators Cards -->
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

            <!-- List of questions for this indicator -->
            <div class="divide-y divide-slate-100">
              <div
                v-for="q in getQuestionsByIndicator(indicator.key)"
                :key="q.id"
                class="flex flex-col items-center justify-center text-center py-5 gap-3"
              >
                <p class="text-xs font-semibold text-slate-700 max-w-xl">
                  {{ q.question_text }}
                </p>
                <div class="flex items-center gap-2">
                  <button
                    v-for="val in [1, 2, 3, 4, 5]"
                    :key="val"
                    type="button"
                    @click="scores[q.id] = val"
                    class="flex items-center justify-center w-9 h-9 rounded-full border text-sm font-semibold transition-all duration-200 cursor-pointer"
                    :class="[
                      scores[q.id] === val
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300',
                    ]"
                  >
                    {{ val }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Final Recommendation & Notes -->
        <n-card class="shadow-sm border border-slate-200">
          <div class="space-y-4">
            <h3 class="font-bold text-sm text-slate-800">Rekomendasi Akhir & Catatan</h3>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-600 block">Rekomendasi Akhir</label>
              <n-radio-group v-model:value="finalRecommendation" name="finalRecommendation">
                <div class="flex gap-4">
                  <n-radio-button
                    v-for="option in finalRecommendationOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </n-radio-button>
                </div>
              </n-radio-group>
            </div>

            <div class="space-y-2 mt-4">
              <label class="text-xs font-bold text-slate-600 block">Catatan Tambahan</label>
              <n-input
                v-model:value="notes"
                type="textarea"
                placeholder="Berikan catatan tambahan mengenai performa kandidat selama onboarding..."
                :rows="4"
              />
            </div>
          </div>
        </n-card>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4">
          <n-button :disabled="isSubmitting" @click="handleBack"> Batal </n-button>
          <n-button type="primary" :loading="isSubmitting" @click="handleSubmit">
            <template #icon>
              <n-icon :component="CirclePlus" />
            </template>
            Simpan Penilaian
          </n-button>
        </div>
      </div>
    </div>
  </EmployeeLayout>
</template>

<style scoped>
.n-card {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.05),
    0 1px 2px 0 rgba(0, 0, 0, 0.03);
}
</style>
