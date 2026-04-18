<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
  NForm,
  NInput,
  NSelect,
  NButton,
  NGrid,
  NFormItemGi,
  useMessage,
} from 'naive-ui'
import { getSystemRolesApi } from '@/services/role.service'
import { getRolesApi } from '@/services/role.service'
import type { SystemRole } from '@/models/SystemRole'
import type { Role } from '@/models/Role'

const props = defineProps<{
  initialValues?: any
  loading?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])

const message = useMessage()
const formRef = ref<any>(null)

const formData = reactive({
  name: props.initialValues?.name || '',
  email: props.initialValues?.email || '',
  password: '',
  system_role_id: props.initialValues?.system_role_id || null,
  assigned_role_id: props.initialValues?.assigned_role_id || null,
  account_status: props.initialValues?.account_status || 'Active',
})

const rules = {
  name: {
    required: true,
    message: 'Nama wajib diisi',
    trigger: ['input', 'blur'],
  },
  email: {
    required: true,
    message: 'Email wajib diisi',
    trigger: ['input', 'blur'],
  },
  password: {
    required: true,
    message: 'Password wajib diisi',
    trigger: ['input', 'blur'],
  },
  system_role_id: {
    required: true,
    message: 'System Role wajib dipilih',
    trigger: ['change', 'blur'],
  },
}

const systemRoles = ref<SystemRole[]>([])
const assignedRoles = ref<Role[]>([])
const isLoadingRoles = ref(false)

const fetchRoles = async () => {
  isLoadingRoles.value = true
  try {
    const [sysRes, assignedRes] = await Promise.all([getSystemRolesApi(), getRolesApi()])
    systemRoles.value = sysRes.data
    assignedRoles.value = assignedRes.data.list
  } catch (err: any) {
    message.error('Gagal mengambil data role')
  } finally {
    isLoadingRoles.value = false
  }
}

onMounted(() => {
  fetchRoles()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      emit('submit', { ...formData })
    } else {
      message.error('Mohon lengkapi form dengan benar')
    }
  })
}

const accountStatusOptions = [
  { label: 'Aktif', value: 'Active' },
  { label: 'Non-aktif', value: 'Inactive' },
  { label: 'Blocked', value: 'Blocked' },
]
</script>

<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    size="medium"
    class="space-y-2"
  >
    <n-grid :cols="2" :x-gap="24">
      <n-form-item-gi span="2" label="Nama Lengkap" path="name">
        <n-input v-model:value="formData.name" placeholder="Contoh: John Doe" />
      </n-form-item-gi>

      <n-form-item-gi span="2" label="Email" path="email">
        <n-input v-model:value="formData.email" placeholder="Contoh: john@example.com" />
      </n-form-item-gi>

      <n-form-item-gi label="Password" path="password">
        <n-input
          v-model:value="formData.password"
          type="password"
          show-password-on="mousedown"
          placeholder="Masukkan password"
        />
      </n-form-item-gi>

      <n-form-item-gi label="System Role" path="system_role_id">
        <n-select
          v-model:value="formData.system_role_id"
          :options="systemRoles.map((r) => ({ label: r.name, value: r.id }))"
          placeholder="Pilih Role"
          :loading="isLoadingRoles"
        />
      </n-form-item-gi>

      <n-form-item-gi label="Assigned Role (Bidang)" path="assigned_role_id">
        <n-select
          v-model:value="formData.assigned_role_id"
          :options="assignedRoles.map((r) => ({ label: r.name, value: r.id }))"
          placeholder="Pilih Bidang"
          :loading="isLoadingRoles"
          clearable
        />
      </n-form-item-gi>

      <n-form-item-gi label="Status Akun" path="account_status">
        <n-select
          v-model:value="formData.account_status"
          :options="accountStatusOptions"
          placeholder="Pilih Status"
        />
      </n-form-item-gi>
    </n-grid>

    <div class="flex justify-end gap-3 mt-8">
      <n-button @click="emit('cancel')">Batal</n-button>
      <n-button type="primary" color="#0014B2" :loading="props.loading" @click="handleSubmit">
        Simpan User
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>
:deep(.n-form-item-label) {
  color: #4b5563;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
</style>
