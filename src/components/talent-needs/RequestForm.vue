<script setup lang="ts">
import { computed, watch } from 'vue'
import { buildMasterDataOptions } from '@/utils/masterDataOptions'
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
import { Plus } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import SubRequestCard from '@/components/talent-needs/SubRequestCard.vue'
import { useCreateRequest, useAdminRequest, useUpdateRequest } from '@/composables/useRequest'
import { useRoles } from '@/composables/useRoles'
import type {
  CreateRequestPayload,
  RequestLevel,
  RequestUrgency,
  TalentRequestFormValues,
  TalentRequestSubrequestForm,
} from '@/models/Request'

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    requestId?: string | null
  }>(),
  {
    mode: 'create',
    requestId: null,
  },
)

const router = useRouter()
const message = useMessage()

const { mutateAsync: createRequest, isPending: isCreating } = useCreateRequest()
const { mutateAsync: updateRequest, isPending: isUpdating } = useUpdateRequest()

const { roles, isLoading: isRolesLoading } = useRoles({ page: 1, limit: 100 })

const requestQuery = props.requestId ? useAdminRequest(props.requestId) : null

const requestSchema = z.object({
  dueDate: z.number({ message: 'Target pemenuhan wajib diisi' }),
  projectName: z.string().trim().min(1, 'Nama project wajib diisi'),
  projectDuration: z.string().trim().min(1, 'Durasi project wajib diisi'),
  urgency: z.enum(['LOW', 'MIDDLE', 'HIGH'], { message: 'Tingkat urgensi wajib dipilih' }),
  subRequests: z
    .array(
      z.object({
        jobRoleId: z.string().min(1, 'Nama posisi wajib dipilih'),
        level: z.enum(['Junior', 'Middle', 'Senior'], {
          message: 'Level senioritas wajib dipilih',
        }),
        overview: z.string().nullable(),
        notes: z.string(),
        techStack: z
          .array(z.string().trim().min(1, 'Tech stack tidak boleh kosong'))
          .min(1, 'Masukkan minimal 1 tech stack'),
      }),
    )
    .min(1, 'Minimal 1 subrequest harus ditambahkan'),
})

const createEmptySubRequest = (): TalentRequestSubrequestForm => ({
  overview: null,
  jobRoleId: null,
  level: null,
  notes: '',
  techStack: [],
})

const { handleSubmit, meta, setFieldValue } = useForm<TalentRequestFormValues>({
  validationSchema: toTypedSchema(requestSchema),
  initialValues: {
    dueDate: null,
    projectName: '',
    projectDuration: '',
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

const positionOptions = computed<SelectOption[]>(() => buildMasterDataOptions(roles.value))

const getSubRequestList = () => subRequests.value || []

const isFormValid = computed(() => {
  const hasRequestInfo =
    projectName.value.trim().length > 0 && Boolean(urgency.value) && Boolean(dueDate.value)

  const subRequestList = getSubRequestList()

  const hasValidSubRequests = subRequestList.every((item) => {
    return Boolean(item.jobRoleId) && Boolean(item.level) && item.techStack.length > 0
  })

  return hasRequestInfo && hasValidSubRequests && meta.value.valid
})

// const handleBack = () => {
//   router.push('/employee/talent-needs')
// }

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
      level: subrequest.level as RequestLevel,
      overview: subrequest.overview?.trim() || null,
      notes: subrequest.notes.trim(),
      tech_stack: subrequest.techStack.map((tech) => tech.trim()).filter(Boolean),
    })),
    urgency: values.urgency as RequestUrgency,
  }
}

const isPending = computed(() => isCreating.value || isUpdating.value)

const handleSubmitRequest = handleSubmit(
  async (values) => {
    try {
      if (props.mode === 'edit' && props.requestId) {
        await updateRequest({ id: props.requestId, payload: toRequestPayload(values) })
        message.success('Perubahan kebutuhan talenta berhasil disimpan.')
      } else {
        await createRequest(toRequestPayload(values))
        message.success('Pengajuan kebutuhan talenta berhasil dikirim.')
      }

      router.push('/employee/talent-needs')
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Gagal menyimpan pengajuan kebutuhan talenta.',
      )
    }
  },
  () => {
    message.warning('Lengkapi data utama dan minimal posisi + keahlian pada setiap subrequest.')
  },
)

function disablePreviousDate(ts: number) {
  return ts < Date.now()
}

// populate form when editing
if (requestQuery) {
  watch(
    () => requestQuery.request.value,
    (val) => {
      if (!val) return

      const req = val
      setFieldValue('projectName', req.project_name || '')
      setFieldValue('projectDuration', req.project_duration || '')
      setFieldValue('urgency', req.urgency || null)
      setFieldValue('dueDate', req.due_date ? new Date(req.due_date).getTime() : null)
      setFieldValue(
        'subRequests',
        req.subrequests.map((s) => {
          // tech_stack from backend may be stored as JSON array string or comma-separated string
          let techStack: string[] = []

          if (Array.isArray(s.tech_stack)) {
            techStack = s.tech_stack as unknown as string[]
          } else if (typeof s.tech_stack === 'string') {
            const raw = s.tech_stack.trim()
            if (raw.startsWith('[') && raw.endsWith(']')) {
              try {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) techStack = parsed.map((t) => String(t))
              } catch (e) {
                // fallback to comma split
                techStack = raw
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              }
            } else {
              techStack = raw
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            }
          }

          return {
            jobRoleId: s.job_role_id,
            level: s.level,
            overview: s.overview,
            notes: s.notes || '',
            techStack,
          }
        }),
      )
    },
    { immediate: true },
  )
}
</script>

<template>
  <n-space vertical class="mx-4 mt-4">
    <h2 class="text-base font-semibold text-gray-600">Informasi Project</h2>
    <n-card :bordered="true" size="small">
      <n-space vertical size="large" class="mx-2 my-3 mb-5">
        <div class="space-y-4">
          <n-space vertical :size="6">
            <h3 class="text-xs font-bold text-gray-500">
              Nama Project / Kegiatan <span class="text-red-500">*</span>
            </h3>

            <n-input v-model:value="projectName" placeholder="Masukkan nama project / kegiatan" />
            <p v-if="projectNameError" class="text-xs text-red-500">{{ projectNameError }}</p>
          </n-space>

          <n-space vertical :size="6">
            <h3 class="text-xs font-bold text-gray-500">
              Durasi Project <span class="text-red-500">*</span>
            </h3>

            <n-input v-model:value="projectDuration" placeholder="cth : 3 - 6 Bulan" />
            <p v-if="projectDurationError" class="text-xs text-red-500">
              {{ projectDurationError }}
            </p>
          </n-space>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <n-space vertical>
              <h3 class="text-xs font-bold text-gray-500">
                Tingkat Urgensi <span class="text-red-500">*</span>
              </h3>
              <n-select
                v-model:value="urgency"
                :options="urgencyOptions"
                placeholder="Pilih tingkat urgensi kebutuhan"
              />
              <p v-if="urgencyError" class="text-xs text-red-500">{{ urgencyError }}</p>
            </n-space>

            <n-space vertical :size="9">
              <h3 class="text-xs font-bold text-gray-500">
                Target Pemenuhan <span class="text-red-500">*</span>
              </h3>
              <n-date-picker
                v-model:value="dueDate"
                type="date"
                clearable
                class="w-full"
                placeholder="Pilih batas waktu pemenuhan kebutuhan"
                :is-date-disabled="disablePreviousDate"
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
        <n-button type="primary" :disabled="!isFormValid || isPending" @click="handleSubmitRequest">
          {{ props.mode === 'edit' ? 'Simpan Perubahan' : 'Ajukan Kebutuhan' }}
        </n-button>
      </n-space>
    </n-card>
  </n-space>
</template>

<style scoped>
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
