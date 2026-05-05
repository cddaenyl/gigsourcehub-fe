<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateDetailHeader from '@/components/candidate-detail/CandidateDetailHeader.vue'
import CandidateProfileCard from '@/components/candidate-detail/CandidateProfileCard.vue'
import CandidateInfoCard from '@/components/candidate-detail/CandidateInfoCard.vue'
import CandidateRecruitmentPanel from '@/components/candidate-detail/CandidateRecruitmentPanel.vue'
import CandidateOnboardingHistory from '@/components/candidate-detail/CandidateOnboardingHistory.vue'
import { NButton, NSpin, NGrid, NGi } from 'naive-ui'
import { useRecruitmentStatuses } from '@/composables/useRecruitmentStatuses'
const route = useRoute()
const router = useRouter()

const userId = computed((): string => {
  const params = route.params as Record<string, string | string[]>
  const id = params['id']
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const levelOptions = [
  {
    label: 'Junior',
    value: 'Junior',
  },
  {
    label: 'Middle',
    value: 'Middle',
  },
  {
    label: 'Senior',
    value: 'Senior',
  },
  {
    label: 'In-Eligible',
    value: 'In-Eligible',
  },
]

const { recruitmentStatuses } = useRecruitmentStatuses()
const recruitmentOptions = computed(() =>
  recruitmentStatuses.value
    .filter((status) => status.is_active)
    .map((status) => ({
      label: status.name,
      value: status.id,
    })),
)

// Fetch user data
const { user, isLoading, isError, error } = useUser(userId)

// Handlers
const handleBack = () => {
  router.push('/admin/daftar-kandidat')
}

const handleRecruit = () => {
  console.log('Recruit candidate:', user.value)
  // TODO: Implement recruit logic
}

const handleChat = () => {
  console.log('Chat with candidate:', user.value)
  // TODO: Implement chat logic
}
</script>

<template>
  <AdminLayout>
    <div class="mx-auto space-y-6">
      <CandidateDetailHeader @back="handleBack" />

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="text-center py-20">
        <p class="text-red-500">{{ error?.message || 'Failed to load candidate data' }}</p>
        <n-button type="primary" @click="handleBack" class="mt-4">
          Kembali ke Daftar Kandidat
        </n-button>
      </div>

      <!-- Content -->
      <div v-else-if="user" class="space-y-6">
        <CandidateProfileCard :user="user" @chat="handleChat" @recruit="handleRecruit" />

        <n-grid :x-gap="8" :cols="2" item-responsive>
          <n-gi>
            <CandidateInfoCard :user="user" />
          </n-gi>

          <n-gi>
            <CandidateRecruitmentPanel
              :level-options="levelOptions"
              :recruitment-options="recruitmentOptions"
            />
          </n-gi>
        </n-grid>
        <CandidateOnboardingHistory />
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
