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
  NConfigProvider,
  useMessage,
  type FormRules,
} from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { createJobVacancyApi } from '@/services/job-vacancy.service'
import type { JobVacancySchema } from '@/models/JobVacancy'
import { getAdminRequestsApi } from '@/services/request.service'
import type { RequestItem } from '@/models/Request'

const router = useRouter()
const message = useMessage()
const formRef = ref<InstanceType<typeof NForm> | null>(null)
const isLoading = ref(false)

const formData = reactive({
  subrequest_id: '',
  name: '',
  schema: null as JobVacancySchema | null,
  overview: '',
  description: '',
  takedown_date: null as number | null, // NDatePicker uses timestamp
})

const rules: FormRules = {
  subrequest_id: {
    required: true,
    message: 'Subrequest ID wajib diisi',
    trigger: 'blur',
  },
  name: {
    required: true,
    message: 'Judul lowongan wajib diisi',
    trigger: 'blur',
  },
}

const selectedRequestId = ref<string | null>(null)
const requests = ref<RequestItem[]>([])

onMounted(async () => {
  try {
    const res = await getAdminRequestsApi({ limit: 1000 })
    requests.value = res.data.list
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil data request'
    message.error(msg)
  }
})

const activeRequests = computed(() => {
  const todayStr = new Date().toISOString().substring(0, 10)
  return requests.value.filter((req) => {
    const dateOnly = req.due_date ? req.due_date.substring(0, 10) : ''
    return dateOnly >= todayStr
  })
})

const requestOptions = computed(() => {
  return activeRequests.value.map((req) => ({
    label: `${req.project_name} (Due: ${new Date(req.due_date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })})`,
    value: req.id,
  }))
})

const selectedRequest = computed(() => {
  return requests.value.find((req) => req.id === selectedRequestId.value)
})

const subrequestOptions = computed(() => {
  if (!selectedRequest.value) return []
  return selectedRequest.value.subrequests.map((sub) => {
    const roleAndLevel = sub.level ? `${sub.job_role} - ${sub.level}` : sub.job_role
    const label = sub.is_filled ? `${roleAndLevel} (Filled)` : roleAndLevel
    return {
      label,
      value: sub.id,
      disabled: sub.is_filled === true,
    }
  })
})

watch(selectedRequestId, () => {
  formData.subrequest_id = ''
})

watch(
  () => formData.subrequest_id,
  (newVal) => {
    if (!newVal) {
      formData.name = ''
      formData.overview = ''
      formData.description = ''
      formData.takedown_date = null
      return
    }
    const sub = selectedRequest.value?.subrequests.find((s) => s.id === newVal)
    if (sub) {
      formData.name = [sub.job_role, sub.level].filter(Boolean).join(' ')
      formData.overview = sub.overview || ''
      formData.description = sub.notes || ''
      if (selectedRequest.value?.due_date) {
        formData.takedown_date = new Date(selectedRequest.value.due_date).getTime()
      }
    }
  },
)

const isFormReady = computed(
  () => formData.subrequest_id.trim() !== '' && formData.name.trim() !== '',
)

const schemaOptions = [
  { label: 'Onsite', value: 'ONSITE' },
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
]

function toDateStr(ts: number | null): string | null {
  if (!ts) return null
  const iso = new Date(ts).toISOString()
  return iso.substring(0, 10)
}

const handleSubmitWithStatus = (status: 'DRAFT' | 'PUBLISHED') => {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    isLoading.value = true
    try {
      await createJobVacancyApi({
        subrequest_id: formData.subrequest_id.trim(),
        name: formData.name.trim(),
        schema: formData.schema,
        overview: formData.overview.trim() !== '' ? formData.overview.trim() : null,
        description: formData.description.trim() !== '' ? formData.description.trim() : null,
        takedown_date: toDateStr(formData.takedown_date),
        status,
      })
      message.success(
        status === 'PUBLISHED' ? 'Lowongan berhasil dipublikasikan' : 'Draft berhasil disimpan',
      )
      router.push('/admin/lowongan')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan lowongan'
      message.error(msg)
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

        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="top"
          size="medium"
        >
          <!-- Section: Konteks Lowongan -->
          <n-card
            title="Konteks Lowongan"
            :bordered="false"
            class="rounded-xl shadow-sm mb-4"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <n-form-item label="Pilih Request" required>
                <n-select
                  v-model:value="selectedRequestId"
                  :options="requestOptions"
                  placeholder="Pilih Request Proyek"
                  filterable
                  clearable
                />
              </n-form-item>

              <n-form-item label="Pilih Subrequest" path="subrequest_id">
                <n-select
                  v-model:value="formData.subrequest_id"
                  :options="subrequestOptions"
                  placeholder="Pilih Subrequest (Kebutuhan Posisi)"
                  :disabled="!selectedRequestId"
                  filterable
                  clearable
                />
              </n-form-item>
            </div>
          </n-card>

          <!-- Section: Informasi Lowongan -->
          <n-card
            title="Informasi Lowongan"
            :bordered="false"
            class="rounded-xl shadow-sm mb-4"
          >
            <div class="space-y-4">
              <n-form-item label="Judul" path="name">
                <n-input
                  v-model:value="formData.name"
                  placeholder="cth. Front End Developer Senior"
                />
              </n-form-item>

              <n-form-item label="Lokasi">
                <n-select
                  v-model:value="formData.schema"
                  :options="schemaOptions"
                  placeholder="Pilih lokasi kerja"
                  clearable
                />
              </n-form-item>

              <n-form-item label="Ringkasan Posisi">
                <n-input
                  v-model:value="formData.overview"
                  type="textarea"
                  placeholder="Deskripsi singkat tentang posisi ini"
                  :rows="4"
                />
              </n-form-item>

              <n-form-item label="Deskripsi Pekerjaan">
                <n-input
                  v-model:value="formData.description"
                  placeholder="Tambahkan deskripsi pekerjaan"
                />
              </n-form-item>
            </div>
          </n-card>

          <!-- Section: Pengaturan Publikasi -->
          <n-card
            title="Pengaturan Publikasi"
            :bordered="false"
            class="rounded-xl shadow-sm mb-4"
          >
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
