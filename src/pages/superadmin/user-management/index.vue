<script setup lang="ts">
import { ref, computed } from 'vue'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import UserManagementTabs from '@/components/UserManagementTabs.vue'
import UserManagementTable from '@/components/tables/UserManagementTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import { NConfigProvider, NButton, NIcon, useMessage } from 'naive-ui'
import { Plus } from '@vicons/tabler'
import { useUsers } from '@/composables/useUsers'
import { activateUserApi, blockUserApi, disableUserApi } from '@/services/user.service'
import type { User } from '@/models/User'



const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    tdColor: '#FFFFFF',
    tdColorHover: '#F1F5F9',
    tdColorStriped: '#F8FAFC',
    borderColor: '#F1F5F9',
    thColorHover: '#F8FAFC',
  },
  Tabs: {
    tabColorHover: '#F8FAFC',
    tabColorActive: '#FFFFFF',
    tabColorActiveHover: '#F1F5F9',
    tabTextColor: '#64748B',
    tabTextColorHover: '#64748B',
    tabTextColorActive: '#07229E',
    tabTextColorActiveHover: '#07229E',
  },
}

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

const message = useMessage()

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

import { useRouter } from 'vue-router'

const router = useRouter()

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
</script>

<template>
  <SuperAdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Top Section -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Manajemen User</h1>
          <div class="flex items-center gap-3">
            <SearchInput v-model="searchQuery" placeholder="Search" @search="handleSearch" />
            <n-button type="primary" color="#0014B2" @click="() => $router.push('/superadmin/user-management/create')">
              <template #icon>
                <n-icon :component="Plus" />
              </template>
              Tambah User
            </n-button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="rounded-lg p-2 py-3 space-y-4">
          <!-- Tabs -->
          <UserManagementTabs v-model="activeTab" @update:model-value="handleTabChange" />

          <!-- Data Table -->
          <UserManagementTable :data="tableData" @action="handleAction" />

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-8">
            <p class="text-gray-500">Loading...</p>
          </div>

          <!-- Table Controls -->
          <CandidatePagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="pageCount"
          />
        </div>
      </div>
    </n-config-provider>
  </SuperAdminLayout>
</template>
