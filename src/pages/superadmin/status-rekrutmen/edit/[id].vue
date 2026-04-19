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
import ColorPickerInput from '@/components/shared/ColorPickerInput.vue'
import { getRecruitmentStatusByIdApi, updateRecruitmentStatusApi } from '@/services/recruitment-status.service'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingData = ref(false)
const statusId = (route.params as any).id as string

const formData = reactive({
  name: '',
  hex_code: '#93C5FD',
  is_active: 1 as number, // Use number for NSelect compatibility
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Status wajib diisi', trigger: 'blur' },
  hex_code: { required: true, message: 'Hex Code wajib dipilih', trigger: 'change' },
}

const isFormReady = computed(() => {
  return formData.name.trim() !== '' && formData.hex_code !== ''
})

const fetchStatusData = async () => {
  isLoadingData.value = true
  try {
    const res = await getRecruitmentStatusByIdApi(statusId)
    const status = res.data
    formData.name = status.name
    formData.hex_code = status.hex_code
    formData.is_active = status.is_active ? 1 : 0
  } catch (err: any) {
    message.error(err.message || 'Gagal mengambil data status')
  } finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  fetchStatusData()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await updateRecruitmentStatusApi(statusId, {
          name: formData.name,
          hex_code: formData.hex_code,
          is_active: Boolean(formData.is_active),
        })
        message.success('Status Rekrutmen berhasil diperbarui')
        router.push('/superadmin/status-rekrutmen')
      } catch (err: any) {
        message.error(err.message || 'Gagal memperbarui status')
      } finally {
        isLoading.value = false
      }
    }
  })
}

const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
]
</script>

<template>
  <MasterDataFormLayout
    title="Edit Status Rekrutmen"
    back-url="/superadmin/status-rekrutmen"
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
        <n-form-item-gi label="Nama Status" path="name">
          <n-input 
            v-model:value="formData.name" 
            placeholder="Masukkan nama status (e.g. HR Interview, Technical Test)" 
          />
        </n-form-item-gi>

        <n-form-item-gi label="Hex Code" path="hex_code">
          <ColorPickerInput v-model:value="formData.hex_code" />
        </n-form-item-gi>

        <n-form-item-gi label="Status">
          <n-select
            v-model:value="formData.is_active"
            :options="statusOptions"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MasterDataFormLayout>
</template>
