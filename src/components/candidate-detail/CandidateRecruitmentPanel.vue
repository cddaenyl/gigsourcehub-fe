<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NSelect, NInput, NButton, NIcon } from 'naive-ui'
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
  <div class="flex h-full flex-col gap-2">
    <n-card :content-style="{ padding: '20px' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-0.5">
          <h4 class="font-bold text-sm text-gray-500">Kontrol Rekrutmen</h4>
          <p class="text-xs text-gray-400">Kelola level kandidat dan status Rekrutmen</p>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="font-bold text-xs text-gray-500">Level Kandidat</h4>
          <n-select
            v-model:value="level"
            placeholder="Pilih Level Kandidat"
            :options="levelOptions"
          />
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="font-bold text-xs text-gray-500">Status Rekrutmen</h4>
          <n-select
            v-model:value="status"
            placeholder="Pilih Status Rekrutmen"
            :options="recruitmentOptions"
          />
        </div>
        <div class="flex justify-end">
          <n-button type="primary">Simpan</n-button>
        </div>
      </div>
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
      <div class="flex h-full flex-1 flex-col gap-4">
        <div class="flex flex-col gap-0.5">
          <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
        </div>
        <div class="flex flex-col flex-1 gap-0.5">
          <h4 class="text-xs text-gray-400">Belum Ada Catatan</h4>
        </div>
        <div class="flex flex-col gap-0.5 items-end">
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
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
