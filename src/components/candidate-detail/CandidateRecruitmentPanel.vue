<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NCard, NButton, NSelect, type SelectOption } from 'naive-ui'
import CandidateNotesCard from './CandidateNotesCard.vue'
import type { CandidateNote } from '@/models/Note'

const props = defineProps<{
  levelOptions: SelectOption[]
  recruitmentOptions: SelectOption[]
  initialLevel: string | null
  initialStatus: string | null
  isSaving?: boolean
  notes: CandidateNote[]
  notesLoading?: boolean
  notesPosting?: boolean
  notesError?: string | null
}>()

const emit = defineEmits<{
  (
    event: 'save',
    payload: { candidate_level: string | null; recruitment_status_id: string | null },
  ): void
  (event: 'send-note', payload: { text: string }): void
}>()

const level = ref<string | null>(props.initialLevel ?? null)
const status = ref<string | null>(props.initialStatus ?? null)
const note = ref('')

const isDirty = computed(
  () => level.value !== props.initialLevel || status.value !== props.initialStatus,
)

watch(
  () => [props.initialLevel, props.initialStatus],
  ([nextLevel, nextStatus]) => {
    level.value = nextLevel ?? null
    status.value = nextStatus ?? null
  },
)

// note is local and handled by CandidateNotesCard (clears on send by default)

const handleSave = () => {
  if (!isDirty.value) return
  emit('save', {
    candidate_level: level.value,
    recruitment_status_id: status.value,
  })
}

const formatNoteDate = (value: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getInitials = (name: string) => {
  const tokens = name.trim().split(/\s+/)
  const first = tokens[0]?.[0] ?? ''
  const second = tokens[1]?.[0] ?? ''
  return (first + second).toUpperCase() || '??'
}

const handleSendNote = (payload: { text: string }) => {
  emit('send-note', payload)
}
</script>

<template>
  <div class="flex flex-1 h-full flex-col gap-2">
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
          <n-button
            type="primary"
            :disabled="!isDirty || isSaving"
            :loading="isSaving"
            @click="handleSave"
          >
            Simpan
          </n-button>
        </div>
      </div>
    </n-card>

    <CandidateNotesCard
      v-model="note"
      class="flex-1"
      :disabled="notesLoading || notesPosting"
      :loading="notesPosting"
      @send="handleSendNote"
    >
      <template #header>
        <div class="flex flex-col gap-0.5">
          <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
        </div>
      </template>

      <template #default>
        <div v-if="notesLoading" class="text-xs text-gray-400">Memuat catatan...</div>
        <div v-else-if="notesError" class="text-xs text-red-500">{{ notesError }}</div>
        <div v-else-if="notes.length">
          <div v-for="noteItem in notes" :key="noteItem.id" class="flex gap-4 rounded-md py-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700"
            >
              {{ getInitials(noteItem.admin_user_name || '') }}
            </div>
            <div class="flex flex-1 flex-col gap-1 mt-0.5">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-gray-700">{{ noteItem.admin_user_name }}</p>
                <p class="text-sm text-gray-400">{{ formatNoteDate(noteItem.created_at) }}</p>
              </div>
              <p class="text-xs text-slate-500 whitespace-pre-line wrap-break-words">
                {{ noteItem.content }}
              </p>
            </div>
          </div>
        </div>
        <h4 v-else class="text-xs text-gray-400">Belum Ada Catatan</h4>
      </template>
    </CandidateNotesCard>
  </div>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
