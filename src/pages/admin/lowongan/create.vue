<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
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
            <div class="space-y-4">
              <n-form-item label="Subrequest ID" path="subrequest_id">
                <n-input
                  v-model:value="formData.subrequest_id"
                  placeholder="Masukkan UUID subrequest (akan diganti dropdown nanti)"
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
