<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NSpace, NSelect, NInput, NButton, NIcon } from 'naive-ui'
import { Send } from '@vicons/tabler'

defineProps<{
  levelOptions: Array<{ label: string; value: string }>
  recruitmentOptions: Array<{ label: string; value: string }>
}>()

const level = ref<string | null>(null)
const status = ref<string | null>(null)
const note = ref('')

const handleSendNote = () => {
  if (!note.value.trim()) return
  note.value = ''
}
</script>

<template>
  <n-space vertical :size="8" style="height: 100%; display: flex; flex-direction: column">
    <n-card :content-style="{ padding: '20px' }">
      <n-space vertical :size="16">
        <n-space vertical :size="2">
          <h4 class="font-bold text-sm text-gray-500">Kontrol Rekrutmen</h4>
          <p class="text-xs text-gray-400">Kelola level kandidat dan status Rekrutmen</p>
        </n-space>
        <n-space vertical :size="4">
          <h4 class="font-bold text-xs text-gray-500">Level Kandidat</h4>
          <n-select
            v-model:value="level"
            placeholder="Pilih Level Kandidat"
            :options="levelOptions"
          />
        </n-space>
        <n-space vertical :size="4">
          <h4 class="font-bold text-xs text-gray-500">Status Rekrutmen</h4>
          <n-select
            v-model:value="status"
            placeholder="Pilih Status Rekrutmen"
            :options="recruitmentOptions"
          />
        </n-space>
        <div class="flex justify-end">
          <n-button type="primary">Simpan</n-button>
        </div>
      </n-space>
    </n-card>

    <n-card
      style="flex: 1"
      :content-style="{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
      }"
    >
      <n-space
        vertical
        :size="16"
        style="height: 100%; display: flex; flex-direction: column; flex: 1"
      >
        <n-space vertical :size="2">
          <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
        </n-space>
        <n-space vertical :size="2">
          <h4 class="text-xs text-gray-400">Belum Ada Catatan</h4>
        </n-space>
        <n-space vertical :size="2">
          <n-input
            v-model:value="note"
            placeholder="Type here..."
            round
            type="textarea"
            style="border-radius: 2rem"
            class="py-1"
            :autosize="{
              minRows: 1,
              maxRows: 3,
            }"
          >
            <template #suffix>
              <n-button circle type="primary" size="small" @click="handleSendNote">
                <template #icon>
                  <n-icon :component="Send" />
                </template>
              </n-button>
            </template>
          </n-input>
        </n-space>
      </n-space>
    </n-card>
  </n-space>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
