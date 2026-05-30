<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { buildMasterDataOptions } from '@/utils/masterDataOptions'
import { useRouter, useRoute } from 'vue-router'
import {
  NForm,
  NInput,
  NSelect,
  NGrid,
  NFormItemGi,
  useMessage,
  type FormRules,
} from 'naive-ui'
import MasterDataFormLayout from '@/components/shared/MasterDataFormLayout.vue'
import { getSectorsApi } from '@/services/sector.service'
import { getJobTitlesApi } from '@/services/job-title.service'
import { getSystemRolesApi } from '@/services/role.service'
import { getUserByIdApi, updateUserBySuperadminApi } from '@/services/user.service'
import type { Sector } from '@/models/Sector'
import type { JobTitle } from '@/models/JobTitle'
import type { SystemRole } from '@/models/SystemRole'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingData = ref(false)
const userId = (route.params as any).id as string

const formData = reactive({
  name: '',
  email: '',
  system_role_id: null as string | null,
  job_title_id: null as string | null,
  assigned_role_id: null as string | null,
  account_status: 'Active',
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Lengkap wajib diisi', trigger: 'blur' },
  email: [
    { required: true, message: 'Email valid wajib diisi', trigger: ['input', 'blur'] },
    { type: 'email', message: 'Format email tidak valid', trigger: ['input', 'blur'] }
  ],
  system_role_id: { required: true, message: 'Role wajib dipilih', trigger: 'change' },
}

const sectors = ref<Sector[]>([])
const allJobTitles = ref<JobTitle[]>([])
const jobTitlesInSelectedSector = ref<JobTitle[]>([])
const systemRoles = ref<SystemRole[]>([])
const selectedSectorId = ref<string | null>(null)

const isFormReady = computed(() => {
  return (
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
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
    list = list.filter((s) => s.name === 'Human Resources')
  } else if (selectedRoleName.value === 'Employee') {
    list = list.filter((s) => s.name !== 'Human Resources')
  }
  return buildMasterDataOptions(list)
})

const filteredJobTitlesOptions = computed(() => {
  let list = jobTitlesInSelectedSector.value
  if (selectedRoleName.value !== 'Admin') {
    list = list.filter((j) => j.name !== 'HR')
  }
  return buildMasterDataOptions(list)
})

const fetchInitialData = async () => {
  isLoadingData.value = true
  try {
    const [secRes, roleRes, userRes, jtRes] = await Promise.all([
      getSectorsApi({ limit: 100 }),
      getSystemRolesApi(),
      getUserByIdApi(userId),
      getJobTitlesApi({ limit: 1000 }) // Fetch all to find sector of existing job title
    ])
    
    sectors.value = secRes.data.list
    systemRoles.value = roleRes.data.filter(r => r.name === 'Admin' || r.name === 'Employee')
    allJobTitles.value = jtRes.data.list

    const user = userRes.data
    formData.name = user.name
    formData.email = user.email
    formData.account_status = user.account_status || 'Active'
    
    // Set Role ID from Role Name if ID is missing in response
    if (user.system_role_id) {
       formData.system_role_id = user.system_role_id
    } else if (user.system_role_name) {
       formData.system_role_id = roleRes.data.find(r => r.name === user.system_role_name)?.id || null
    }

    if (user.job_title_id) {
       formData.job_title_id = user.job_title_id
       const jt = allJobTitles.value.find(j => j.id === user.job_title_id)
       if (jt) {
         selectedSectorId.value = jt.sector_id
       }
    }
  } catch (err: any) {
    message.error('Gagal mengambil data')
  } finally {
    isLoadingData.value = false
  }
}

const fetchJobTitlesForSector = async (sectorId: string) => {
  try {
    const res = await getJobTitlesApi({ sector_id: sectorId, limit: 100 })
    jobTitlesInSelectedSector.value = res.data.list
  } catch (err) {
    message.error('Gagal mengambil data jabatan')
  }
}

watch(selectedSectorId, (newId) => {
  // Only reset if it's a manual change, but on initial load we might want to keep it.
  // Actually, simpler to just fetch when it changes.
  if (newId) {
    fetchJobTitlesForSector(newId)
  } else {
    jobTitlesInSelectedSector.value = []
  }
})

watch(selectedRoleName, (newRole, oldRole) => {
  // Only reset if it's changing after initial load
  if (oldRole && newRole !== oldRole) {
    selectedSectorId.value = null
    formData.job_title_id = null
    jobTitlesInSelectedSector.value = []
  }
})

onMounted(() => {
  fetchInitialData()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await updateUserBySuperadminApi(userId, {
          name: formData.name,
          assigned_role_id: formData.assigned_role_id,
          account_status: formData.account_status,
          // Since backend EditUser only supports these, other fields might be ignored
          // but we provide them anyway if backend is ever updated.
          system_role_id: formData.system_role_id,
          job_title_id: formData.job_title_id,
        })
        message.success('User berhasil diperbarui')
        router.push('/superadmin/user-management')
      } catch (err: any) {
        message.error(err.message || 'Gagal memperbarui user')
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
  <MasterDataFormLayout
    title="Edit Pengguna"
    submit-text="Simpan Perubahan"
    :loading="isLoading"
    :is-ready="isFormReady"
    @submit="handleSubmit"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
      size="large"
      :loading="isLoadingData"
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
            clearable
          />
        </n-form-item-gi>

        <n-form-item-gi label="Email Valid" path="email">
          <n-input 
            v-model:value="formData.email" 
            disabled
            placeholder="Email tidak dapat diubah" 
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

        <n-form-item-gi label="Password (Opsional)">
          <n-input
            disabled
            placeholder="Password tidak dapat diubah di sini"
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
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MasterDataFormLayout>
</template>
