<script setup lang="ts">
import { ref, computed } from 'vue'
import MasterDataIndexLayout from '@/components/shared/MasterDataIndexLayout.vue'
import UserManagementTabs from '@/components/UserManagementTabs.vue'
import UserManagementTable from '@/components/tables/UserManagementTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { useMessage } from 'naive-ui'
import { useUsers } from '@/composables/useUsers'
import { activateUserApi, blockUserApi, disableUserApi } from '@/services/user.service'
import type { User } from '@/models/User'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = useMessage()

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Tabs
const activeTab = ref('Admin')

// Search
const searchQuery = ref('')

// Fetch users with query params
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value,
  role: activeTab.value,
}))

const { users, pageCount, isLoading, refetch } = useUsers(queryParams, true)

// Transform API data to table data format
const tableData = computed(() => {
  return users.value.map((user: User, index: number) => ({
    id: user.id,
    no: (currentPage.value - 1) * pageSize.value + index + 1,
    nama: user.name,
    email: user.email,
    bidang: user.bidang || '-',
    status: user.account_status,
    system_role_name: user.system_role_name,
  }))
})

// Handlers
const handleAction = async (action: string, user: any) => {
  try {
    switch (action) {
      case 'block':
        await blockUserApi(user.id)
        message.success('User berhasil di-block')
        break
      case 'disable':
        await disableUserApi(user.id)
        message.success('User berhasil dinonaktifkan')
        break
      case 'activate':
        await activateUserApi(user.id)
        message.success('User berhasil diaktifkan')
        break
      case 'edit':
        router.push(`/superadmin/user-management/edit/${user.id}`)
        break
      default:
        console.log(`Action: ${action}`, user)
    }
    refetch()
  } catch (err: any) {
    message.error(err.message || 'Gagal melakukan aksi')
  }
}

const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const handleTabChange = () => {
  currentPage.value = 1
}

const handleAdd = () => {
  router.push('/superadmin/user-management/create')
}
</script>

<template>
  <MasterDataIndexLayout
    title="Manajemen User"
    add-button-text="Tambah User"
    v-model:search-query="searchQuery"
    @search="handleSearch"
    @add="handleAdd"
  >
    <template #tabs>
      <UserManagementTabs v-model="activeTab" @update:model-value="handleTabChange" />
    </template>

    <template #table>
      <UserManagementTable :data="tableData" @action="handleAction" />
      
      <!-- Loading State -->
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
