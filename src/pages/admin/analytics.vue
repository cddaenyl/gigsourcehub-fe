<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid,
  NGi,
  NCard,
  NSelect,
  NButton,
  NIcon,
  useMessage,
  NTable
} from 'naive-ui'
import {
  ArrowLeft,
  TrendingUp,
  ChartPie,
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

const topOfFunnelCount = computed(() => {
  return analyticsData.value?.funnel?.[0]?.count ?? 0
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
            <p class="text-slate-500 mt-0.5">Analisis konversi kandidat, distribusi status, dan tren bulanan.</p>
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
        <n-grid cols="1 l:3" :x-gap="20" :y-gap="20" responsive="screen">
          <!-- Funnel Section Skeleton (Span 2) -->
          <n-gi span="2" class="space-y-6">
            <!-- Funnel Card Skeleton -->
            <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
              <template #header>
                <div class="h-5 bg-slate-200 rounded w-1/3"></div>
              </template>
              <div class="space-y-6">
                <div v-for="i in 4" :key="i" class="flex items-center gap-4">
                  <div class="w-32 sm:w-44 space-y-1 pr-2">
                    <div class="h-4 bg-slate-200 rounded w-3/4 ml-auto"></div>
                    <div class="h-3 bg-slate-200 rounded w-1/2 ml-auto"></div>
                  </div>
                  <div class="flex-1">
                    <div class="h-9 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4">
                      <div class="h-4 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            </n-card>

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
          </n-gi>

          <!-- Right side status distribution skeleton -->
          <n-gi class="space-y-6">
            <n-card class="shadow-sm rounded-xl border border-slate-100 animate-pulse">
              <template #header>
                <div class="h-5 bg-slate-200 rounded w-1/2"></div>
              </template>
              <div class="space-y-4">
                <div v-for="i in 5" :key="i" class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <div class="h-3.5 w-3.5 rounded-full bg-slate-200"></div>
                      <div class="h-3.5 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div class="h-4 bg-slate-200 rounded w-8"></div>
                  </div>
                  <div class="bg-slate-100 h-1.5 rounded-full"></div>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>

      <template v-else-if="analyticsData">
        
        <n-grid cols="1 l:3" :x-gap="20" :y-gap="20" responsive="screen">
          
          <!-- Funnel Section (Span 2) -->
          <n-gi span="2" class="space-y-6">
            <n-card title="Funnel Konversi Rekrutmen" class="shadow-sm rounded-xl border border-slate-100">
              <template #header-extra>
                <div class="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
                  <n-icon :component="TrendingUp" size="14" />
                  Rasio Konversi Kumulatif
                </div>
              </template>

              <!-- Funnel Display -->
              <div class="space-y-6">
                <div 
                  v-for="(stage, idx) in analyticsData.funnel" 
                  :key="stage.stage_name" 
                  class="flex items-center gap-4 group"
                >
                  <!-- Stage Label & Percentages -->
                  <div class="w-32 sm:w-44 text-right pr-2">
                    <h4 class="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">
                      {{ stage.stage_name }}
                    </h4>
                    <p class="text-[10px] text-slate-400 mt-0.5">
                      Prev stage: {{ idx === 0 ? '100' : Math.round(stage.conversion_rate) }}%
                    </p>
                  </div>

                  <!-- Funnel Graphic Bar -->
                  <div class="flex-1">
                    <!-- Outer wrapper for progress -->
                    <div class="h-9 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 relative flex items-center px-4">
                      <!-- Inner progress colored fill -->
                      <div 
                        class="absolute left-0 top-0 bottom-0 transition-all duration-500 bg-gradient-to-r"
                        :class="{
                          'from-blue-500 to-blue-600': idx === 0,
                          'from-indigo-400 to-indigo-500': idx === 1,
                          'from-purple-400 to-purple-500': idx === 2,
                          'from-emerald-400 to-emerald-500': idx === 3,
                        }"
                        :style="{ width: `${topOfFunnelCount > 0 ? (stage.count / topOfFunnelCount) * 100 : 0}%` }"
                      ></div>
                      
                      <!-- Value text labels -->
                      <div class="relative z-10 flex w-full justify-between items-center text-xs font-bold text-slate-700">
                        <span :class="idx === 0 || (topOfFunnelCount > 0 && (stage.count / topOfFunnelCount) > 0.4) ? 'text-white' : 'text-slate-700 pl-2'">
                          {{ stage.count }} Kandidat
                        </span>
                        <span :class="idx === 0 || (topOfFunnelCount > 0 && (stage.count / topOfFunnelCount) > 0.4) ? 'text-blue-50' : 'text-slate-400'">
                          {{ topOfFunnelCount > 0 ? Math.round((stage.count / topOfFunnelCount) * 100) : 0 }}% of total
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </n-card>

            <!-- Trend Metrics Sparklines and details -->
            <n-card title="Tren Aktivitas Bulanan" class="shadow-sm rounded-xl border border-slate-100">
              <n-grid cols="1 m:2" :x-gap="20" :y-gap="20" responsive="screen">
                
                <!-- Applicants Sparkline -->
                <div class="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-44">
                  <div>
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tren Pelamar Masuk</span>
                    <h3 class="text-2xl font-bold text-slate-800 mt-1">Total Pelamar</h3>
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
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tren Rekrutmen (Hires)</span>
                    <h3 class="text-2xl font-bold text-slate-800 mt-1">Kandidat Onboarded</h3>
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
                      <th class="bg-slate-50 font-bold text-slate-500 text-center">Pelamar Masuk</th>
                      <th class="bg-slate-50 font-bold text-slate-500 text-center">Wawancara</th>
                      <th class="bg-slate-50 font-bold text-slate-500 text-center">Diterima (Hires)</th>
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

          </n-gi>

          <!-- Right side status distribution (Span 1) -->
          <n-gi class="space-y-6">
            
            <!-- Candidate Status Distribution -->
            <n-card title="Distribusi Status Kandidat" class="shadow-sm rounded-xl border border-slate-100">
              <template #header-extra>
                <n-icon :component="ChartPie" class="text-slate-400" />
              </template>

              <!-- Custom Legend Bars -->
              <div class="space-y-4">
                <div 
                  v-for="dist in analyticsData.status_distribution" 
                  :key="dist.status_name" 
                  class="p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <!-- Colored dot indicator -->
                      <span 
                        class="h-3.5 w-3.5 rounded-full inline-block border border-slate-200"
                        :style="{ backgroundColor: dist.hex_code || '#64748B' }"
                      ></span>
                      <span class="text-xs font-semibold text-slate-700">{{ dist.status_name }}</span>
                    </div>
                    <span class="text-sm font-extrabold text-slate-800">{{ dist.count }}</span>
                  </div>

                  <!-- Mini progress bar -->
                  <div class="mt-2.5 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full"
                      :style="{ 
                        backgroundColor: dist.hex_code || '#64748B', 
                        width: `${topOfFunnelCount > 0 ? (dist.count / topOfFunnelCount) * 100 : 0}%` 
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </n-card>

          </n-gi>

        </n-grid>
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
