<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NSelect,
  NButton,
  NIcon,
  useMessage,
  NTable,
  NGrid,
  NGi
} from 'naive-ui'
import {
  ArrowLeft,
  Calendar
} from '@vicons/tabler'
import AdminLayout from '../../layouts/AdminLayout.vue'
import { getAdminDashboardAnalyticsApi, type DashboardAnalytics } from '@/services/dashboard.service'

const router = useRouter()
const message = useMessage()
const isLoading = ref(true)
const selectedPeriod = ref('6months')
const analyticsData = ref<DashboardAnalytics | null>(null)

const periodOptions = [
  { label: '3 Bulan Terakhir', value: '3months' },
  { label: '6 Bulan Terakhir', value: '6months' },
  { label: '1 Tahun Terakhir', value: '1year' }
]

const fetchAnalytics = async () => {
  try {
    isLoading.value = true
    const res = await getAdminDashboardAnalyticsApi(selectedPeriod.value)
    analyticsData.value = res.data
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Gagal memuat data analisis')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})

watch(selectedPeriod, () => {
  fetchAnalytics()
})

// Generate SVG points for dynamic sparklines based on trends
const applicantTrendPoints = computed(() => {
  if (!analyticsData.value || analyticsData.value.trends.length === 0) return ''
  const trends = analyticsData.value.trends
  const maxVal = Math.max(...trends.map(t => t.applicants), 10)
  
  const width = 300
  const height = 80
  const padding = 10
  
  const points = trends.map((t, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (trends.length - 1)
    const y = height - padding - (t.applicants / maxVal) * (height - 2 * padding)
    return `${x},${y}`
  })
  return points.join(' ')
})

const hireTrendPoints = computed(() => {
  if (!analyticsData.value || analyticsData.value.trends.length === 0) return ''
  const trends = analyticsData.value.trends
  const maxVal = Math.max(...trends.map(t => t.hires), 5)
  
  const width = 300
  const height = 80
  const padding = 10
  
  const points = trends.map((t, idx) => {
    const x = padding + (idx * (width - 2 * padding)) / (trends.length - 1)
    const y = height - padding - (t.hires / maxVal) * (height - 2 * padding)
    return `${x},${y}`
  })
  return points.join(' ')
})
</script>

<template>
  <AdminLayout>
    <div class="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <!-- Back Header & Period Filter -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <n-button circle secondary @click="router.push('/admin')">
            <template #icon>
              <n-icon :component="ArrowLeft" />
            </template>
          </n-button>
          <div>
            <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Analisis Rekrutmen</h1>
            <p class="text-slate-500 mt-0.5">Analisis tren kandidat diproses rekrutmen, interview, dan onboarding.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <n-icon :component="Calendar" class="text-slate-400" size="18" />
          <n-select
            v-model:value="selectedPeriod"
            :options="periodOptions"
            style="width: 200px"
          />
        </div>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Trend Metrics Card Skeleton -->
        <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
          <template #header>
            <div class="h-5 bg-slate-200 rounded w-1/4"></div>
          </template>
          <n-grid cols="1 m:2" :x-gap="20" :y-gap="20" responsive="screen">
            <n-gi v-for="i in 2" :key="i">
              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between h-44">
                <div class="space-y-2">
                  <div class="h-3 bg-slate-200 rounded w-1/3"></div>
                  <div class="h-6 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div class="h-16 bg-slate-200 rounded w-full mt-4"></div>
              </div>
            </n-gi>
          </n-grid>
          <!-- Trend Table Skeleton -->
          <div class="mt-6 space-y-4">
            <div class="grid grid-cols-4 gap-4 pb-2 border-b border-slate-100">
              <div class="h-4 bg-slate-200 rounded w-1/2"></div>
              <div class="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
              <div class="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
              <div class="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
            </div>
            <div v-for="i in 4" :key="i" class="grid grid-cols-4 gap-4 py-2 border-b border-slate-50 last:border-b-0">
              <div class="h-3.5 bg-slate-200 rounded w-2/3"></div>
              <div class="h-3.5 bg-slate-200 rounded w-12 mx-auto"></div>
              <div class="h-3.5 bg-slate-200 rounded w-12 mx-auto"></div>
              <div class="h-3.5 bg-slate-200 rounded w-12 mx-auto"></div>
            </div>
          </div>
        </n-card>
      </div>

      <template v-else-if="analyticsData">
        <!-- Trend Metrics Sparklines and details -->
        <n-card title="Tren Aktivitas Bulanan" class="shadow-sm rounded-xl border border-slate-100">
          <n-grid cols="1 m:2" :x-gap="20" :y-gap="20" responsive="screen">
            
            <!-- Applicants Sparkline -->
            <div class="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-44">
              <div>
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tren Kandidat Diproses Rekrutmen</span>
                <h3 class="text-2xl font-bold text-slate-800 mt-1">Total Kandidat Diproses</h3>
              </div>
              <!-- Inline SVG Sparkline -->
              <div class="h-20 w-full mt-4 flex items-end">
                <svg class="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <!-- Gradient Fill -->
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.2"/>
                      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path 
                    :d="`M 10,80 L ${applicantTrendPoints} L 290,80 Z`" 
                    fill="url(#appGrad)" 
                  />
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :points="applicantTrendPoints"
                  />
                </svg>
              </div>
            </div>

            <!-- Hires Sparkline -->
            <div class="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-44">
              <div>
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tren Onboarding</span>
                <h3 class="text-2xl font-bold text-slate-800 mt-1">Total Onboarding</h3>
              </div>
              <!-- Inline SVG Sparkline -->
              <div class="h-20 w-full mt-4 flex items-end">
                <svg class="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <!-- Gradient Fill -->
                  <defs>
                    <linearGradient id="hireGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10B981" stop-opacity="0.2"/>
                      <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path 
                    :d="`M 10,80 L ${hireTrendPoints} L 290,80 Z`" 
                    fill="url(#hireGrad)" 
                  />
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :points="hireTrendPoints"
                  />
                </svg>
              </div>
            </div>
          </n-grid>

          <!-- Monthly Trend Data Table -->
          <div class="mt-6">
            <n-table :bordered="false" :single-line="false" class="text-xs">
              <thead>
                <tr>
                  <th class="bg-slate-50 font-bold text-slate-500">Bulan (Periode)</th>
                  <th class="bg-slate-50 font-bold text-slate-500 text-center">Kandidat Diproses</th>
                  <th class="bg-slate-50 font-bold text-slate-500 text-center">Interview</th>
                  <th class="bg-slate-50 font-bold text-slate-500 text-center">Onboarding</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in analyticsData.trends" :key="t.period">
                  <td class="font-semibold text-slate-700">{{ t.period }}</td>
                  <td class="text-center font-bold text-blue-600">{{ t.applicants }}</td>
                  <td class="text-center font-bold text-indigo-600">{{ t.interviews }}</td>
                  <td class="text-center font-bold text-emerald-600">{{ t.hires }}</td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </n-card>
      </template>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* High quality transitions and aesthetic elements */
polyline {
  animation: strokeDraw 1.5s ease-out forwards;
}

@keyframes strokeDraw {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
  }
}
</style>
