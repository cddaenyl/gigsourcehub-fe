<script setup lang="ts">
import { computed, ref } from 'vue'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import {
  NButton,
  NCard,
  NDatePicker,
  NIcon,
  NInput,
  NSelect,
  NSpace,
  type SelectOption,
  useMessage,
} from 'naive-ui'
import { ChevronLeft, Plus } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import SubRequestCard from '@/components/talent-needs/SubRequestCard.vue'

interface RequestInfoForm {
  projectName: string
  urgency: string | null
  targetDate: number | null
}

interface SubRequestForm {
  positionName: string | null
  techStack: string
  minimumExperience: number | null
  notes: string
}

const router = useRouter()
const message = useMessage()

const requestInfo = ref<RequestInfoForm>({
  projectName: '',
  urgency: null,
  targetDate: null,
})

const createEmptySubRequest = (): SubRequestForm => ({
  positionName: null,
  techStack: '',
  minimumExperience: null,
  notes: '',
})

const subRequests = ref<SubRequestForm[]>([createEmptySubRequest()])

const urgencyOptions: SelectOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Middle', value: 'middle' },
  { label: 'High', value: 'high' },
]

const positionOptions: SelectOption[] = [
  { label: 'Frontend Developer', value: 'frontend-developer' },
  { label: 'Backend Developer', value: 'backend-developer' },
  { label: 'Fullstack Developer', value: 'fullstack-developer' },
  { label: 'UI/UX Designer', value: 'ui-ux-designer' },
  { label: 'QA Engineer', value: 'qa-engineer' },
  { label: 'DevOps Engineer', value: 'devops-engineer' },
]

const isFormValid = computed(() => {
  const hasRequestInfo =
    requestInfo.value.projectName.trim().length > 0 &&
    Boolean(requestInfo.value.urgency) &&
    Boolean(requestInfo.value.targetDate)

  const hasValidSubRequests = subRequests.value.every((item) => {
    return Boolean(item.positionName) && item.techStack.trim().length > 0
  })

  return hasRequestInfo && hasValidSubRequests
})

const handleBack = () => {
  router.push('/employee/talent-needs')
}

const handleAddSubRequest = () => {
  subRequests.value.push(createEmptySubRequest())
}

const handleRemoveSubRequest = (index: number) => {
  if (subRequests.value.length === 1) {
    return
  }

  subRequests.value.splice(index, 1)
}

const handleUpdateSubRequest = (index: number, value: SubRequestForm) => {
  subRequests.value[index] = value
}

const handleSubmitRequest = () => {
  if (!isFormValid.value) {
    message.warning('Lengkapi data utama dan minimal posisi + keahlian pada setiap subrequest.')
    return
  }

  message.success('Pengajuan kebutuhan talenta berhasil disiapkan.')
  console.log('Talent request payload:', {
    ...requestInfo.value,
    subRequests: subRequests.value,
  })
}
</script>

<template>
  <EmployeeLayout class="bg-[#F8FAFC]">
    <n-space vertical size="large" class="m-4">
      <n-space align="center" size="medium">
        <div class="flex items-center rounded-full bg-primary p-1">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon :component="ChevronLeft" :size="16" color="#FFFFFF" />
            </template>
          </n-button>
        </div>
        <h1 class="text-xl font-semibold text-gray-700">Ajukan Kebutuhan Talenta</h1>
      </n-space>

      <n-space vertical class="mx-4 mt-4">
        <h2 class="text-base font-semibold text-gray-600">Informasi Project</h2>
        <n-card :bordered="true" size="small">
          <n-space vertical size="large" class="mx-2 my-3 mb-5">
            <div class="space-y-4">
              <n-space vertical :size="6">
                <h3 class="text-xs font-bold text-gray-500">Nama Project / Kegiatan</h3>

                <n-input
                  v-model:value="requestInfo.projectName"
                  placeholder="Masukkan nama project / kegiatan"
                />
              </n-space>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <n-space vertical>
                  <h3 class="text-xs font-bold text-gray-500">Tingkat Urgensi</h3>
                  <n-select
                    v-model:value="requestInfo.urgency"
                    :options="urgencyOptions"
                    placeholder="Pilih tingkat urgensi kebutuhan"
                  />
                </n-space>

                <n-space vertical :size="9">
                  <h3 class="text-xs font-bold text-gray-500">Target Pemenuhan</h3>
                  <n-date-picker
                    v-model:value="requestInfo.targetDate"
                    type="date"
                    clearable
                    class="w-full"
                    placeholder="Pilih batas waktu pemenuhan kebutuhan"
                  />
                </n-space>
              </div>
            </div>
          </n-space>
        </n-card>

        <n-space align="center" justify="space-between" class="mt-2">
          <h2 class="text-base font-semibold text-gray-600">Detail Posisi yang Dibutuhkan</h2>
          <n-button tertiary size="small" type="primary" @click="handleAddSubRequest">
            <template #icon>
              <n-icon :component="Plus" />
            </template>
            Tambah Posisi
          </n-button>
        </n-space>
        <n-card :bordered="true" size="small">
          <n-space vertical size="large" class="my-3 mb-5">
            <n-space vertical :size="16">
              <SubRequestCard
                v-for="(item, index) in subRequests"
                :key="`${index}-${item.positionName ?? 'new'}`"
                :model-value="item"
                :position-options="positionOptions"
                :can-remove="subRequests.length > 1"
                :positon="index + 1"
                @update:model-value="(value) => handleUpdateSubRequest(index, value)"
                @remove="handleRemoveSubRequest(index)"
              />
            </n-space>
          </n-space>
        </n-card>

        <n-card :bordered="true" size="small">
          <n-space justify="end">
            <n-button type="primary" :disabled="!isFormValid" @click="handleSubmitRequest">
              Ajukan Kebutuhan
            </n-button>
          </n-space>
        </n-card>
      </n-space>
    </n-space>
  </EmployeeLayout>
</template>

<style scoped>
/* :deep(.n-base-selection .n-base-selection-label) {
  min-height: 36px;
} */

:deep(.n-input .n-input__input-el),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-input),
:deep(.n-date-picker .n-input__input-el) {
  font-size: 12px;
}

:deep(.n-input .n-input__placeholder),
:deep(.n-base-selection-label__placeholder),
:deep(.n-date-picker .n-input__placeholder),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-placeholder) {
  color: #94a3b8;
}
.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
