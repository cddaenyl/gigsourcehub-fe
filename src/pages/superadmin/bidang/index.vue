<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import SectorTable from '@/components/tables/SectorTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import ConfirmationModal from '@/components/shared/ConfirmationModal.vue'
import { useSectors } from '@/composables/useSectors'
import { updateSectorApi, deleteSectorApi } from '@/services/sector.service'
import type { Sector } from '@/models/Sector'

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

const { sectors, pageCount, isLoading, refetch } = useSectors(queryParams)

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
  router.push('/superadmin/bidang/create')
}

const handleAction = async (action: string, sector: Sector) => {
  if (action === 'edit') {
    router.push(`/superadmin/bidang/edit/${sector.id}`)
  } else if (action === 'toggle-status') {
    const newStatus = !sector.is_active
    const title = newStatus ? 'Aktifkan Bidang' : 'Nonaktifkan Bidang'
    const actionText = newStatus ? 'Aktifkan' : 'Nonaktifkan'
    const msg = newStatus 
      ? `Apakah Anda yakin ingin mengaktifkan bidang ${sector.name}?`
      : `Bidang yang dinonaktifkan tidak dapat dipilih dalam proses penambahan atau pengelolaan data baru. Data yang sudah terhubung tetap tersimpan di sistem.`
      
    triggerConfirm(
      title,
      msg,
      actionText,
      newStatus ? 'success' : 'danger',
      async () => {
        try {
          await updateSectorApi(sector.id, {
            name: sector.name,
            is_active: newStatus
          })
          message.success(`Bidang berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
          refetch()
        } catch (err: any) {
          message.error(err.message || 'Gagal mengubah status bidang')
        }
      }
    )
  } else if (action === 'delete') {
    triggerConfirm(
      'Hapus Bidang',
      `Bidang yang dihapus tidak dapat dipulihkan kembali. Data yang sudah terhubung tetap tersimpan di sistem.`,
      'Hapus',
      'danger',
      async () => {
        try {
          await deleteSectorApi(sector.id)
          message.success(`Bidang ${sector.name} berhasil dihapus`)
          refetch()
        } catch (err: any) {
          message.error(err.response?.data?.message || err.message || 'Gagal menghapus bidang')
        }
      }
    )
  }
}
</script>

<template>
  <MasterDataIndexLayout
    title="Master Data Bidang"
    add-button-text="Tambah Bidang"
    v-model:search-query="searchQuery"
    @search="handleSearch"
    @add="handleAdd"
  >
    <template #table>
      <SectorTable 
        :data="sectors" 
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
