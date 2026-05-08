<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NCard, NSelect, type SelectOption } from 'naive-ui'
import CandidateNotesCard from './CandidateNotesCard.vue'

const props = defineProps<{
  levelOptions: SelectOption[]
  recruitmentOptions: SelectOption[]
  initialLevel: string | null
  initialStatus: string | null
  isSaving?: boolean
}>()

const emit = defineEmits<{
  (
    event: 'save',
    payload: { candidate_level: string | null; recruitment_status_id: string | null },
  ): void
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

    <CandidateNotesCard v-model="note">
      <template #header>
        <div class="flex flex-col gap-0.5">
          <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
        </div>
      </template>

      <template #default>
        <h4 class="text-xs text-gray-400">Belum Ada Catatan</h4>
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
