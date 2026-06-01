<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NCard, NSwitch, NText, useMessage, NSpin, NUpload, NUploadDragger, NButton, NIcon } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import { CloudUpload, Download, FileText } from '@vicons/tabler'
import SuperAdminLayout from '../../../layouts/SuperAdminLayout.vue'
import { fetchSystemSettings, updateSystemSettings, uploadCvTemplate } from '../../../services/system-setting'

const message = useMessage()
const isAiEnabled = ref(false)
const isLoading = ref(true)
const isUpdating = ref(false)
const isUploadingTemplate = ref(false)
const cvTemplateUrl = ref('')
const cvTemplatePath = ref('')
const fileList = ref<UploadFileInfo[]>([])

const loadSettings = async () => {
  try {
    isLoading.value = true
    const data = await fetchSystemSettings()
    isAiEnabled.value = data.is_ai_mode_enabled
    cvTemplateUrl.value = data.cv_template_url || ''
    cvTemplatePath.value = data.cv_template_path || ''
  } catch (error: any) {
    message.error('Failed to load system settings')
  } finally {
    isLoading.value = false
  }
}

const handleToggleAi = async (value: boolean) => {
  try {
    isUpdating.value = true
    await updateSystemSettings({ is_ai_mode_enabled: value })
    isAiEnabled.value = value
    message.success(`AI Module ${value ? 'enabled' : 'disabled'} successfully`)
  } catch (error: any) {
    message.error('Failed to update AI settings')
    // Revert on failure
    isAiEnabled.value = !value
  } finally {
    isUpdating.value = false
  }
}

const handleUploadChange = async (options: { file: UploadFileInfo }) => {
  const fileObj = options.file.file
  if (!fileObj) return

  // Validate extension
  if (!fileObj.name.toLowerCase().endsWith('.docx')) {
    message.error('Only .docx files are allowed')
    fileList.value = []
    return
  }

  try {
    isUploadingTemplate.value = true
    const res = await uploadCvTemplate(fileObj)
    cvTemplateUrl.value = res.cv_template_url
    message.success('CV Template uploaded successfully')
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error.message || 'Failed to upload CV Template'
    message.error(errorMsg)
  } finally {
    isUploadingTemplate.value = false
    fileList.value = []
  }
}

const downloadTemplate = () => {
  if (cvTemplateUrl.value) {
    window.open(cvTemplateUrl.value, '_blank')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <SuperAdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">System Settings</h1>
      </div>

      <n-spin :show="isLoading">
        <div class="space-y-6">
          <n-card class="shadow-sm border-none rounded-xl">
            <div class="flex items-center justify-between p-2">
              <div class="max-w-xl">
                <n-text class="text-lg font-semibold block mb-1">
                  Enable AI Module
                </n-text>
                <n-text depth="3" class="text-sm">
                  Mengaktifkan fitur AI untuk parsing CV dan pencarian kandidat secara otomatis. 
                  Jika dinonaktifkan, sistem berjalan tanpa pemrosesan AI.
                </n-text>
              </div>
              
              <n-switch 
                :value="isAiEnabled" 
                :loading="isUpdating"
                @update:value="handleToggleAi"
                size="large"
              />
            </div>
          </n-card>

          <n-card class="shadow-sm border-none rounded-xl">
            <div class="p-2 space-y-4">
              <div class="max-w-xl">
                <n-text class="text-lg font-semibold block mb-1">
                  CV Template Management
                </n-text>
                <n-text depth="3" class="text-sm">
                  Unggah template CV (.docx) yang dapat diunduh oleh kandidat pada halaman profil mereka untuk membantu pengisian data menggunakan AI.
                </n-text>
              </div>

              <!-- Current File Info -->
              <div v-if="cvTemplateUrl" class="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl max-w-xl">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <n-icon :component="FileText" size="22" />
                  </div>
                  <div>
                    <n-text class="font-semibold block text-slate-700">CV_Template.docx</n-text>
                    <n-text depth="3" class="text-xs">Format: Microsoft Word (.docx)</n-text>
                  </div>
                </div>
                <n-button 
                  secondary 
                  type="primary" 
                  size="small" 
                  @click="downloadTemplate"
                  class="flex items-center gap-1.5 font-bold"
                >
                  <template #icon>
                    <n-icon :component="Download" />
                  </template>
                  Download
                </n-button>
              </div>

              <!-- Upload Component -->
              <div class="max-w-xl">
                <n-spin :show="isUploadingTemplate">
                  <n-upload
                    v-model:file-list="fileList"
                    :show-file-list="false"
                    accept=".docx"
                    @change="handleUploadChange"
                  >
                    <n-upload-dragger class="!border-dashed !border-slate-200 !rounded-xl !bg-slate-50/50 hover:!border-blue-500 hover:!bg-blue-50/10 transition-all cursor-pointer">
                      <div class="flex flex-col items-center gap-2 py-6">
                        <n-icon :component="CloudUpload" size="36" class="text-slate-400" />
                        <n-text class="text-sm font-semibold text-slate-700">
                          {{ cvTemplateUrl ? 'Ganti template dengan menarik berkas atau klik di sini' : 'Unggah template dengan menarik berkas atau klik di sini' }}
                        </n-text>
                        <n-text depth="3" class="text-xs">
                          Hanya mendukung format .docx
                        </n-text>
                      </div>
                    </n-upload-dragger>
                  </n-upload>
                </n-spin>
              </div>
            </div>
          </n-card>
        </div>
      </n-spin>
    </div>
  </SuperAdminLayout>
</template>

<style scoped>
:deep(.n-card) {
  --n-border-radius: 12px;
}
</style>
