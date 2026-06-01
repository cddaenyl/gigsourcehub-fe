<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid,
  NGi,
  NCard,
  NButton,
  NIcon,
  useMessage,
  NTable,
  NTag
} from 'naive-ui'
import {
  AlertCircle,
  Users,
  Briefcase,
  User,
  Robot,
  History,
  Shield,
  ArrowRight
} from '@vicons/tabler'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import { getSuperadminDashboardSummaryApi, type SuperadminDashboardSummary } from '@/services/dashboard.service'

const router = useRouter()
const message = useMessage()
const isLoading = ref(true)
const dashboardData = ref<SuperadminDashboardSummary | null>(null)

const fetchDashboard = async () => {
  try {
    isLoading.value = true
    const res = await getSuperadminDashboardSummaryApi()
    dashboardData.value = res.data
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Gagal memuat data tata kelola superadmin')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})

const formatDateTime = (val: string) => {
  if (!val) return '-'
  const d = new Date(val)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTableName = (name: string) => {
  const map: Record<string, string> = {
    'faqs': 'FAQ',
    'company_profiles': 'Informasi Perusahaan',
    'career_departments': 'Kategori Bidang'
  }
  return map[name] || name
}
</script>

<template>
  <SuperAdminLayout>
    <div class="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <n-icon :component="Shield" class="text-indigo-600" />
            Dashboard Tata Kelola
          </h1>
          <p class="text-slate-500 mt-1">Superadmin system metrics, verification approvals, and engine status.</p>
        </div>
        <n-button 
          v-if="dashboardData && dashboardData.pending_approvals_count > 0"
          type="warning"
          color="#07229E"
          class="hover:opacity-90 transition-opacity"
          @click="router.push('/superadmin/approval/faq')"
        >
          Tinjau Persetujuan ({{ dashboardData.pending_approvals_count }})
          <template #icon>
            <n-icon :component="ArrowRight" />
          </template>
        </n-button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p class="text-slate-500 font-medium">Memuat tata kelola sistem...</p>
      </div>

      <template v-else-if="dashboardData">
        
        <!-- KPI Cards Grid -->
        <n-grid cols="1 s:2 m:3 l:5" responsive="screen" :x-gap="16" :y-gap="16">
          <n-gi>
            <div 
              class="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              @click="router.push('/superadmin/approval/faq')"
            >
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="AlertCircle" size="72" />
              </div>
              <p class="text-amber-100 text-xs font-semibold uppercase tracking-wider">Persetujuan Pending</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.pending_approvals_count }} <span class="text-sm font-normal">Tugas</span></h3>
              <p class="text-amber-100 text-xs mt-3 flex items-center gap-1">
                Butuh persetujuan CMS
              </p>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Users" size="72" />
              </div>
              <p class="text-blue-100 text-xs font-semibold uppercase tracking-wider">Total Kandidat</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.total_candidates }} <span class="text-sm font-normal">User</span></h3>
              <p class="text-blue-100 text-xs mt-3">
                Terdaftar di database
              </p>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="User" size="72" />
              </div>
              <p class="text-purple-100 text-xs font-semibold uppercase tracking-wider">Total HR / Admin</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.total_admins }} <span class="text-sm font-normal">Staf</span></h3>
              <p class="text-purple-100 text-xs mt-3">
                Pengelola rekrutmen
              </p>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Briefcase" size="72" />
              </div>
              <p class="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Total Klien (Employee)</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.total_employees }} <span class="text-sm font-normal">Akun</span></h3>
              <p class="text-indigo-100 text-xs mt-3">
                Pemilik permintaan SDM
              </p>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Briefcase" size="72" />
              </div>
              <p class="text-teal-100 text-xs font-semibold uppercase tracking-wider">Lowongan Aktif</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.active_job_vacancies }} <span class="text-sm font-normal">Karir</span></h3>
              <p class="text-teal-100 text-xs mt-3">
                Tayang di landing page
              </p>
            </div>
          </n-gi>
        </n-grid>

        <!-- Split Layout for AI Match Engine & Recent Approvals -->
        <n-grid cols="1 l:3" :x-gap="20" :y-gap="20" responsive="screen">
          
          <!-- AI Engine Control & Status (Span 1) -->
          <n-gi>
            <n-card title="AI Talent Search & Matching" class="shadow-sm rounded-xl border border-slate-100">
              <div class="space-y-6">
                <!-- Visual status badge -->
                <div class="flex items-center gap-4 p-4 rounded-2xl border" :class="dashboardData.is_ai_mode_enabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'">
                  <div class="h-12 w-12 rounded-xl flex items-center justify-center font-bold" :class="dashboardData.is_ai_mode_enabled ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-300 text-slate-600'">
                    <n-icon :component="Robot" size="24" />
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-800">
                      RAG Engine is {{ dashboardData.is_ai_mode_enabled ? 'ONLINE' : 'OFFLINE' }}
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ dashboardData.is_ai_mode_enabled ? 'Pencarian talenta berbasis kecerdasan buatan aktif' : 'Pencarian AI dinonaktifkan sementara' }}
                    </p>
                  </div>
                </div>

                <!-- Info block -->
                <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <h5 class="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <n-icon :component="Shield" />
                    Kebijakan Keamanan AI
                  </h5>
                  <p class="text-[11px] text-indigo-700 leading-relaxed mt-1.5">
                    Mode AI mengizinkan parser resume otomatis, pencocokan skor keselarasan, dan asisten rekrutmen interaktif berjalan menggunakan model LLM terintegrasi.
                  </p>
                </div>
                
                <n-button 
                  ghost 
                  type="primary" 
                  class="w-full"
                  @click="router.push('/superadmin/system-settings')"
                >
                  Konfigurasi Pengaturan Sistem
                </n-button>
              </div>
            </n-card>
          </n-gi>

          <!-- Recent Approvals List (Span 2) -->
          <n-gi span="2">
            <n-card title="Riwayat Persetujuan CMS Terbaru" class="shadow-sm rounded-xl border border-slate-100">
              <template #header-extra>
                <n-icon :component="History" class="text-slate-400" />
              </template>

              <div v-if="dashboardData.recent_approvals.length === 0" class="flex flex-col items-center justify-center py-10">
                <n-icon :component="AlertCircle" size="48" class="text-slate-300" />
                <p class="text-slate-400 mt-2 text-sm">Tidak ada riwayat persetujuan terbaru.</p>
              </div>

              <div v-else class="overflow-x-auto">
                <n-table :bordered="false" :single-line="false" class="text-xs">
                  <thead>
                    <tr>
                      <th class="bg-slate-50 font-bold text-slate-500">Tabel</th>
                      <th class="bg-slate-50 font-bold text-slate-500 text-center">Aksi</th>
                      <th class="bg-slate-50 font-bold text-slate-500 text-center">Status</th>
                      <th class="bg-slate-50 font-bold text-slate-500">Diajukan Oleh</th>
                      <th class="bg-slate-50 font-bold text-slate-500">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="app in dashboardData.recent_approvals" :key="app.id">
                      <td class="font-semibold text-slate-700">{{ formatTableName(app.table_name) }}</td>
                      <td class="text-center font-medium">
                        <n-tag 
                          size="small" 
                          :type="app.action === 'CREATE' ? 'success' : app.action === 'UPDATE' ? 'info' : 'warning'"
                        >
                          {{ app.action }}
                        </n-tag>
                      </td>
                      <td class="text-center">
                        <span 
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          :class="{
                            'bg-green-50 text-green-600': app.status === 'APPROVED',
                            'bg-red-50 text-red-600': app.status === 'REJECTED',
                            'bg-yellow-50 text-yellow-600': app.status === 'PENDING'
                          }"
                        >
                          {{ app.status }}
                        </span>
                      </td>
                      <td class="text-slate-600 font-medium">{{ app.requested_by_name || 'Admin' }}</td>
                      <td class="text-slate-500">{{ formatDateTime(app.created_at) }}</td>
                    </tr>
                  </tbody>
                </n-table>
              </div>
            </n-card>
          </n-gi>

        </n-grid>

      </template>

    </div>
  </SuperAdminLayout>
</template>
