<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import RecruitmentStatusTable from '@/components/tables/RecruitmentStatusTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import ConfirmationModal from '@/components/shared/ConfirmationModal.vue'
import { useRecruitmentStatuses } from '@/composables/useRecruitmentStatuses'
import { updateRecruitmentStatusApi } from '@/services/recruitment-status.service'
import type { RecruitmentStatus } from '@/models/RecruitmentStatus'

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

const { recruitmentStatuses, pageCount, isLoading, refetch } = useRecruitmentStatuses(queryParams)

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
  router.push('/superadmin/status-rekrutmen/create')
}

const handleAction = async (action: string, status: RecruitmentStatus) => {
  if (action === 'edit') {
    router.push(`/superadmin/status-rekrutmen/edit/${status.id}`)
  } else if (action === 'toggle-status') {
    const newStatus = !status.is_active
    const title = newStatus ? 'Aktifkan Status Rekrutmen' : 'Nonaktifkan Status Rekrutmen'
    const actionText = newStatus ? 'Aktifkan' : 'Nonaktifkan'
    const msg = newStatus 
      ? `Apakah Anda yakin ingin mengaktifkan status ${status.name}?`
      : `Status rekrutmen yang dinonaktifkan tidak dapat dipilih dalam proses penambahan atau pengelolaan data baru. Data yang sudah terhubung tetap tersimpan di sistem.`
      
    triggerConfirm(
      title,
      msg,
      actionText,
      newStatus ? 'success' : 'danger',
      async () => {
        try {
          await updateRecruitmentStatusApi(status.id, {
            name: status.name,
            hex_code: status.hex_code,
            is_active: newStatus
          })
          message.success(`Status berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
          refetch()
        } catch (err: any) {
          message.error(err.message || 'Gagal mengubah status')
        }
      }
    )
  }
}
</script>

<template>
  <MasterDataIndexLayout
    title="Master Data Status Rekrutmen"
    add-button-text="Tambah Status"
    v-model:search-query="searchQuery"
    @search="handleSearch"
    @add="handleAdd"
  >
    <template #table>
      <RecruitmentStatusTable 
        :data="recruitmentStatuses" 
        :loading="isLoading" 
        @action="handleAction" 
      />
      
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

  <ConfirmationModal
    v-model:show="isConfirmShow"
    :title="confirmTitle"
    :message="confirmMessage"
    :confirm-text="confirmText"
    :type="confirmType"
    :loading="confirmLoading"
    @confirm="handleConfirm"
  />
</template>
