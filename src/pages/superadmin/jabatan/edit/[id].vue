<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
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
import { getJobTitleByIdApi, updateJobTitleApi } from '@/services/job-title.service'
import { getSectorsApi } from '@/services/job-role.service'
import type { Sector } from '@/models/JobRole'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingData = ref(false)
const isLoadingSectors = ref(false)
const sectors = ref<Sector[]>([])
const titleId = (route.params as any).id as string

const formData = reactive({
  name: '',
  sector_id: null as string | null,
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Jabatan wajib diisi', trigger: 'blur' },
  sector_id: { required: true, message: 'Bidang wajib dipilih', trigger: 'change' },
}

const isFormReady = computed(() => {
  return formData.name.trim() !== '' && formData.sector_id !== null
})

const sectorOptions = computed(() => buildMasterDataOptions(sectors.value))

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

const fetchTitleData = async () => {
  isLoadingData.value = true
  try {
    const title = await getJobTitleByIdApi(titleId)
    formData.name = title.name
    formData.sector_id = title.sector_id
  } catch (err: any) {
    message.error(err.message || 'Gagal mengambil data jabatan')
  } finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  fetchSectors()
  fetchTitleData()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await updateJobTitleApi(titleId, {
          name: formData.name,
          sector_id: formData.sector_id!,
        })
        message.success('Jabatan berhasil diperbarui')
        router.push('/superadmin/jabatan')
      } catch (err: any) {
        message.error(err.message || 'Gagal memperbarui jabatan')
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<template>
  <MasterDataFormLayout
    title="Edit Jabatan"
    back-url="/superadmin/jabatan"
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
        <n-form-item-gi label="Nama Jabatan" path="name">
          <n-input 
            v-model:value="formData.name" 
            placeholder="Masukkan nama jabatan (e.g. Chief Executive Officer, Manager)" 
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
