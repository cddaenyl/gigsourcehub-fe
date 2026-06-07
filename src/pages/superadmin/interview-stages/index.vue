<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import InterviewStageTable from '@/components/tables/InterviewStageTable.vue'
import ConfirmationModal from '@/components/shared/ConfirmationModal.vue'
import { useInterviewStages } from '@/composables/useInterviewStages'
import { updateInterviewStageApi, deleteInterviewStageApi } from '@/services/interview-stage.service'
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

// Confirmation modal state
const isConfirmShow = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmText = ref('')
const confirmType = ref<'danger' | 'warning' | 'info' | 'success'>('danger')
const confirmLoading = ref(false)
const onConfirm = ref<(() => Promise<void>) | null>(null)

const triggerConfirm = (
  title: string,
  messageText: string,
  actionText: string,
  type: 'danger' | 'warning' | 'info' | 'success',
  callback: () => Promise<void>
) => {
  confirmTitle.value = title
  confirmMessage.value = messageText
  confirmText.value = actionText
  confirmType.value = type
  onConfirm.value = callback
  isConfirmShow.value = true
}

const handleConfirm = async () => {
  if (onConfirm.value) {
    confirmLoading.value = true
    try {
      await onConfirm.value()
      isConfirmShow.value = false
    } finally {
      confirmLoading.value = false
    }
  }
}

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
    const title = newStatus ? 'Aktifkan Jenis Interview' : 'Nonaktifkan Jenis Interview'
    const actionText = newStatus ? 'Aktifkan' : 'Nonaktifkan'
    const msg = newStatus
      ? `Apakah Anda yakin ingin mengaktifkan Jenis Interview ${stage.name}?`
      : `Jenis Interview yang dinonaktifkan tidak dapat dipilih dalam proses penambahan atau pengelolaan data baru. Data yang sudah terhubung tetap tersimpan di sistem.`

    triggerConfirm(
      title,
      msg,
      actionText,
      newStatus ? 'success' : 'danger',
      async () => {
        try {
          await updateInterviewStageApi(stage.id, {
            name: stage.name,
            hex_code: stage.hex_code,
            is_active: newStatus,
          })
          message.success(`Jenis Interview berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
          refetch()
        } catch (err: any) {
          message.error(err.message || 'Gagal mengubah status Jenis Interview')
        }
      }
    )
  } else if (action === 'delete') {
    triggerConfirm(
      'Hapus Jenis Interview',
      `Jenis Interview ${stage.name} yang dihapus tidak dapat dipulihkan kembali. Data yang sudah terhubung tetap tersimpan di sistem.`,
      'Hapus',
      'danger',
      async () => {
        try {
          await deleteInterviewStageApi(stage.id)
          message.success('Jenis Interview berhasil dihapus')
          refetch()
        } catch (err: any) {
          message.error(err.message || 'Gagal menghapus Jenis Interview')
        }
      }
    )
  }
}
</script>

<template>
  <MasterDataIndexLayout title="Master Data Jenis Interview" add-button-text="Tambah Jenis Interview"
    v-model:search-query="searchQuery" @search="handleSearch" @add="handleAdd">
    <template #table>
      <InterviewStageTable :data="interviewStages" :loading="isLoading" @action="handleAction" />

      <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-500">Loading...</p>
      </div>
    </template>

    <template #pagination>
      <CandidatePagination v-model:page="currentPage" v-model:page-size="pageSize" :page-count="pageCount" />
    </template>
  </MasterDataIndexLayout>

  <ConfirmationModal v-model:show="isConfirmShow" :title="confirmTitle" :message="confirmMessage"
    :confirm-text="confirmText" :type="confirmType" :loading="confirmLoading" @confirm="handleConfirm" />
</template>
