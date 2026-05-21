<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NForm,
  NGrid,
  NFormItemGi,
  NInput,
  NSelect,
  useMessage,
  type FormRules,
} from 'naive-ui'
import MasterDataFormLayout from '@/components/shared/MasterDataFormLayout.vue'
import ColorPickerInput from '@/components/shared/ColorPickerInput.vue'
import {
  getInterviewStageByIdApi,
  updateInterviewStageApi,
} from '@/services/interview-stage.service'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)
const isLoadingData = ref(false)
const stageId = (route.params as any).id as string

const formData = reactive({
  name: '',
  hex_code: '#93C5FD',
  is_active: 1,
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Tahap Interview wajib diisi', trigger: 'blur' },
  hex_code: { required: true, message: 'Hex Code wajib dipilih', trigger: 'change' },
}

const isFormReady = computed(() => {
  return formData.name.trim() !== '' && formData.hex_code !== ''
})

const fetchStageData = async () => {
  isLoadingData.value = true
  try {
    const stage = await getInterviewStageByIdApi(stageId)
    formData.name = stage.name
    formData.hex_code = stage.hex_code || '#93C5FD'
    formData.is_active = stage.is_active ? 1 : 0
  } catch (err: any) {
    message.error(err.message || 'Gagal mengambil data tahap interview')
  } finally {
    isLoadingData.value = false
  }
}

onMounted(() => {
  fetchStageData()
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await updateInterviewStageApi(stageId, {
          name: formData.name,
          hex_code: formData.hex_code,
          is_active: Boolean(formData.is_active),
        })
        message.success('Tahap interview berhasil diperbarui')
        router.push('/superadmin/interview-stages')
      } catch (err: any) {
        message.error(err.message || 'Gagal memperbarui tahap interview')
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
    title="Edit Tahap Interview"
    back-url="/superadmin/interview-stages"
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
        <n-form-item-gi label="Nama Tahap Interview" path="name">
          <n-input
            v-model:value="formData.name"
            placeholder="Masukkan nama tahap interview, misalnya HR Interview"
          />
        </n-form-item-gi>

        <n-form-item-gi label="Hex Code" path="hex_code">
          <ColorPickerInput v-model:value="formData.hex_code" />
        </n-form-item-gi>

        <n-form-item-gi label="Status">
          <n-select v-model:value="formData.is_active" :options="statusOptions" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MasterDataFormLayout>
</template>
