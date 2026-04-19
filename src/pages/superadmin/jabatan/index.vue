<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import JobTitleTable from '@/components/tables/JobTitleTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { useJobTitles } from '@/composables/useJobTitles'
import { deleteJobTitleApi } from '@/services/job-title.service'
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
  } else if (action === 'delete') {
    if (confirm(`Apakah Anda yakin ingin menghapus jabatan ${title.name}?`)) {
      try {
        await deleteJobTitleApi(title.id)
        message.success('Jabatan berhasil dihapus')
        refetch()
      } catch (err: any) {
        message.error(err.message || 'Gagal menghapus jabatan')
      }
    }
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
</template>
