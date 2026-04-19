<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NCard, NSwitch, NText, useMessage, NSpin } from 'naive-ui'
import SuperAdminLayout from '../../../layouts/SuperAdminLayout.vue'
import { fetchSystemSettings, updateSystemSettings } from '../../../services/system-setting'

const message = useMessage()
const isAiEnabled = ref(false)
const isLoading = ref(true)
const isUpdating = ref(false)

const loadSettings = async () => {
  try {
    isLoading.value = true
    const data = await fetchSystemSettings()
    isAiEnabled.value = data.is_ai_mode_enabled
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
      </n-spin>
    </div>
  </SuperAdminLayout>
</template>

<style scoped>
:deep(.n-card) {
  --n-border-radius: 12px;
}
</style>
