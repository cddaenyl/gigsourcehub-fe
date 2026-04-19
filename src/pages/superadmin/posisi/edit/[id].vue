<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
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
import { getJobRoleByIdApi, updateJobRoleApi, getSectorsApi } from '@/services/job-role.service'
import type { Sector } from '@/models/JobRole'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingData = ref(false)
const isLoadingSectors = ref(false)
const sectors = ref<Sector[]>([])
const roleId = (route.params as any).id as string

const formData = reactive({
  name: '',
  sector_id: null as string | null,
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Posisi wajib diisi', trigger: 'blur' },
  sector_id: { required: true, message: 'Bidang wajib dipilih', trigger: 'change' },
}

const isFormReady = computed(() => {
  return formData.name.trim() !== '' && formData.sector_id !== null
})

const sectorOptions = computed(() => {
  return sectors.value.map(s => ({
    label: s.name,
    value: s.id
  }))
})

const fetchSectors = async () => {
  isLoadingSectors.value = true
  try {
    sectors.value = await getSectorsApi()
  } catch (err: any) {
    message.error(err.message || 'Gagal mengambil data bidang')
  } finally {
    isLoadingSectors.value = false
  }
}

const fetchRoleData = async () => {
  isLoadingData.value = true
  try {
    const role = await getJobRoleByIdApi(roleId)
    formData.name = role.name
    formData.sector_id = role.sector_id
  } catch (err: any) {
    message.error(err.message || 'Gagal mengambil data posisi')
  } finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  fetchSectors()
  fetchRoleData()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await updateJobRoleApi(roleId, {
          name: formData.name,
          sector_id: formData.sector_id!,
        })
        message.success('Posisi berhasil diperbarui')
        router.push('/superadmin/posisi')
      } catch (err: any) {
        message.error(err.message || 'Gagal memperbarui posisi')
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<template>
  <MasterDataFormLayout
    title="Edit Posisi"
    back-url="/superadmin/posisi"
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
        <n-form-item-gi label="Nama Posisi" path="name">
          <n-input 
            v-model:value="formData.name" 
            placeholder="Masukkan nama posisi (e.g. Frontend Developer, HR Manager)" 
          />
        </n-form-item-gi>

        <n-form-item-gi label="Bidang" path="sector_id">
          <n-select
            v-model:value="formData.sector_id"
            :options="sectorOptions"
            :loading="isLoadingSectors"
            placeholder="Pilih Bidang"
            filterable
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MasterDataFormLayout>
</template>
