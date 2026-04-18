<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import {
  NForm,
  NInput,
  NSelect,
  NButton,
  NGrid,
  NFormItemGi,
  NIcon,
  NCard,
  useMessage,
  type FormRules,
} from 'naive-ui'
import { ChevronLeft } from '@vicons/tabler'
import { getSectorsApi } from '@/services/sector.service'
import { getJobTitlesApi } from '@/services/job-title.service'
import { getSystemRolesApi } from '@/services/role.service'
import { createUserApi } from '@/services/user.service'
import type { Sector } from '@/models/Sector'
import type { JobTitle } from '@/models/JobTitle'
import type { SystemRole } from '@/models/SystemRole'

const router = useRouter()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingRoles = ref(false)

const formData = reactive({
  name: '',
  email: '',
  password: '',
  system_role_id: null,
  job_title_id: null,
  assigned_role_id: null, // Still used for Bidang if needed, but we'll use Sector -> JobTitle here
  account_status: 'Active',
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Lengkap wajib diisi', trigger: 'blur' },
  email: [
    { required: true, message: 'Email valid wajib diisi', trigger: ['input', 'blur'] },
    { type: 'email', message: 'Format email tidak valid', trigger: ['input', 'blur'] }
  ],
  password: { required: true, message: 'Password wajib diisi', trigger: 'blur' },
  system_role_id: { required: true, message: 'Role wajib dipilih', trigger: 'change' },
}

const sectors = ref<Sector[]>([])
const jobTitles = ref<JobTitle[]>([])
const systemRoles = ref<SystemRole[]>([])
const selectedSectorId = ref<string | null>(null)

const isFormReady = computed(() => {
  return (
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.system_role_id !== null &&
    selectedSectorId.value !== null &&
    formData.job_title_id !== null
  )
})

const selectedRoleName = computed(() => {
  return systemRoles.value.find((r) => r.id === formData.system_role_id)?.name || ''
})

const filteredSectorsOptions = computed(() => {
  let list = sectors.value
  if (selectedRoleName.value === 'Admin') {
    // Admin MUST be Human Resources
    list = list.filter((s) => s.name === 'Human Resources')
  } else if (selectedRoleName.value === 'Employee') {
    // Pegawai MUST NOT be Human Resources
    list = list.filter((s) => s.name !== 'Human Resources')
  }
  return list.map((s) => ({ label: s.name, value: s.id }))
})

const filteredJobTitlesOptions = computed(() => {
  let list = jobTitles.value
  // Since sectors are already filtered, jobTitles returned by API for that sector 
  // should naturally follow the restriction. This is just extra safety.
  if (selectedRoleName.value !== 'Admin') {
    list = list.filter((j) => j.name !== 'HR')
  }
  return list.map((j) => ({ label: j.name, value: j.id }))
})

const fetchInitialData = async () => {
  isLoadingRoles.value = true
  try {
    const [secRes, roleRes] = await Promise.all([
      getSectorsApi({ limit: 100 }),
      getSystemRolesApi()
    ])
    sectors.value = secRes.data.list
    // Filter roles to only show Admin and Employee (Pegawai)
    systemRoles.value = roleRes.data.filter(r => r.name === 'Admin' || r.name === 'Employee')
  } catch (err: any) {
    message.error('Gagal mengambil data referensi')
  } finally {
    isLoadingRoles.value = false
  }
}

const fetchJobTitles = async (sectorId: string) => {
  try {
    const res = await getJobTitlesApi({ sector_id: sectorId, limit: 100 })
    jobTitles.value = res.data.list
  } catch (err) {
    message.error('Gagal mengambil data jabatan')
  }
}

watch(selectedSectorId, (newId) => {
  formData.job_title_id = null
  jobTitles.value = []
  if (newId) {
    fetchJobTitles(newId)
  }
})

watch(selectedRoleName, () => {
  // Always reset Bidang and Jabatan when role changes due to strict role-to-sector mapping
  selectedSectorId.value = null
  formData.job_title_id = null
  jobTitles.value = []
})

onMounted(() => {
  fetchInitialData()
})

const handleBack = () => {
  router.push('/superadmin/user-management')
}

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await createUserApi({
          ...formData,
        })
        message.success('User berhasil ditambahkan')
        router.push('/superadmin/user-management')
      } catch (err: any) {
        message.error(err.message || 'Gagal menambahkan user')
      } finally {
        isLoading.value = false
      }
    }
  })
}

const accountStatusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Blocked', value: 'Blocked' },
]
</script>

<template>
  <SuperAdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button 
          @click="handleBack"
          class="flex items-center justify-center w-8 h-8 rounded-full bg-[#0014B2] text-white hover:bg-blue-800 transition-colors"
        >
          <n-icon :component="ChevronLeft" size="20" />
        </button>
        <h1 class="text-xl font-bold text-[#1E293B]">Tambah Pengguna</h1>
      </div>

      <!-- Form Card -->
      <div class="p-6">
        <n-card :bordered="false" class="rounded-xl shadow-sm overflow-hidden p-0">
          <div class="p-8 pb-4">
            <n-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-placement="top"
              size="large"
            >
              <n-grid :cols="2" :x-gap="32" responsive="screen">
                <n-form-item-gi label="Nama Lengkap" path="name">
                  <n-input 
                    v-model:value="formData.name" 
                    placeholder="Masukkan nama lengkap pengguna" 
                    :input-props="{ autocomplete: 'none' }"
                  />
                </n-form-item-gi>

                <n-form-item-gi label="Bidang">
                  <n-select
                    v-model:value="selectedSectorId"
                    :options="filteredSectorsOptions"
                    placeholder="Pilih bidang"
                    :loading="isLoadingRoles"
                    clearable
                  />
                </n-form-item-gi>

                <n-form-item-gi label="Email Valid" path="email">
                  <n-input 
                    v-model:value="formData.email" 
                    placeholder="Masukkan email valid pengguna" 
                    :input-props="{ autocomplete: 'none' }"
                  />
                </n-form-item-gi>

                <n-form-item-gi label="Jabatan">
                  <n-select
                    v-model:value="formData.job_title_id"
                    :options="filteredJobTitlesOptions"
                    placeholder="Pilih jabatan"
                    :disabled="!selectedSectorId"
                  />
                </n-form-item-gi>

                <n-form-item-gi label="Password" path="password">
                  <n-input
                    v-model:value="formData.password"
                    type="password"
                    show-password-on="mousedown"
                    placeholder="Masukkan password"
                    :input-props="{ autocomplete: 'new-password' }"
                  />
                </n-form-item-gi>

                <n-form-item-gi label="Status Akun">
                  <n-select
                    v-model:value="formData.account_status"
                    :options="accountStatusOptions"
                  />
                </n-form-item-gi>

                <n-form-item-gi label="Role" path="system_role_id">
                  <n-select
                    v-model:value="formData.system_role_id"
                    :options="systemRoles.map(r => ({ label: r.name === 'Employee' ? 'Pegawai' : r.name, value: r.id }))"
                    placeholder="Pilih role"
                    :loading="isLoadingRoles"
                  />
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </div>

          <!-- Card Footer -->
          <div class="p-8">
            <div class="bg-gray-50 p-8 py-6 flex justify-end">
              <n-button 
                type="primary" 
                :color="isFormReady ? '#0014B2' : '#E2E8F0'" 
                :text-color="isFormReady ? '#FFFFFF' : '#475569'"
                class="font-semibold px-8"
                :loading="isLoading"
                :disabled="!isFormReady"
                @click="handleSubmit"
              >
                Tambahkan Pengguna
              </n-button>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </SuperAdminLayout>
</template>

<style scoped>
:deep(.n-form-item-label) {
  color: #1E293B;
  font-weight: 600;
  font-size: 14px;
}

:deep(.n-input), :deep(.n-select) {
  --n-border-radius: 6px;
}

:deep(.n-card__content) {
  padding: 0 !important;
}
</style>
