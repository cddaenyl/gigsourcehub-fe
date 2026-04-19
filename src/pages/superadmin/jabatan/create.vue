<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
import { createJobTitleApi } from '@/services/job-title.service'
import { getSectorsApi } from '@/services/job-role.service'
import type { Sector } from '@/models/JobRole'

const router = useRouter()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingSectors = ref(false)
const sectors = ref<Sector[]>([])

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

onMounted(() => {
  fetchSectors()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await createJobTitleApi({
          name: formData.name,
          sector_id: formData.sector_id!,
        })
        message.success('Jabatan berhasil ditambahkan')
        router.push('/superadmin/jabatan')
      } catch (err: any) {
        message.error(err.message || 'Gagal menambahkan jabatan')
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<template>
  <MasterDataFormLayout
    title="Tambah Jabatan"
    back-url="/superadmin/jabatan"
    submit-text="Tambah Jabatan"
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
