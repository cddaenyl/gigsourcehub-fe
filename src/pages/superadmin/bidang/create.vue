<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NForm,
  NSelect,
  NGrid,
  NFormItemGi,
  useMessage,
  type FormRules,
} from 'naive-ui'
import MasterDataFormLayout from '@/components/shared/MasterDataFormLayout.vue'
import ColorPickerInput from '@/components/shared/ColorPickerInput.vue'
import { createSectorApi } from '@/services/sector.service'

const router = useRouter()
const message = useMessage()
const formRef = ref<any>(null)
const isLoading = ref(false)

const formData = reactive({
  name: '',
  hex_code: '#0014B2',
  is_active: 1, // Use number for NSelect compatibility
})

const rules: FormRules = {
  name: { required: true, message: 'Nama Bidang wajib diisi', trigger: 'blur' },
  hex_code: { required: true, message: 'Hex Code wajib dipilih', trigger: 'change' },
}

const isFormReady = computed(() => {
  return formData.name.trim() !== '' && formData.hex_code !== ''
})

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors: any) => {
    if (!errors) {
      isLoading.value = true
      try {
        await createSectorApi({
          name: formData.name,
          hex_code: formData.hex_code,
          is_active: Boolean(formData.is_active),
        })
        message.success('Bidang berhasil ditambahkan')
        router.push('/superadmin/bidang')
      } catch (err: any) {
        message.error(err.message || 'Gagal menambahkan bidang')
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
    title="Tambah Bidang"
    back-url="/superadmin/bidang"
    submit-text="Tambahkan Bidang"
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
        <n-form-item-gi label="Nama Bidang" path="name">
          <n-input 
            v-model:value="formData.name" 
            placeholder="Masukkan nama bidang (e.g. Technology, Finance)" 
          />
        </n-form-item-gi>

        <n-form-item-gi label="Hex Code" path="hex_code">
          <ColorPickerInput v-model:value="formData.hex_code" />
        </n-form-item-gi>

        <n-form-item-gi label="Status Bidang">
          <n-select
            v-model:value="formData.is_active"
            :options="statusOptions"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </MasterDataFormLayout>
</template>
