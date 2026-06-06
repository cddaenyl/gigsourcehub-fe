<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid,
  NGi,
  NCard,
  NTimeline,
  NTimelineItem,
  NProgress,
  NButton,
  NIcon,
  NBadge,
  useMessage
} from 'naive-ui'
import {
  Clock,
  Check,
  Briefcase,
  Calendar,
  TrendingUp,
  AlertCircle,
  History,
  User,
  Inbox
} from '@vicons/tabler'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { getAdminDashboardSummaryApi, type AdminDashboardSummary } from '@/services/dashboard.service'
import { getProfilePictureThumbnail } from '@/utils/image'

const router = useRouter()
const message = useMessage()
const isLoading = ref(true)
const dashboardData = ref<AdminDashboardSummary | null>(null)

const fetchDashboard = async () => {
  try {
    isLoading.value = true
    const res = await getAdminDashboardSummaryApi()
    dashboardData.value = res.data
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Gagal memuat data dashboard')
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
</script>

<template>
  <AdminLayout>
    <div class="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Recruitment Dashboard</h1>
          <p class="text-slate-500 mt-1">Real-time operational overview and metrics tracking.</p>
        </div>
        <n-button 
          type="primary" 
          ghost
          class="self-start sm:self-auto hover:bg-blue-50 transition-colors"
          @click="router.push('/admin/analytics')"
        >
          <template #icon>
            <n-icon :component="TrendingUp" />
          </template>
          Lihat Analisis Detail
        </n-button>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- KPI Cards Grid Skeleton -->
        <n-grid cols="1 s:2 m:3 l:5" responsive="screen" :x-gap="16" :y-gap="16">
          <n-gi v-for="i in 5" :key="i">
            <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3 animate-pulse">
              <div class="h-3 bg-slate-200 rounded w-2/3"></div>
              <div class="h-8 bg-slate-200 rounded w-1/2 mt-2"></div>
              <div class="h-3 bg-slate-200 rounded w-3/4 mt-3"></div>
            </div>
          </n-gi>
        </n-grid>

        <!-- Main Layout Split Skeleton -->
        <n-grid cols="1 l:3" :x-gap="20" :y-gap="20" responsive="screen">
          <!-- Left side content skeleton -->
          <n-gi span="2" class="space-y-6">
            <!-- Upcoming Interviews Widget Skeleton -->
            <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
              <template #header>
                <div class="h-5 bg-slate-200 rounded w-1/3"></div>
              </template>
              <div class="divide-y divide-slate-100">
                <div v-for="i in 3" :key="i" class="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-slate-200 shrink-0"></div>
                    <div class="space-y-2">
                      <div class="h-4 bg-slate-200 rounded w-32"></div>
                      <div class="h-3 bg-slate-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="space-y-1 text-right">
                      <div class="h-3 bg-slate-200 rounded w-24"></div>
                      <div class="h-2 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div class="h-6 bg-slate-200 rounded-full w-20"></div>
                  </div>
                </div>
              </div>
            </n-card>

            <!-- Recruitment Request Summary Widget Skeleton -->
            <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
              <template #header>
                <div class="h-5 bg-slate-200 rounded w-1/4"></div>
              </template>
              <!-- Progress Bar Skeleton -->
              <div class="bg-slate-50 rounded-xl p-5 mb-6 space-y-3">
                <div class="flex justify-between items-center">
                  <div class="space-y-2 w-2/3">
                    <div class="h-3 bg-slate-200 rounded w-1/3"></div>
                    <div class="h-5 bg-slate-200 rounded w-full"></div>
                  </div>
                  <div class="h-8 bg-slate-200 rounded w-12"></div>
                </div>
                <div class="h-2 bg-slate-200 rounded w-full mt-2"></div>
              </div>
              <!-- Stats Grid Skeleton -->
              <n-grid cols="2 m:4" :x-gap="16" :y-gap="16">
                <n-gi v-for="i in 4" :key="i">
                  <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                    <div class="h-3 bg-slate-200 rounded w-3/4 mx-auto"></div>
                    <div class="h-6 bg-slate-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </n-gi>
              </n-grid>
            </n-card>
          </n-gi>

          <!-- Right side content skeleton -->
          <n-gi class="space-y-6">
            <!-- Alerts & Attention Skeleton -->
            <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
              <template #header>
                <div class="h-5 bg-slate-200 rounded w-1/2"></div>
              </template>
              <div class="space-y-3">
                <div v-for="i in 4" :key="i" class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-slate-200"></div>
                    <div class="space-y-2">
                      <div class="h-3.5 bg-slate-200 rounded w-24"></div>
                      <div class="h-2.5 bg-slate-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div class="h-6 bg-slate-200 rounded w-8"></div>
                </div>
              </div>
            </n-card>

            <!-- Recent Activities Skeleton -->
            <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
              <template #header>
                <div class="h-5 bg-slate-200 rounded w-1/2"></div>
              </template>
              <div class="space-y-6 py-2">
                <div v-for="i in 3" :key="i" class="flex gap-4 items-start relative">
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-200 mt-1 shrink-0"></div>
                  <div class="space-y-2 flex-1">
                    <div class="flex justify-between">
                      <div class="h-3 bg-slate-200 rounded w-1/3"></div>
                      <div class="h-2.5 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div class="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>

      <template v-else-if="dashboardData">
        <!-- KPI Cards Grid -->
        <n-grid cols="1 s:2 m:3 l:5" responsive="screen" :x-gap="16" :y-gap="16">
          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Clock" size="72" />
              </div>
              <p class="text-teal-100 text-xs font-semibold uppercase tracking-wider">Avg Time-to-Hire</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.kpis.time_to_hire_days }} <span class="text-sm font-normal">Hari</span></h3>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Check" size="72" />
              </div>
              <p class="text-blue-100 text-xs font-semibold uppercase tracking-wider">Offer Acceptance</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.kpis.offer_acceptance_rate }}%</h3>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Briefcase" size="72" />
              </div>
              <p class="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Published Job Vacancies</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.kpis.active_job_vacancies }} <span class="text-sm font-normal">Posisi</span></h3>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="Calendar" size="72" />
              </div>
              <p class="text-purple-100 text-xs font-semibold uppercase tracking-wider">Interview Attendance</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.kpis.interview_attendance_rate }}%</h3>
            </div>
          </n-gi>

          <n-gi>
            <div class="relative overflow-hidden bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-5 text-white shadow-md hover:-translate-y-1 transition-all duration-300">
              <div class="absolute right-2 -bottom-2 opacity-15">
                <n-icon :component="TrendingUp" size="72" />
              </div>
              <p class="text-orange-100 text-xs font-semibold uppercase tracking-wider">Quality of Hire</p>
              <h3 class="text-3xl font-bold mt-2">{{ dashboardData.kpis.quality_of_hire }}%</h3>
            </div>
          </n-gi>
        </n-grid>

        <!-- Main Dashboard Split Layout -->
        <n-grid cols="1 l:3" :x-gap="20" :y-gap="20" responsive="screen">
          
          <!-- Left side content (Upcoming Interviews & Requests Summary) -->
          <n-gi span="2" class="space-y-6">
            
            <!-- Upcoming Interviews Widget -->
            <n-card title="Jadwal Wawancara Mendatang" class="shadow-sm rounded-xl border border-slate-100">
              <template #header-extra>
                <n-badge :value="dashboardData.upcoming_interviews.length" type="info" />
              </template>

              <div v-if="dashboardData.upcoming_interviews.length === 0" class="flex flex-col items-center justify-center py-10">
                <n-icon :component="Inbox" size="48" class="text-slate-300" />
                <p class="text-slate-400 mt-2 text-sm">Tidak ada jadwal wawancara terdekat.</p>
              </div>

              <div v-else class="divide-y divide-slate-100">
                <div 
                  v-for="iv in dashboardData.upcoming_interviews" 
                  :key="iv.id" 
                  class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group"
                >
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-slate-100">
                      <img v-if="iv.candidate_user_profile_picture" :src="getProfilePictureThumbnail(iv.candidate_user_profile_picture)" alt="Avatar" class="h-full w-full object-cover" />
                      <span v-else>{{ iv.candidate_user_name?.charAt(0) || 'C' }}</span>
                    </div>
                    <div>
                      <h4 class="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {{ iv.candidate_user_name || 'Kandidat' }}
                      </h4>
                      <p class="text-xs text-slate-500">
                        {{ iv.subrequest?.project_name || 'Proyek Tidak Terdefinisi' }} &bull; {{ iv.stage?.name || 'Interview' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between sm:justify-end gap-4">
                    <div class="text-left sm:text-right">
                      <p class="text-xs font-semibold text-slate-700">{{ formatDateTime(iv.scheduled_at) }}</p>
                      <p class="text-[10px] text-slate-400">Scheduled Date</p>
                    </div>
                    <span 
                      class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      :class="{
                        'bg-yellow-50 text-yellow-600': iv.status === 'SCHEDULED',
                        'bg-blue-50 text-blue-600': iv.status === 'RESCHEDULED',
                        'bg-green-50 text-green-600': iv.status === 'COMPLETED',
                        'bg-red-50 text-red-600': iv.status === 'CANCELLED'
                      }"
                    >
                      {{ iv.status }}
                    </span>
                  </div>
                </div>
              </div>
            </n-card>

            <!-- Recruitment Request Summary Widget -->
            <n-card title="Ringkasan Request" class="shadow-sm rounded-xl border border-slate-100">
              <!-- Headcount progress card inside -->
              <div class="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-5 mb-6 border border-slate-100">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="space-y-1">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fulfillment Posisi</p>
                    <h4 class="text-xl font-bold text-slate-800">
                      {{ dashboardData.requests_summary.filled_headcount }} dari {{ dashboardData.requests_summary.required_headcount }} Posisi Terpenuhi
                    </h4>
                  </div>
                  <div class="text-right">
                    <span class="text-3xl font-extrabold text-blue-600">
                      {{ Math.round(dashboardData.requests_summary.headcount_fulfillment_percentage) }}%
                    </span>
                  </div>
                </div>
                <div class="mt-4">
                  <n-progress 
                    type="line" 
                    :percentage="Math.round(dashboardData.requests_summary.headcount_fulfillment_percentage)" 
                    :show-indicator="false"
                    color="#2563EB"
                    rail-color="#E2E8F0"
                    processing
                  />
                </div>
              </div>

              <!-- Metrics Stats Grid -->
              <n-grid cols="2 m:4" :x-gap="16" :y-gap="16">
                <n-gi>
                  <div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                    <p class="text-xs font-medium text-slate-500">Total Request</p>
                    <h3 class="text-2xl font-bold text-slate-800 mt-1">{{ dashboardData.requests_summary.total_requests }}</h3>
                  </div>
                </n-gi>
                <n-gi>
                  <div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                    <p class="text-xs font-medium text-green-600">Terpenuhi (Done)</p>
                    <h3 class="text-2xl font-bold text-green-600 mt-1">{{ dashboardData.requests_summary.fulfilled_requests }}</h3>
                  </div>
                </n-gi>
                <n-gi>
                  <div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                    <p class="text-xs font-medium text-orange-600">Menunggu Validasi</p>
                    <h3 class="text-2xl font-bold text-orange-600 mt-1">{{ dashboardData.requests_summary.waiting_validation_requests }}</h3>
                  </div>
                </n-gi>
                <n-gi>
                  <div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                    <p class="text-xs font-medium text-blue-600">Dalam Proses</p>
                    <h3 class="text-2xl font-bold text-blue-600 mt-1">{{ dashboardData.requests_summary.in_progress_requests }}</h3>
                  </div>
                </n-gi>
              </n-grid>

              <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <p class="text-xs text-slate-400">Tingkat pemenuhan request keseluruhan:</p>
                <span class="text-xs font-bold text-slate-700">
                  {{ Math.round(dashboardData.requests_summary.request_fulfillment_percentage) }}% Request Selesai
                </span>
              </div>
            </n-card>

          </n-gi>

          <!-- Right side content (Alerts & Recent Activities) -->
          <n-gi class="space-y-6">

            <!-- Alerts & Attention Needed -->
            <n-card title="Perhatian & Tindakan" class="shadow-sm rounded-xl border border-slate-100">
              <div class="space-y-3">
                
                <div class="flex items-center justify-between p-3.5 rounded-xl border border-rose-100 bg-rose-50/30">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                      <n-icon :component="AlertCircle" size="20" />
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-rose-900">Permintaan Overdue</h5>
                      <p class="text-[10px] text-rose-600">Sudah melewati batas waktu</p>
                    </div>
                  </div>
                  <span class="text-lg font-black text-rose-600">{{ dashboardData.alerts.overdue_requests }}</span>
                </div>

                <div class="flex items-center justify-between p-3.5 rounded-xl border border-amber-100 bg-amber-50/30">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <n-icon :component="Calendar" size="20" />
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-amber-900">Wawancara Hari Ini</h5>
                      <p class="text-[10px] text-amber-600">Jadwal interview hari ini</p>
                    </div>
                  </div>
                  <span class="text-lg font-black text-amber-600">{{ dashboardData.alerts.interviews_scheduled_today }}</span>
                </div>

                <div class="flex items-center justify-between p-3.5 rounded-xl border border-blue-100 bg-blue-50/30">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <n-icon :component="User" size="20" />
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-blue-900">Belum Ada PIC HR</h5>
                      <p class="text-[10px] text-blue-600">Permintaan baru belum diassign</p>
                    </div>
                  </div>
                  <span class="text-lg font-black text-blue-600">{{ dashboardData.alerts.unassigned_requests }}</span>
                </div>

                <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                      <n-icon :component="Clock" size="20" />
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-slate-900">Placement Segera Berakhir</h5>
                      <p class="text-[10px] text-slate-500">Berakhir dalam 30 hari kedepan</p>
                    </div>
                  </div>
                  <span class="text-lg font-black text-slate-700">{{ dashboardData.alerts.expiring_placements }}</span>
                </div>

              </div>
            </n-card>

            <!-- Recent Activities Widget -->
            <n-card title="Aktivitas Rekrutmen Terbaru" class="shadow-sm rounded-xl border border-slate-100">
              <template #header-extra>
                <n-icon :component="History" class="text-slate-400" />
              </template>

              <div class="max-h-[360px] overflow-y-auto pr-1">
                <n-timeline size="medium">
                  <n-timeline-item
                    v-for="act in dashboardData.recent_activities"
                    :key="act.id"
                    :type="act.action_type === 'Create' ? 'success' : act.action_type === 'Edit' ? 'info' : 'warning'"
                    :title="act.module"
                    :time="formatDateTime(act.created_at)"
                  >
                    <p class="text-xs text-slate-600 leading-relaxed">
                      <span class="font-bold text-slate-800">{{ act.actor_name }}</span> 
                      {{ act.description || 'melakukan aksi ' + act.action_type }}
                    </p>
                  </n-timeline-item>
                </n-timeline>
              </div>
            </n-card>

          </n-gi>
        </n-grid>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* Glassmorphism custom effects and styling variables */
.max-h-\[360px\] {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
}
.max-h-\[360px\]::-webkit-scrollbar {
  width: 4px;
}
.max-h-\[360px\]::-webkit-scrollbar-track {
  background: #F1F5F9;
}
.max-h-\[360px\]::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 4px;
}
</style>
