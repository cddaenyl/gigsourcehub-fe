<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import CandidateSearch from '../../components/CandidateSearch.vue'
import CandidateTabs from '../../components/CandidateTabs.vue'
import CandidateTable from '../../components/CandidateTable.vue'
import CandidatePagination from '../../components/CandidatePagination.vue'
import { NConfigProvider } from 'naive-ui'

// Define table data type
interface Candidate {
  no: number
  nama: string
  bidang: string
  appliedRole: string
  level: string
  status: string
}

const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    tdColor: '#FFFFFF',
    tdColorHover: '#F1F5F9',
    tdColorStriped: '#F8FAFC',
    borderColor: '#F1F5F9',
    thColorHover: '#F8FAFC'
  },
  Tabs: {
    tabColorHover: '#F8FAFC',
    tabColorActive: '#FFFFFF',
    tabColorActiveHover: '#F1F5F9',
    tabTextColor: '#64748B',
    tabTextColorHover: '#64748B',
    tabTextColorActive: '#07229E',
    tabTextColorActiveHover: '#07229E'
  }
}

// Sample data
const tableData = ref<Candidate[]>([
  {
    no: 1,
    nama: 'John Doe',
    bidang: 'IT',
    appliedRole: 'Frontend Developer',
    level: 'Senior',
    status: 'Aktif'
  },
  {
    no: 2,
    nama: 'Jane Smith',
    bidang: 'IT',
    appliedRole: 'Backend Developer',
    level: 'Mid',
    status: 'Interview'
  },
  {
    no: 3,
    nama: 'Bob Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 4,
    nama: 'Alice Brown',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 5,
    nama: 'Charlie Davis',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 6,
    nama: 'David Wilson',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  },
  {
    no: 7,
    nama: 'Eve Martinez',
    bidang: 'Design',
    appliedRole: 'UI/UX Designer',
    level: 'Junior',
    status: 'On-Boarding'
  }
])

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Tabs
const activeTab = ref('semua')

// Bookmarked candidates
const bookmarkedCandidates = ref<number[]>([])

// Handlers
const handleAction = (action: string, candidate: Candidate) => {
  console.log(`Action: ${action}`, candidate)
}

const handleSearch = (value: string) => {
  console.log('Search:', value)
}

const handleBookmarkToggle = (candidate: Candidate, isBookmarked: boolean) => {
  if (isBookmarked) {
    // Add to bookmarked list
    if (!bookmarkedCandidates.value.includes(candidate.no)) {
      bookmarkedCandidates.value.push(candidate.no)
    }
  } else {
    // Remove from bookmarked list
    bookmarkedCandidates.value = bookmarkedCandidates.value.filter(
      (no) => no !== candidate.no
    )
  }
  console.log('Bookmarked candidates:', bookmarkedCandidates.value)
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Top Section -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Daftar Kandidat</h1>
          <CandidateSearch @search="handleSearch" />
        </div>

        <!-- Main Content -->
        <div class="rounded-lg p-2 py-3 space-y-4">
          <!-- Tabs -->
          <CandidateTabs v-model="activeTab" />

          <!-- Data Table -->
          <CandidateTable
            :data="tableData"
            :bookmarked-candidates="bookmarkedCandidates"
            @action="handleAction"
            @bookmark-toggle="handleBookmarkToggle"
          />

          <!-- Table Controls -->
          <CandidatePagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="3"
          />
        </div>
      </div>
    </n-config-provider>
  </AdminLayout>
</template>
