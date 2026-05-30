<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NCard,
  NButton,
  NIcon,
  NTag,
  NSpin,
  NConfigProvider,
  useMessage,
} from 'naive-ui'
import { ChevronLeft, Calendar, MapPin, Clock, Checkbox, Checks } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getJobVacancyByIdApi } from '@/services/job-vacancy.service'
import { parseJobVacancyDescription } from '@/models/JobVacancy'
import type { JobVacancy } from '@/models/JobVacancy'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const id = computed(() => (route.params as Record<string, string>).id ?? '')
const isFetching = ref(true)
const vacancy = ref<JobVacancy | null>(null)

// Parsed description
const jobDesc = ref<string[]>([])
const qualifications = ref<string[]>([])
const benefits = ref<string[]>([])

// Tech stack parsed
const techStack = computed(() => {
  const ts = vacancy.value?.subrequest?.tech_stack
  if (!ts) return []
  const cleaned = ts.trim()
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch { /* noop */ }
  }
  return cleaned
    .replace(/[\[\]"']/g, '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
})

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const schemaLabel = (schema: string | null) => {
  if (!schema) return '—'
  const map: Record<string, string> = { ONSITE: 'Onsite', REMOTE: 'Remote', HYBRID: 'Hybrid' }
  return map[schema] ?? schema
}

const loadVacancy = async () => {
  if (!id.value) return
  isFetching.value = true
  try {
    const res = await getJobVacancyByIdApi(id.value)
    vacancy.value = res.data
    const desc = parseJobVacancyDescription(res.data.description)
    jobDesc.value = desc.job_desc
    qualifications.value = desc.qualifications
    benefits.value = desc.benefits
  } catch (err: unknown) {
    message.error(err instanceof Error ? err.message : 'Gagal memuat data lowongan')
    router.push('/admin/lowongan')
  } finally {
    isFetching.value = false
  }
}

watch(id, loadVacancy, { immediate: true })

const themeOverride = {
  common: {
    primaryColor: '#07229E',
    primaryColorHover: '#334155',
    primaryColorPressed: '#07229E',
  },
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="flex items-center justify-center w-8 h-8 rounded-full bg-[#0014B2] text-white hover:bg-blue-800 transition-colors"
            @click="router.push('/admin/lowongan')"
          >
            <n-icon :component="ChevronLeft" size="20" />
          </button>
          <h1 class="text-xl font-bold text-[#1E293B]">Detail Lowongan</h1>
        </div>

        <!-- Loading -->
        <div v-if="isFetching" class="flex justify-center py-16">
          <n-spin size="large" />
        </div>

        <template v-else-if="vacancy">
          <!-- Konteks Lowongan -->
          <n-card title="Konteks Lowongan" :bordered="false" class="rounded-xl shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Nama Project / Kegiatan
                </p>
                <p class="text-sm font-medium text-slate-700">
                  {{ (vacancy.subrequest as any)?.project_name || '—' }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Nama Posisi
                </p>
                <p class="text-sm font-medium text-slate-700">
                  {{ vacancy.subrequest?.job_role || '—' }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Bidang
                </p>
                <p class="text-sm font-medium text-slate-700">
                  {{ vacancy.subrequest?.bidang || '—' }}
                </p>
              </div>
            </div>
          </n-card>

          <!-- Preview Lowongan -->
          <n-card title="Preview Lowongan" :bordered="false" class="rounded-xl shadow-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col gap-6">

              <!-- Category badge -->
              <div class="flex items-center gap-3">
                <div class="bg-[#e2e8f0] px-3 py-1 rounded-full text-sm font-medium text-[#1e293b]">
                  {{ vacancy.subrequest?.bidang || 'Technology Information' }}
                </div>
              </div>

              <!-- Title -->
              <div class="flex flex-col gap-2">
                <h2 class="text-3xl font-bold text-[#061b7e] leading-tight">
                  {{ vacancy.name }}
                </h2>
                <div class="flex items-center gap-1.5 text-slate-500 text-sm">
                  <n-icon :component="Calendar" size="16" />
                  <span>Posted On: {{ formatDate(vacancy.created_at) }}</span>
                </div>
              </div>

              <!-- Overview -->
              <div v-if="vacancy.overview" class="flex flex-col gap-2">
                <h3 class="text-[#061b7e] text-lg font-semibold">Overview</h3>
                <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {{ vacancy.overview }}
                </p>
              </div>

              <!-- Duration & Location -->
              <div class="grid grid-cols-2 gap-6 py-4 border-y border-slate-100">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                    <n-icon :component="Clock" size="14" />
                    <span class="font-semibold uppercase tracking-wide">Duration</span>
                  </div>
                  <p class="text-slate-700 text-sm font-medium">
                    {{ (vacancy.subrequest as any)?.project_duration || '—' }}
                  </p>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                    <n-icon :component="MapPin" size="14" />
                    <span class="font-semibold uppercase tracking-wide">Location</span>
                  </div>
                  <p class="text-slate-700 text-sm font-medium">
                    {{ schemaLabel(vacancy.schema) }}
                  </p>
                </div>
              </div>

              <!-- Job Description -->
              <div v-if="jobDesc.length > 0" class="flex flex-col gap-3">
                <h3 class="text-[#061b7e] text-lg font-semibold">Job Description</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(item, idx) in jobDesc" :key="idx" class="flex gap-2.5 items-start">
                    <n-icon :component="Checkbox" size="18" class="text-[#061b7e] shrink-0 mt-0.5" />
                    <p class="text-slate-600 text-sm leading-normal">{{ item }}</p>
                  </div>
                </div>
              </div>

              <!-- Qualifications -->
              <div v-if="qualifications.length > 0" class="flex flex-col gap-3">
                <h3 class="text-[#061b7e] text-lg font-semibold">Qualifications</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(qual, idx) in qualifications" :key="idx" class="flex gap-2.5 items-start">
                    <n-icon :component="Checkbox" size="18" class="text-[#061b7e] shrink-0 mt-0.5" />
                    <p class="text-slate-600 text-sm leading-normal">{{ qual }}</p>
                  </div>
                </div>
              </div>

              <!-- Tech Stack -->
              <div v-if="techStack.length > 0" class="flex flex-col gap-3">
                <h3 class="text-[#061b7e] text-lg font-semibold">Tech Stack</h3>
                <div class="flex flex-wrap gap-2">
                  <n-tag
                    v-for="tag in techStack"
                    :key="tag"
                    round
                    :color="{ color: '#C7D0F3', textColor: '#07229E' }"
                  >
                    {{ tag }}
                  </n-tag>
                </div>
              </div>

              <!-- Benefits -->
              <div v-if="benefits.length > 0" class="flex flex-col gap-3">
                <h3 class="text-[#061b7e] text-lg font-semibold">Benefits</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(benefit, idx) in benefits" :key="idx" class="flex gap-2.5 items-start">
                    <n-icon :component="Checks" size="18" class="text-[#061b7e] shrink-0 mt-0.5" />
                    <p class="text-slate-600 text-sm leading-normal">{{ benefit }}</p>
                  </div>
                </div>
              </div>

            </div>
          </n-card>

          <!-- Pengaturan Publikasi -->
          <n-card title="Pengaturan Publikasi" :bordered="false" class="rounded-xl shadow-sm">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Tanggal Penutupan
              </p>
              <div class="flex items-center gap-2 mt-2">
                <n-icon :component="Calendar" size="16" class="text-slate-400" />
                <p class="text-sm text-slate-700 font-medium">
                  {{ formatDate(vacancy.takedown_date) }}
                </p>
              </div>
            </div>
          </n-card>

          <!-- Footer Action -->
          <div class="bg-white rounded-xl shadow-sm p-6 flex justify-end">
            <n-button
              type="primary"
              color="#0014B2"
              @click="router.push(`/admin/lowongan/edit/${id}`)"
            >
              Edit
            </n-button>
          </div>
        </template>
      </div>
    </n-config-provider>
  </AdminLayout>
</template>
