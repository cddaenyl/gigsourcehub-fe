<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import JobTitleTable from '@/components/tables/JobTitleTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import ConfirmationModal from '@/components/shared/ConfirmationModal.vue'
import { useJobTitles } from '@/composables/useJobTitles'
import { deleteJobTitleApi, updateJobTitleApi } from '@/services/job-title.service'
import type { JobTitle } from '@/models/JobTitle'

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

const { jobTitles, pageCount, isLoading, refetch } = useJobTitles(queryParams)

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
  router.push('/superadmin/jabatan/create')
}

const handleAction = async (action: string, title: JobTitle) => {
  if (action === 'edit') {
    router.push(`/superadmin/jabatan/edit/${title.id}`)
  } else if (action === 'toggle-status') {
    const newStatus = !title.is_active
    const confirmTitleText = newStatus ? 'Aktifkan Jabatan' : 'Nonaktifkan Jabatan'
    const actionText = newStatus ? 'Aktifkan' : 'Nonaktifkan'
    const msg = newStatus
      ? `Apakah Anda yakin ingin mengaktifkan jabatan ${title.name}?`
      : `Jabatan yang dinonaktifkan tidak dapat dipilih dalam proses penambahan atau pengelolaan data baru. Data yang sudah terhubung tetap tersimpan di sistem.`

    triggerConfirm(
      confirmTitleText,
      msg,
      actionText,
      newStatus ? 'success' : 'danger',
      async () => {
        try {
          await updateJobTitleApi(title.id, {
            name: title.name,
            sector_id: title.sector_id,
            is_active: newStatus,
          })
          message.success(`Jabatan berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
          refetch()
        } catch (err: any) {
          message.error(err.message || 'Gagal mengubah status jabatan')
        }
      }
    )
  } else if (action === 'delete') {
    triggerConfirm(
      'Hapus Jabatan',
      `Jabatan ${title.name} yang dihapus tidak dapat dipulihkan kembali. Data yang sudah terhubung tetap tersimpan di sistem.`,
      'Hapus',
      'danger',
      async () => {
        try {
          await deleteJobTitleApi(title.id)
          message.success('Jabatan berhasil dihapus')
          refetch()
        } catch (err: any) {
          message.error(err.message || 'Gagal menghapus jabatan')
        }
      }
    )
  }
}
</script>

<template>
  <MasterDataIndexLayout
    title="Master Data Jabatan"
    add-button-text="Tambah Jabatan"
    v-model:search-query="searchQuery"
    @search="handleSearch"
    @add="handleAdd"
  >
    <template #table>
      <JobTitleTable 
        :data="jobTitles" 
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
