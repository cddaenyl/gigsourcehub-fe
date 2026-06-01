<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDatePicker,
  NCard,
  NButton,
  NIcon,
  NTag,
  NSpin,
  NConfigProvider,
  useMessage,
  type FormRules,
} from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getJobVacancyByIdApi, updateJobVacancyApi } from '@/services/job-vacancy.service'
import type { JobVacancySchema } from '@/models/JobVacancy'
import { parseJobVacancyDescription, stringifyJobVacancyDescription } from '@/models/JobVacancy'



const router = useRouter()
const route = useRoute()
const message = useMessage()

const id = computed(() => (route.params as Record<string, string>).id ?? '')
const formRef = ref<InstanceType<typeof NForm> | null>(null)
const isLoading = ref(false)
const isFetching = ref(true)

// Konteks info (read-only, dari data yang dimuat)
const contextInfo = reactive({
  projectName: '',
  posisiName: '',
  bidang: '',
})

// Form fields
const formData = reactive({
  subrequest_id: '',
  name: '',
  schema: null as JobVacancySchema | null,
  overview: '',
  takedown_date: null as number | null,
})

// Auto-fill display fields (readonly)
const autoFillDuration = ref('')
const autoFillLevel = ref('')
const autoFillTechStack = ref<string[]>([])

// Tag fields
const jobDescTags = ref<string[]>([])
const qualificationsTags = ref<string[]>([])
const benefitsTags = ref<string[]>([])

// Tag inputs
const jobDescInput = ref('')
const qualificationsInput = ref('')
const benefitsInput = ref('')

const rules: FormRules = {
  name: { required: true, message: 'Judul lowongan wajib diisi', trigger: 'blur' },
}

function parseTechStack(techStack: string | null | undefined): string[] {
  if (!techStack) return []
  const cleaned = techStack.trim()
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch { /* noop */ }
  }
  return cleaned
    .replace(/[\[\]"']/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseDateToTimestamp(dateStr: string | null): number | null {
  if (!dateStr) return null
  return new Date(dateStr).getTime()
}

function toDateStr(ts: number | null): string | null {
  if (!ts) return null
  return new Date(ts).toISOString().substring(0, 10)
}

// Load data
const loadVacancy = async () => {
  if (!id.value) return
  isFetching.value = true
  try {
    const res = await getJobVacancyByIdApi(id.value)
    const v = res.data

    formData.subrequest_id = v.subrequest_id
    formData.name = v.name
    formData.schema = v.schema
    formData.overview = v.overview ?? ''
    formData.takedown_date = parseDateToTimestamp(v.takedown_date)

    // Isi konteks info dari subrequest yang sudah di-preload
    if (v.subrequest) {
      contextInfo.projectName = (v.subrequest as any).project_name ?? ''
      contextInfo.posisiName = v.subrequest.job_role ?? ''
      contextInfo.bidang = v.subrequest.bidang ?? ''
      autoFillLevel.value = v.subrequest.level ?? ''
      autoFillTechStack.value = parseTechStack(v.subrequest.tech_stack)
      autoFillDuration.value = (v.subrequest as any).project_duration ?? ''
    }

    // Parse description JSON
    const desc = parseJobVacancyDescription(v.description)
    jobDescTags.value = desc.job_desc
    qualificationsTags.value = desc.qualifications
    benefitsTags.value = desc.benefits
  } catch (err: unknown) {
    message.error(err instanceof Error ? err.message : 'Gagal memuat data lowongan')
    router.push('/admin/lowongan')
  } finally {
    isFetching.value = false
  }
}

watch(id, loadVacancy, { immediate: true })

// --- Tag helpers: specific per field ---
function addJobDescTag() {
  const v = jobDescInput.value.trim()
  if (!v || jobDescTags.value.includes(v)) { jobDescInput.value = ''; return }
  jobDescTags.value.push(v)
  jobDescInput.value = ''
}
function removeJobDescTag(tag: string) {
  jobDescTags.value = jobDescTags.value.filter((t) => t !== tag)
}
function handleJobDescKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addJobDescTag() }
}

function addQualificationsTag() {
  const v = qualificationsInput.value.trim()
  if (!v || qualificationsTags.value.includes(v)) { qualificationsInput.value = ''; return }
  qualificationsTags.value.push(v)
  qualificationsInput.value = ''
}
function removeQualificationsTag(tag: string) {
  qualificationsTags.value = qualificationsTags.value.filter((t) => t !== tag)
}
function handleQualificationsKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addQualificationsTag() }
}

function addBenefitsTag() {
  const v = benefitsInput.value.trim()
  if (!v || benefitsTags.value.includes(v)) { benefitsInput.value = ''; return }
  benefitsTags.value.push(v)
  benefitsInput.value = ''
}
function removeBenefitsTag(tag: string) {
  benefitsTags.value = benefitsTags.value.filter((t) => t !== tag)
}
function handleBenefitsKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addBenefitsTag() }
}

const isFormReady = computed(() => formData.name.trim() !== '')

const schemaOptions = [
  { label: 'Onsite', value: 'ONSITE' },
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
]

const handleSubmitWithStatus = (status: 'DRAFT' | 'PUBLISHED') => {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    isLoading.value = true
    try {
      const description = stringifyJobVacancyDescription({
        job_desc: jobDescTags.value,
        qualifications: qualificationsTags.value,
        benefits: benefitsTags.value,
      })
      await updateJobVacancyApi(id.value, {
        subrequest_id: formData.subrequest_id.trim(),
        name: formData.name.trim(),
        schema: formData.schema,
        overview: formData.overview.trim() || null,
        description,
        takedown_date: toDateStr(formData.takedown_date),
        status,
      })
      message.success(
        status === 'PUBLISHED' ? 'Lowongan berhasil dipublikasikan' : 'Draft berhasil disimpan',
      )
      router.push('/admin/lowongan')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan lowongan')
    } finally {
      isLoading.value = false
    }
  })
}

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
          <h1 class="text-xl font-bold text-[#1E293B]">Edit Lowongan</h1>
        </div>

        <!-- Loading -->
        <div v-if="isFetching" class="flex justify-center py-16">
          <n-spin size="large" />
        </div>

        <!-- Form -->
        <n-form
          v-else
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="top"
          size="medium"
        >
          <!-- Konteks Lowongan (read-only info) -->
          <n-card title="Konteks Lowongan" :bordered="false" class="rounded-xl shadow-sm mb-4">
            <div class="space-y-4">
              <n-form-item label="Nama Project / Kegiatan">
                <n-input :value="contextInfo.projectName || '—'" :disabled="true" />
              </n-form-item>
              <n-form-item label="Nama Posisi">
                <n-input :value="contextInfo.posisiName || '—'" :disabled="true" />
              </n-form-item>
              <n-form-item label="Bidang">
                <n-input :value="contextInfo.bidang || '—'" :disabled="true" />
              </n-form-item>
            </div>
          </n-card>

          <!-- Informasi Lowongan -->
          <n-card title="Informasi Lowongan" :bordered="false" class="rounded-xl shadow-sm mb-4">
            <div class="space-y-4">

              <n-form-item label="Judul" path="name">
                <n-input v-model:value="formData.name" placeholder="cth. Front End Developer Senior" />
              </n-form-item>

              <n-form-item label="Lokasi">
                <n-select
                  v-model:value="formData.schema"
                  :options="schemaOptions"
                  placeholder="Pilih lokasi kerja"
                  clearable
                />
              </n-form-item>

              <!-- Durasi (readonly) -->
              <n-form-item label="Durasi">
                <n-input
                  :value="autoFillDuration || 'Dari request'"
                  :disabled="true"
                />
              </n-form-item>

              <!-- Level Senioritas (readonly) -->
              <n-form-item label="Level Senioritas">
                <n-input
                  :value="autoFillLevel || '—'"
                  :disabled="true"
                />
              </n-form-item>

              <!-- Ringkasan Posisi -->
              <n-form-item label="Ringkasan Posisi">
                <n-input
                  v-model:value="formData.overview"
                  type="textarea"
                  placeholder="Deskripsi singkat tentang posisi ini"
                  :rows="4"
                />
              </n-form-item>

              <!-- Keahlian / Tech Stack (readonly chips) -->
              <n-form-item label="Keahlian / Tech Stack">
                <div class="w-full space-y-2">
                  <n-input value="Berdasarkan posisi yang dipilih" :disabled="true" />
                  <div v-if="autoFillTechStack.length > 0" class="flex flex-wrap gap-2 mt-1">
                    <n-tag
                      v-for="tag in autoFillTechStack"
                      :key="tag"
                      round
                      :color="{ color: '#C7D0F3', textColor: '#07229E' }"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </div>
              </n-form-item>

              <!-- Deskripsi Pekerjaan -->
              <n-form-item label="Deskripsi Pekerjaan">
                <div class="w-full space-y-2">
                  <n-input
                    v-model:value="jobDescInput"
                    placeholder="Tambahkan deskripsi pekerjaan lalu tekan Enter"
                    clearable
                    @keydown="handleJobDescKeydown"
                    @blur="addJobDescTag"
                  />
                  <div v-if="jobDescTags.length > 0" class="flex flex-wrap gap-2 mt-1">
                    <n-tag
                      v-for="tag in jobDescTags"
                      :key="tag"
                      closable
                      round
                      :color="{ color: '#EFF6FF', textColor: '#1E40AF' }"
                      @close="removeJobDescTag(tag)"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </div>
              </n-form-item>

              <!-- Kualifikasi Kandidat -->
              <n-form-item label="Kualifikasi Kandidat">
                <div class="w-full space-y-2">
                  <n-input
                    v-model:value="qualificationsInput"
                    placeholder="Tambahkan kualifikasi kandidat lalu tekan Enter"
                    clearable
                    @keydown="handleQualificationsKeydown"
                    @blur="addQualificationsTag"
                  />
                  <div v-if="qualificationsTags.length > 0" class="flex flex-wrap gap-2 mt-1">
                    <n-tag
                      v-for="tag in qualificationsTags"
                      :key="tag"
                      closable
                      round
                      :color="{ color: '#EFF6FF', textColor: '#1E40AF' }"
                      @close="removeQualificationsTag(tag)"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </div>
              </n-form-item>

              <!-- Keuntungan -->
              <n-form-item label="Keuntungan">
                <div class="w-full space-y-2">
                  <n-input
                    v-model:value="benefitsInput"
                    placeholder="Tambahkan keuntungan lalu tekan Enter"
                    clearable
                    @keydown="handleBenefitsKeydown"
                    @blur="addBenefitsTag"
                  />
                  <div v-if="benefitsTags.length > 0" class="flex flex-wrap gap-2 mt-1">
                    <n-tag
                      v-for="tag in benefitsTags"
                      :key="tag"
                      closable
                      round
                      :color="{ color: '#EFF6FF', textColor: '#1E40AF' }"
                      @close="removeBenefitsTag(tag)"
                    >
                      {{ tag }}
                    </n-tag>
                  </div>
                </div>
              </n-form-item>

            </div>
          </n-card>

          <!-- Pengaturan Publikasi -->
          <n-card title="Pengaturan Publikasi" :bordered="false" class="rounded-xl shadow-sm mb-4">
            <n-form-item label="Tanggal Penutupan">
              <n-date-picker
                v-model:value="formData.takedown_date"
                type="date"
                placeholder="DD/MM/YYYY"
                format="dd/MM/yyyy"
                clearable
                class="w-full"
              />
            </n-form-item>
          </n-card>

          <!-- Footer Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6 flex justify-end gap-3">
            <n-button
              :loading="isLoading"
              :disabled="!isFormReady || isLoading"
              @click="handleSubmitWithStatus('DRAFT')"
            >
              Simpan Draft
            </n-button>
            <n-button
              type="primary"
              color="#0014B2"
              :loading="isLoading"
              :disabled="!isFormReady || isLoading"
              @click="handleSubmitWithStatus('PUBLISHED')"
            >
              Publikasikan
            </n-button>
          </div>
        </n-form>
      </div>
    </n-config-provider>
  </AdminLayout>
</template>
