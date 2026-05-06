<script setup lang="ts">
import { computed, ref } from 'vue'
import { NConfigProvider, NInput, NIcon, NButton } from 'naive-ui'
import { CalendarEvent, Search } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import TalentNeedsTable from '@/components/tables/TalentNeedsTable.vue'
import type { TalentNeed } from '@/models/Table'

const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    fontSizeMedium: '12px',
    tdColor: '#FFFFFF',
    tdColorHover: '#F1F5F9',
    tdColorStriped: '#F8FAFC',
    borderColor: '#F1F5F9',
    thColorHover: '#F8FAFC',
  },
}

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const allTalentNeeds = ref<TalentNeed[]>([
  {
    id: 'tn-001',
    no: 1,
    projectKegiatan: 'Pengembangan Sistem E-Office defwcswc',
    jumlahSdm: 2,
    tanggalPengajuan: '1 Mar 2026',
    batasWaktu: '30 Apr 2026',
    picHr: 'Aulia Rahma',
    status: 'Diajukan',
    urgensi: 'High',
  },
  {
    id: 'tn-002',
    no: 2,
    projectKegiatan: 'Integrasi Payment Gateway',
    jumlahSdm: 1,
    tanggalPengajuan: '2 Mar 2026',
    batasWaktu: '10 May 2026',
    picHr: 'Rizky Pratama',
    status: 'Diproses',
    urgensi: 'High',
  },
  {
    id: 'tn-003',
    no: 3,
    projectKegiatan: 'Revamp Landing Page',
    jumlahSdm: 1,
    tanggalPengajuan: '3 Mar 2026',
    batasWaktu: '20 Apr 2026',
    picHr: 'Nabila Putri',
    status: 'Disetujui',
    urgensi: 'Middle',
  },
  {
    id: 'tn-004',
    no: 4,
    projectKegiatan: 'Audit Keamanan Aplikasi',
    jumlahSdm: 2,
    tanggalPengajuan: '5 Mar 2026',
    batasWaktu: '25 Apr 2026',
    picHr: 'Bima Aditya',
    status: 'Diajukan',
    urgensi: 'High',
  },
  {
    id: 'tn-005',
    no: 5,
    projectKegiatan: 'Penyusunan Data Warehouse',
    jumlahSdm: 3,
    tanggalPengajuan: '6 Mar 2026',
    batasWaktu: '15 Jun 2026',
    picHr: 'Aulia Rahma',
    status: 'Diproses',
    urgensi: 'Middle',
  },
  {
    id: 'tn-006',
    no: 6,
    projectKegiatan: 'Migrasi Server Produksi',
    jumlahSdm: 2,
    tanggalPengajuan: '7 Mar 2026',
    batasWaktu: '5 May 2026',
    picHr: 'Rizky Pratama',
    status: 'Diajukan',
    urgensi: 'High',
  },
  {
    id: 'tn-007',
    no: 7,
    projectKegiatan: 'Optimasi SEO Website',
    jumlahSdm: 1,
    tanggalPengajuan: '8 Mar 2026',
    batasWaktu: '18 Apr 2026',
    picHr: 'Nabila Putri',
    status: 'Disetujui',
    urgensi: 'Low',
  },
  {
    id: 'tn-008',
    no: 8,
    projectKegiatan: 'Pembuatan Modul Onboarding',
    jumlahSdm: 2,
    tanggalPengajuan: '9 Mar 2026',
    batasWaktu: '1 May 2026',
    picHr: 'Bima Aditya',
    status: 'Diproses',
    urgensi: 'Middle',
  },
  {
    id: 'tn-009',
    no: 9,
    projectKegiatan: 'Implementasi Chatbot Support',
    jumlahSdm: 2,
    tanggalPengajuan: '10 Mar 2026',
    batasWaktu: '1 Jun 2026',
    picHr: 'Aulia Rahma',
    status: 'Diajukan',
    urgensi: 'Middle',
  },
  {
    id: 'tn-010',
    no: 10,
    projectKegiatan: 'Pengembangan Mobile App v2',
    jumlahSdm: 3,
    tanggalPengajuan: '11 Mar 2026',
    batasWaktu: '30 Jun 2026',
    picHr: 'Rizky Pratama',
    status: 'Diproses',
    urgensi: 'High',
  },
  {
    id: 'tn-011',
    no: 11,
    projectKegiatan: 'Uji Performa API',
    jumlahSdm: 2,
    tanggalPengajuan: '12 Mar 2026',
    batasWaktu: '28 Apr 2026',
    picHr: 'Nabila Putri',
    status: 'Disetujui',
    urgensi: 'Middle',
  },
  {
    id: 'tn-012',
    no: 12,
    projectKegiatan: 'Penyelarasan SOP Rekrutmen',
    jumlahSdm: 1,
    tanggalPengajuan: '13 Mar 2026',
    batasWaktu: '15 Apr 2026',
    picHr: 'Bima Aditya',
    status: 'Diajukan',
    urgensi: 'Low',
  },
  {
    id: 'tn-013',
    no: 13,
    projectKegiatan: 'Automasi Laporan Keuangan',
    jumlahSdm: 2,
    tanggalPengajuan: '14 Mar 2026',
    batasWaktu: '20 May 2026',
    picHr: 'Aulia Rahma',
    status: 'Diproses',
    urgensi: 'Middle',
  },
  {
    id: 'tn-014',
    no: 14,
    projectKegiatan: 'Digitalisasi Arsip Dokumen',
    jumlahSdm: 2,
    tanggalPengajuan: '15 Mar 2026',
    batasWaktu: '12 May 2026',
    picHr: 'Rizky Pratama',
    status: 'Disetujui',
    urgensi: 'Low',
  },
  {
    id: 'tn-015',
    no: 15,
    projectKegiatan: 'Penguatan Infrastruktur Jaringan',
    jumlahSdm: 2,
    tanggalPengajuan: '16 Mar 2026',
    batasWaktu: '30 May 2026',
    picHr: 'Nabila Putri',
    status: 'Diajukan',
    urgensi: 'High',
  },
])

const filteredTalentNeeds = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) {
    return allTalentNeeds.value
  }

  return allTalentNeeds.value.filter((item) => {
    return [item.projectKegiatan, item.picHr, item.status, item.urgensi]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

const pageCount = computed(() => {
  return Math.max(1, Math.ceil(filteredTalentNeeds.value.length / pageSize.value))
})

const paginatedTalentNeeds = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTalentNeeds.value.slice(start, end)
})

const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const handleAction = (action: string, item: TalentNeed) => {
  console.log(`Action: ${action}`, item)
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Kebutuhan Talenta</h1>
          <div class="flex space-x-3">
            <n-input
              :value="searchQuery"
              placeholder="Search by Project"
              @update:value="handleSearch"
            >
              <template #prefix>
                <n-icon :component="Search" />
              </template>
            </n-input>
            <n-button type="primary">
              <template #icon>
                <n-icon :component="CalendarEvent" />
              </template>
            </n-button>
          </div>
        </div>

        <div class="rounded-lg p-2 py-3 space-y-4">
          <TalentNeedsTable :data="paginatedTalentNeeds" @action="handleAction" />

          <CandidatePagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="pageCount"
          />
        </div>
      </div>
    </n-config-provider>
  </AdminLayout>
</template>
