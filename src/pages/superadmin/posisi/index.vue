<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import JobRoleTable from '@/components/tables/JobRoleTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { useJobRoles } from '@/composables/useJobRoles'
import { deleteJobRoleApi } from '@/services/job-role.service'
import type { JobRole } from '@/models/JobRole'

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

const { jobRoles, pageCount, isLoading, refetch } = useJobRoles(queryParams)

const handleSearch = (val: string) => {
  searchQuery.value = val
  currentPage.value = 1
}

const handleAdd = () => {
  router.push('/superadmin/posisi/create')
}

const handleAction = async (action: string, role: JobRole) => {
  if (action === 'edit') {
    router.push(`/superadmin/posisi/edit/${role.id}`)
  } else if (action === 'delete') {
    if (confirm(`Apakah Anda yakin ingin menghapus posisi ${role.name}?`)) {
      try {
        await deleteJobRoleApi(role.id)
        message.success('Posisi berhasil dihapus')
        refetch()
      } catch (err: any) {
        message.error(err.message || 'Gagal menghapus posisi')
      }
    }
  }
}
</script>

<template>
  <MasterDataIndexLayout
    title="Master Data Posisi"
    add-button-text="Tambah Posisi"
    v-model:search-query="searchQuery"
    @search="handleSearch"
    @add="handleAdd"
  >
    <template #table>
      <JobRoleTable 
        :data="jobRoles" 
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
