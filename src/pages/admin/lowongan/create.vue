<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
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
  NConfigProvider,
  useMessage,
  type FormRules,
} from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { createJobVacancyApi } from '@/services/job-vacancy.service'
import type { JobVacancySchema } from '@/models/JobVacancy'
import { stringifyJobVacancyDescription } from '@/models/JobVacancy'
import { getAdminRequestsApi } from '@/services/request.service'
import type { RequestItem } from '@/models/Request'

const router = useRouter()
const message = useMessage()
const formRef = ref<InstanceType<typeof NForm> | null>(null)
const isLoading = ref(false)

// --- Data ---
const requests = ref<RequestItem[]>([])
const selectedRequestId = ref<string | null>(null)

// --- Form Data ---
const formData = reactive({
  subrequest_id: '',
  name: '',
  schema: null as JobVacancySchema | null,
  overview: '',
  takedown_date: null as number | null,
})

// --- Tag Fields ---
const jobDescTags = ref<string[]>([])
const qualificationsTags = ref<string[]>([])
const benefitsTags = ref<string[]>([])

// --- Tag Inputs ---
const jobDescInput = ref('')
const qualificationsInput = ref('')
const benefitsInput = ref('')

// --- Read-only autofill fields ---
const autoFillBidang = ref('')
const autoFillDuration = ref('')
const autoFillLevel = ref('')
const autoFillTechStack = ref<string[]>([])

const rules: FormRules = {
  subrequest_id: { required: true, message: 'Posisi wajib dipilih', trigger: 'blur' },
  name: { required: true, message: 'Judul lowongan wajib diisi', trigger: 'blur' },
}

onMounted(async () => {
  try {
    const requestsData = await getAdminRequestsApi({ limit: 1000 })
    requests.value = requestsData.data.list
  } catch (err: unknown) {
    message.error(err instanceof Error ? err.message : 'Gagal mengambil data')
  }
})

// --- Options ---
const activeRequests = computed(() => {
  const todayStr = new Date().toISOString().substring(0, 10)
  return requests.value.filter((req) => {
    const dateOnly = req.due_date ? req.due_date.substring(0, 10) : ''
    return dateOnly >= todayStr
  })
})

const requestOptions = computed(() =>
  activeRequests.value.map((req) => ({
    label: `${req.project_name} (Due: ${new Date(req.due_date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })})`,
    value: req.id,
  })),
)

const selectedRequest = computed(() =>
  requests.value.find((req) => req.id === selectedRequestId.value),
)

const subrequestOptions = computed(() => {
  if (!selectedRequest.value) return []
  return selectedRequest.value.subrequests.map((sub) => {
    const roleAndLevel = sub.level ? `${sub.job_role} - ${sub.level}` : sub.job_role
    const label = sub.is_filled ? `${roleAndLevel} (Terpenuhi)` : roleAndLevel
    return { label, value: sub.id, disabled: sub.is_filled === true }
  })
})

// --- Watchers ---
watch(selectedRequestId, () => {
  formData.subrequest_id = ''
  clearAutoFill()
})

watch(
  () => formData.subrequest_id,
  (newVal) => {
    if (!newVal) { clearAutoFill(); return }
    const sub = selectedRequest.value?.subrequests.find((s) => s.id === newVal)
    if (sub) {
      formData.name = [sub.job_role, sub.level].filter(Boolean).join(' ')
      formData.overview = sub.overview || ''
      autoFillLevel.value = sub.level || ''
      autoFillBidang.value = sub.bidang || ''
      autoFillTechStack.value = parseTechStack(sub.tech_stack)
      
      // Clear tag fields because description, qualifications, and benefits are manually filled by Admin
      jobDescTags.value = []
      qualificationsTags.value = []
      benefitsTags.value = []

      if (selectedRequest.value?.project_duration) {
        autoFillDuration.value = selectedRequest.value.project_duration
      }
      if (selectedRequest.value?.due_date) {
        formData.takedown_date = new Date(selectedRequest.value.due_date).getTime()
      }
    }
  },
)

function clearAutoFill() {
  autoFillDuration.value = ''
  autoFillLevel.value = ''
  autoFillBidang.value = ''
  autoFillTechStack.value = []
  formData.name = ''
  formData.overview = ''
  jobDescTags.value = []
  qualificationsTags.value = []
  benefitsTags.value = []
  formData.takedown_date = null
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

// Qualifications
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

// Benefits
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

// --- Utilities ---
function toDateStr(ts: number | null): string | null {
  if (!ts) return null
  return new Date(ts).toISOString().substring(0, 10)
}

const isFormReady = computed(
  () => formData.subrequest_id.trim() !== '' && formData.name.trim() !== '',
)

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
      await createJobVacancyApi({
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
          <h1 class="text-xl font-bold text-[#1E293B]">Tambah Lowongan</h1>
        </div>

        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top" size="medium">

          <!-- Konteks Lowongan -->
          <n-card title="Konteks Lowongan" :bordered="false" class="rounded-xl shadow-sm mb-4">
            <div class="space-y-4">
              <!-- Nama Project / Kegiatan -->
              <n-form-item label="Nama Project / Kegiatan" required>
                <n-select
                  v-model:value="selectedRequestId"
                  :options="requestOptions"
                  placeholder="Pilih Project / Kegiatan"
                  filterable
                  clearable
                />
              </n-form-item>

              <!-- Nama Posisi -->
              <n-form-item label="Nama Posisi" path="subrequest_id">
                <n-select
                  v-model:value="formData.subrequest_id"
                  :options="subrequestOptions"
                  placeholder="Pilih posisi"
                  filterable
                  clearable
                  :disabled="!selectedRequestId"
                />
              </n-form-item>

              <!-- Bidang -->
              <n-form-item label="Bidang" v-if="formData.subrequest_id">
                <n-input
                  :value="autoFillBidang || '—'"
                  :disabled="true"
                  placeholder="Berdasarkan posisi yang dipilih"
                />
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

              <!-- Durasi (readonly autofill) -->
              <n-form-item label="Durasi">
                <n-input
                  :value="autoFillDuration || 'Berdasarkan posisi yang dipilih'"
                  :disabled="true"
                  placeholder="Berdasarkan posisi yang dipilih"
                />
              </n-form-item>

              <!-- Level Senioritas (readonly autofill) -->
              <n-form-item label="Level Senioritas">
                <n-input
                  :value="autoFillLevel || 'Berdasarkan posisi yang dipilih'"
                  :disabled="true"
                  placeholder="Berdasarkan posisi yang dipilih"
                />
              </n-form-item>

              <!-- Ringkasan Posisi (autofill, editable) -->
              <n-form-item label="Ringkasan Posisi">
                <n-input
                  v-model:value="formData.overview"
                  type="textarea"
                  placeholder="Berdasarkan posisi yang dipilih"
                  :rows="4"
                />
              </n-form-item>

              <!-- Keahlian / Tech Stack (readonly autofill chips) -->
              <n-form-item label="Keahlian / Tech Stack">
                <div class="w-full space-y-2">
                  <n-input
                    :value="'Berdasarkan posisi yang dipilih'"
                    :disabled="true"
                    placeholder="Berdasarkan posisi yang dipilih"
                  />
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
