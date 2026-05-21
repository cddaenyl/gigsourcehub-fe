<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import InterviewStageTable from '@/components/tables/InterviewStageTable.vue'
import { useInterviewStages } from '@/composables/useInterviewStages'
import { updateInterviewStageApi } from '@/services/interview-stage.service'
import type { InterviewStage } from '@/models/InterviewStage'

const router = useRouter()
const message = useMessage()

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value,
}))

const { interviewStages, pageCount, isLoading, refetch } = useInterviewStages(queryParams)

const handleSearch = (val: string) => {
  searchQuery.value = val
  currentPage.value = 1
}

const handleAdd = () => {
  router.push('/superadmin/interview-stages/create')
}

const handleAction = async (action: string, stage: InterviewStage) => {
  if (action === 'edit') {
    router.push(`/superadmin/interview-stages/edit/${stage.id}`)
  } else if (action === 'toggle-status') {
    const newStatus = !stage.is_active
    const confirmMsg = newStatus
      ? `Apakah Anda yakin ingin mengaktifkan tahap interview ${stage.name}?`
      : `Apakah Anda yakin ingin menonaktifkan tahap interview ${stage.name}?`

    if (confirm(confirmMsg)) {
      try {
        await updateInterviewStageApi(stage.id, {
          name: stage.name,
          hex_code: stage.hex_code,
          is_active: newStatus,
        })
        message.success(`Tahap interview berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        refetch()
      } catch (err: any) {
        message.error(err.message || 'Gagal mengubah status tahap interview')
      }
    }
  }
}
</script>

<template>
  <MasterDataIndexLayout
    title="Master Data Tahap Interview"
    add-button-text="Tambah Tahap Interview"
    v-model:search-query="searchQuery"
    @search="handleSearch"
    @add="handleAdd"
  >
    <template #table>
      <InterviewStageTable :data="interviewStages" :loading="isLoading" @action="handleAction" />

      <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-500">Loading...</p>
      </div>
    </template>

    <template #pagination>
      <CandidatePagination
        v-model:page="currentPage"
        v-model:page-size="pageSize"
        :page-count="pageCount"
      />
    </template>
  </MasterDataIndexLayout>
</template>
