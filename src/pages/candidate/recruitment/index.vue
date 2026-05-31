<script setup lang="ts">
import { ref, computed } from 'vue'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { NEmpty, NIcon, NButton, NSpin, useMessage } from 'naive-ui'
import { Briefcase, Calendar } from '@vicons/tabler'
import { useAuthStore } from '@/stores/auth.store'
import { useActiveSubrequest } from '@/composables/useActiveSubrequest'
import { useCandidateOnboardingHistory } from '@/composables/useOnboarding'
import { declineRecruitmentApi } from '@/services/user.service'
import { useQueryClient } from '@tanstack/vue-query'
import ConfirmationModal from '@/components/shared/ConfirmationModal.vue'

defineOptions({
  name: 'CandidateRecruitmentPage',
})

const authStore = useAuthStore()
const queryClient = useQueryClient()
const message = useMessage()

const userId = computed(() => authStore.user?.id || '')
const activeTab = ref<'in-progress' | 'history'>('in-progress')
const isDeclining = ref(false)
const showDeclineModal = ref(false)

const { activeSubrequest, isPending: isLoadingActiveSR } = useActiveSubrequest(userId)
const { history, isPending: isLoadingHistory } = useCandidateOnboardingHistory(userId)

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '-'
  }
}

const handleDecline = () => {
  showDeclineModal.value = true
}

const confirmDecline = async () => {
  isDeclining.value = true
  try {
    await declineRecruitmentApi(userId.value)
    message.success('Recruitment process declined successfully')
    // Invalidate active-subrequest query to refresh status card
    queryClient.invalidateQueries({ queryKey: ['active-subrequest', userId.value] })
    // Invalidate profile query to update candidate header status
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    showDeclineModal.value = false
  } catch (err: any) {
    message.error(err.message || 'Failed to decline recruitment')
  } finally {
    isDeclining.value = false
  }
}
</script>

<template>
  <CandidateLayout>
    <!-- Header with Tabs -->
    <div class="px-8 pt-6 border-b border-gray-150">
      <h2 class="text-xl font-bold text-slate-800 mb-4">Recruitment</h2>
      <div class="flex gap-6">
        <button
          @click="activeTab = 'in-progress'"
          class="pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer focus:outline-none"
          :class="activeTab === 'in-progress' ? 'border-[#0014B2] text-[#0014B2]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          In Progress
        </button>
        <button
          @click="activeTab = 'history'"
          class="pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer focus:outline-none"
          :class="activeTab === 'history' ? 'border-[#0014B2] text-[#0014B2]' : 'border-transparent text-gray-400 hover:text-gray-600'"
        >
          On-Boarding History
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="p-8 flex-1 flex flex-col">
      <div v-if="activeTab === 'in-progress'" class="flex-1 flex flex-col">
        <!-- Loading State -->
        <div v-if="isLoadingActiveSR" class="flex-1 flex items-center justify-center min-h-[300px]">
          <n-spin size="large" />
        </div>

        <!-- Recruitment Details -->
        <div
          v-else-if="activeSubrequest"
          class="border-l-4 border-[#0014B2] bg-slate-50/50 p-6 rounded-r-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-slate-800">{{ activeSubrequest.job_role }}</h3>
            <p class="text-gray-500 text-sm">You are currently being considered for this role</p>
            <p class="text-gray-400 text-xs pt-3">
              Recruitment Started On : {{ formatDate(activeSubrequest.created_at) }}
            </p>
          </div>
          <n-button
            type="error"
            strong
            class="font-semibold rounded-lg px-6"
            @click="handleDecline"
            :loading="isDeclining"
          >
            Decline
          </n-button>
        </div>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center min-h-[300px]">
          <n-empty description="No recruitment process in progress">
            <template #icon>
              <n-icon size="48" class="text-gray-300">
                <Briefcase />
              </n-icon>
            </template>
          </n-empty>
        </div>
      </div>

      <div v-else-if="activeTab === 'history'" class="flex-1 flex flex-col">
        <!-- Loading State -->
        <div v-if="isLoadingHistory" class="flex-1 flex items-center justify-center min-h-[300px]">
          <n-spin size="large" />
        </div>

        <!-- History List -->
        <div v-else-if="history && history.length > 0" class="space-y-4">
          <div
            v-for="item in history"
            :key="item.id"
            class="bg-slate-50/50 border border-gray-100 hover:border-gray-200 transition-all p-5 rounded-2xl flex flex-col gap-2"
          >
            <h3 class="text-base font-bold text-slate-800">{{ item.job_role_name || '-' }}</h3>
            <div class="flex items-center gap-2 text-gray-500 text-sm">
              <n-icon :component="Calendar" size="16" class="text-gray-400" />
              <span>{{ formatDate(item.start_date) }} &rarr; {{ formatDate(item.end_date) }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center min-h-[300px]">
          <n-empty description="No onboarding history yet">
            <template #icon>
              <n-icon size="48" class="text-gray-300">
                <Calendar />
              </n-icon>
            </template>
          </n-empty>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-model:show="showDeclineModal"
      title="Confirm Recruitment Decline"
      message="Your status will be updated once confirmed by the admin. You can still access the chat feature while this process is ongoing."
      confirm-text="Decline Recruitment"
      cancel-text="Close"
      type="danger"
      :loading="isDeclining"
      @confirm="confirmDecline"
    />
  </CandidateLayout>
</template>
