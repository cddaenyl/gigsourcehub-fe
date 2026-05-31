<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NButton,
  NIcon,
  NTabs,
  NTab,
  NConfigProvider,
  NInput,
  NAlert,
  useDialog,
  useMessage,
} from 'naive-ui'
import { Plus, Calendar } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import FAQTable from '@/components/tables/FAQTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import { useFAQs } from '@/composables/useFAQs'
import { createFAQApi, updateFAQApi, deleteFAQApi } from '@/services/faq.service'
import type { FAQ } from '@/models/FAQ'

// ── Router ────────────────────────────────────────────────────────────────────
const router = useRouter()

const handleTabChange = (key: string) => {
  router.push(`/admin/landing-page/${key}`)
}

// ── Dialog & Message ──────────────────────────────────────────────────────────
const dialog = useDialog()
const message = useMessage()

// ── State ─────────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const isSubmitting = ref(false)

// Modal state
const showAddModal = ref(false)
const showEditModal = ref(false)
const editTarget = ref<FAQ | null>(null)

// Form state
const formQuestion = ref('')
const formAnswer = ref('')

// ── API Integration ──────────────────────────────────────────────────────────
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value || undefined,
}))

const { faqs, pageCount, isLoading, refetch } = useFAQs(queryParams)

const formIsReady = computed(
  () => formQuestion.value.trim().length > 0 && formAnswer.value.trim().length > 0,
)

// ── Handlers ──────────────────────────────────────────────────────────────────
const handleSearch = (val: string) => {
  searchQuery.value = val
  currentPage.value = 1
}

const openAddModal = () => {
  formQuestion.value = ''
  formAnswer.value = ''
  showAddModal.value = true
}

const openEditModal = (faq: FAQ) => {
  editTarget.value = faq
  formQuestion.value = faq.question
  formAnswer.value = faq.answer
  showEditModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  editTarget.value = null
}

const handleAdd = async () => {
  if (!formIsReady.value) {
    message.warning('Pertanyaan dan Jawaban wajib diisi')
    return
  }
  isSubmitting.value = true
  try {
    await createFAQApi({
      question: formQuestion.value,
      answer: formAnswer.value,
    })
    message.success('FAQ berhasil ditambahkan')
    refetch()
    closeAddModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan FAQ'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleEdit = async () => {
  if (!formIsReady.value) {
    message.warning('Pertanyaan dan Jawaban wajib diisi')
    return
  }
  if (!editTarget.value) return
  isSubmitting.value = true
  try {
    await updateFAQApi(editTarget.value.id, {
      question: formQuestion.value,
      answer: formAnswer.value,
    })
    message.success('FAQ berhasil diperbarui')
    refetch()
    closeEditModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui FAQ'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleTableAction = (action: 'edit' | 'delete', faq: FAQ) => {
  if (action === 'edit') {
    openEditModal(faq)
  } else if (action === 'delete') {
    dialog.warning({
      title: 'Hapus FAQ',
      content: `Yakin ingin menghapus FAQ ini?`,
      positiveText: 'Hapus',
      negativeText: 'Batal',
      onPositiveClick: async () => {
        try {
          await deleteFAQApi(faq.id)
          message.success('FAQ berhasil dihapus')
          refetch()
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menghapus FAQ'
          message.error(msg)
        }
      },
    })
  }
}

const themeOverride = {
  DataTable: {
    thColor: '#F1F5F9',
    thTextColor: '#64748B',
    thFontWeight: '600',
    tdColor: '#FFFFFF',
    tdColorHover: '#F1F5F9',
    borderColor: '#F1F5F9',
    thColorHover: '#F8FAFC',
  },
  Tabs: {
    tabTextColor: '#64748B',
    tabTextColorHover: '#64748B',
    tabTextColorActive: '#07229E',
    tabTextColorActiveHover: '#07229E',
  },
}
</script>

<template>
  <AdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-5">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Konten Landing Page</h1>
        </div>

        <!-- Content Card -->
        <div class="bg-white rounded-lg shadow-sm p-2 py-3 space-y-4">
          <!-- Tabs + Action bar -->
          <div class="flex items-center justify-between">
            <n-tabs
              value="faq"
              type="line"
              @update:value="handleTabChange"
            >
              <n-tab name="faq">FAQ</n-tab>
              <n-tab name="informasi-perusahaan">Informasi Perusahaan</n-tab>
              <n-tab name="kategori-bidang">Kategori Bidang</n-tab>
            </n-tabs>

            <!-- Action bar (right side of tabs) -->
            <div class="flex items-center gap-3 pb-1">
              <n-button
                text
                size="medium"
                class="text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2 py-1"
              >
                <n-icon :component="Calendar" size="18" />
              </n-button>
              <SearchInput
                :model-value="searchQuery"
                placeholder="Search"
                @update:model-value="handleSearch"
              />
              <n-button type="primary" color="#0014B2" @click="openAddModal">
                <template #icon>
                  <n-icon :component="Plus" />
                </template>
                Tambah FAQ
              </n-button>
            </div>
          </div>

          <!-- Table -->
          <FAQTable
            :data="faqs"
            :loading="isLoading"
            @action="handleTableAction"
          />

          <!-- Pagination -->
          <CandidatePagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="pageCount"
          />
        </div>
      </div>

      <!-- ─── Modal Tambah FAQ ────────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showAddModal"
        title="Tambah Frequently Asked Questions"
        width="560px"
        @close="closeAddModal"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Pertanyaan</label>
            <n-input
              v-model:value="formQuestion"
              placeholder="Masukkan pertanyaan"
              size="medium"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Jawaban</label>
            <n-input
              v-model:value="formAnswer"
              type="textarea"
              placeholder="Masukkan jawaban"
              :rows="4"
              size="medium"
            />
          </div>
        </div>

        <template #footer>
          <n-button @click="closeAddModal">Batal</n-button>
          <n-button
            type="primary"
            color="#0014B2"
            :disabled="!formIsReady"
            :loading="isSubmitting"
            @click="handleAdd"
          >
            Tambah
          </n-button>
        </template>
      </BaseModal>

      <!-- ─── Modal Edit FAQ ─────────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showEditModal"
        title="Edit Frequently Asked Questions"
        width="560px"
        @close="closeEditModal"
      >
        <div class="space-y-4">
          <!-- Alert for Rejected Reason -->
          <n-alert
            v-if="editTarget?.status === 'REJECTED' && editTarget?.rejected_reason"
            type="error"
            title="Alasan Penolakan"
            class="rounded-xl"
          >
            {{ editTarget.rejected_reason }}
          </n-alert>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Pertanyaan</label>
            <n-input
              v-model:value="formQuestion"
              placeholder="Masukkan pertanyaan"
              size="medium"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Jawaban</label>
            <n-input
              v-model:value="formAnswer"
              type="textarea"
              placeholder="Masukkan jawaban"
              :rows="4"
              size="medium"
            />
          </div>
        </div>

        <template #footer>
          <n-button @click="closeEditModal">Batal</n-button>
          <n-button
            type="primary"
            color="#0014B2"
            :disabled="!formIsReady"
            :loading="isSubmitting"
            @click="handleEdit"
          >
            Simpan
          </n-button>
        </template>
      </BaseModal>
    </n-config-provider>
  </AdminLayout>
</template>
