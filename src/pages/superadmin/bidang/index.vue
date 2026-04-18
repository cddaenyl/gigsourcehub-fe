<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import SectorTable from '@/components/tables/SectorTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { useSectors } from '@/composables/useSectors'
import { deleteSectorApi } from '@/services/sector.service'
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
  } else if (action === 'delete') {
    if (confirm(`Apakah Anda yakin ingin menghapus bidang ${sector.name}?`)) {
      try {
        await deleteSectorApi(sector.id)
        message.success('Bidang berhasil dihapus')
        refetch()
      } catch (err: any) {
        message.error(err.message || 'Gagal menghapus bidang')
      }
    }
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
</template>
