<script setup lang="ts">
import { computed } from 'vue'
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
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import SubRequestCard from '@/components/talent-needs/SubRequestCard.vue'
import { useCreateRequest } from '@/composables/useRequest'
import { useRoles } from '@/composables/useRoles'
import type {
  CreateRequestPayload,
  RequestUrgency,
  TalentRequestFormValues,
  TalentRequestSubrequestForm,
} from '@/models/Request'

const router = useRouter()
const message = useMessage()
const { mutateAsync, isPending } = useCreateRequest()
const { roles, isLoading: isRolesLoading } = useRoles({ page: 1, limit: 100 })

const requestSchema = z.object({
  dueDate: z.number({ message: 'Target pemenuhan wajib diisi' }),
  projectName: z.string().trim().min(1, 'Nama project wajib diisi'),
  projectDuration: z.string().trim().min(1, 'Durasi project wajib diisi'),
  subRequests: z
    .array(
      z.object({
        jobRoleId: z.string().min(1, 'Nama posisi wajib dipilih'),
        minYearsExperience: z.number().nullable(),
        notes: z.string(),
        techStack: z
          .string()
          .trim()
          .min(1, 'Keahlian / tech stack wajib diisi')
          .refine(
            (value) =>
              value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean).length > 0,
            {
              message: 'Masukkan minimal 1 tech stack',
            },
          ),
      }),
    )
    .min(1, 'Minimal 1 subrequest harus ditambahkan'),
  urgency: z.enum(['LOW', 'MIDDLE', 'HIGH'], { message: 'Tingkat urgensi wajib dipilih' }),
})

const createEmptySubRequest = (): TalentRequestSubrequestForm => ({
  jobRoleId: null,
  minYearsExperience: null,
  notes: '',
  techStack: '',
})

const { handleSubmit, meta, setFieldValue } = useForm<TalentRequestFormValues>({
  validationSchema: toTypedSchema(requestSchema),
  initialValues: {
    dueDate: null,
    projectName: '',
    subRequests: [createEmptySubRequest()],
    urgency: null,
  },
})

const { value: projectName, errorMessage: projectNameError } = useField<string>('projectName')
const { value: projectDuration, errorMessage: projectDurationError } =
  useField<string>('projectDuration')
const { value: urgency, errorMessage: urgencyError } = useField<RequestUrgency | null>('urgency')
const { value: dueDate, errorMessage: dueDateError } = useField<number | null>('dueDate')
const { value: subRequests, errorMessage: subRequestsError } =
  useField<TalentRequestSubrequestForm[]>('subRequests')

const subRequestItems = computed(() => subRequests.value || [])

const urgencyOptions: SelectOption[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Middle', value: 'MIDDLE' },
  { label: 'High', value: 'HIGH' },
]

const positionOptions = computed<SelectOption[]>(() => {
  return roles.value.map((role) => ({
    label: role.name,
    value: role.id,
  }))
})

const getSubRequestList = () => subRequests.value || []

const isFormValid = computed(() => {
  const hasRequestInfo =
    projectName.value.trim().length > 0 && Boolean(urgency.value) && Boolean(dueDate.value)

  const subRequestList = getSubRequestList()

  const hasValidSubRequests = subRequestList.every((item) => {
    return Boolean(item.jobRoleId) && item.techStack.trim().length > 0
  })

  return hasRequestInfo && hasValidSubRequests && meta.value.valid
})

const handleBack = () => {
  router.push('/employee/talent-needs')
}

const handleAddSubRequest = () => {
  setFieldValue('subRequests', [...getSubRequestList(), createEmptySubRequest()])
}

const handleRemoveSubRequest = (index: number) => {
  const updatedSubRequests = [...getSubRequestList()]

  if (updatedSubRequests.length === 1) {
    return
  }

  updatedSubRequests.splice(index, 1)
  setFieldValue('subRequests', updatedSubRequests)
}

const handleUpdateSubRequest = (index: number, value: TalentRequestSubrequestForm) => {
  const updatedSubRequests = [...getSubRequestList()]
  updatedSubRequests[index] = value
  setFieldValue('subRequests', updatedSubRequests)
}

const toRequestPayload = (values: TalentRequestFormValues): CreateRequestPayload => {
  const dueDateString = new Date(values.dueDate as number).toISOString().slice(0, 10)

  return {
    due_date: dueDateString,
    project_name: values.projectName.trim(),
    project_duration: values.projectDuration.trim(),
    subrequests: values.subRequests.map((subrequest) => ({
      job_role_id: subrequest.jobRoleId as string,
      min_years_experience: subrequest.minYearsExperience ?? 0,
      notes: subrequest.notes.trim(),
      tech_stack: subrequest.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
    })),
    urgency: values.urgency as RequestUrgency,
  }
}

const handleSubmitRequest = handleSubmit(
  async (values) => {
    try {
      await mutateAsync(toRequestPayload(values))
      message.success('Pengajuan kebutuhan talenta berhasil dikirim.')
      router.push('/employee/talent-needs')
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Gagal mengirim pengajuan kebutuhan talenta.',
      )
    }
  },
  () => {
    message.warning('Lengkapi data utama dan minimal posisi + keahlian pada setiap subrequest.')
  },
)
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
                  v-model:value="projectName"
                  placeholder="Masukkan nama project / kegiatan"
                />
                <p v-if="projectNameError" class="text-xs text-red-500">{{ projectNameError }}</p>
              </n-space>

              <n-space vertical :size="6">
                <h3 class="text-xs font-bold text-gray-500">Durasi Project</h3>

                <n-input v-model:value="projectDuration" placeholder="cth : 3 - 6 Bulan" />
                <p v-if="projectDurationError" class="text-xs text-red-500">
                  {{ projectDurationError }}
                </p>
              </n-space>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <n-space vertical>
                  <h3 class="text-xs font-bold text-gray-500">Tingkat Urgensi</h3>
                  <n-select
                    v-model:value="urgency"
                    :options="urgencyOptions"
                    placeholder="Pilih tingkat urgensi kebutuhan"
                  />
                  <p v-if="urgencyError" class="text-xs text-red-500">{{ urgencyError }}</p>
                </n-space>

                <n-space vertical :size="9">
                  <h3 class="text-xs font-bold text-gray-500">Target Pemenuhan</h3>
                  <n-date-picker
                    v-model:value="dueDate"
                    type="date"
                    clearable
                    class="w-full"
                    placeholder="Pilih batas waktu pemenuhan kebutuhan"
                  />
                  <p v-if="dueDateError" class="text-xs text-red-500">{{ dueDateError }}</p>
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
                v-for="(item, index) in subRequestItems"
                :key="`${index}-${item.jobRoleId ?? 'new'}`"
                :model-value="item"
                :position-options="positionOptions"
                :can-remove="subRequestItems.length > 1"
                :position="index + 1"
                @update:model-value="(value) => handleUpdateSubRequest(index, value)"
                @remove="handleRemoveSubRequest(index)"
              />
              <p v-if="isRolesLoading" class="text-xs text-slate-500">Memuat daftar role...</p>
              <p v-if="subRequestsError" class="text-xs text-red-500">{{ subRequestsError }}</p>
            </n-space>
          </n-space>
        </n-card>

        <n-card :bordered="true" size="small">
          <n-space justify="end">
            <n-button
              type="primary"
              :disabled="!isFormValid || isPending"
              @click="handleSubmitRequest"
            >
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
:deep(.n-date-picker .n-input__input-el),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-input) {
  font-size: 12px;
}

:deep(.n-input .n-input__placeholder),
:deep(.n-base-selection-label__placeholder),
:deep(.n-date-picker .n-input__placeholder),
:deep(.n-base-selection .n-base-selection-label .n-base-selection-placeholder) {
  color: #cbd5e1;
}

.n-card {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
</style>
