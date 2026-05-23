<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  NButton,
  NIcon,
  NTabs,
  NTab,
  NConfigProvider,
  NInput,
  useMessage,
  NSpin,
  NTag,
} from 'naive-ui'
import { Calendar } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import FAQApprovalTable from '@/components/tables/FAQApprovalTable.vue'
import CandidatePagination from '@/components/CandidatePagination.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import { useFAQApprovals } from '@/composables/useFAQApprovals'
import { approveFAQApi, rejectFAQApi, getFAQByIdApi } from '@/services/faq.service'
import type { ApprovalRequest } from '@/models/Approval'
import type { FAQ } from '@/models/FAQ'

// ── Router ────────────────────────────────────────────────────────────────────
const router = useRouter()

const handleTabChange = (key: string) => {
  router.push(`/superadmin/approval/${key}`)
}

// ── Message & Notifications ───────────────────────────────────────────────────
const message = useMessage()

// ── State ─────────────────────────────────────────────────────────────────────
const currentPage = ref(1)
const pageSize = ref(10)
const isSubmitting = ref(false)

// Modal states
const showReviewModal = ref(false)
const showRejectConfirmModal = ref(false)
const selectedRequest = ref<ApprovalRequest | null>(null)
const rejectionReason = ref('')

// Original FAQ data (for UPDATE comparison)
const isOriginalLoading = ref(false)
const originalFAQ = ref<FAQ | null>(null)

// ── API Integration ──────────────────────────────────────────────────────────
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
}))

const { approvals, pageCount, isLoading, refetch } = useFAQApprovals(queryParams)

const parsedProposed = computed(() => {
  if (!selectedRequest.value?.proposed_data) {
    return { question: '', answer: '' }
  }
  try {
    return JSON.parse(selectedRequest.value.proposed_data)
  } catch (e) {
    return { question: '', answer: '' }
  }
})

// Fetch original FAQ details for update comparison
watch(
  () => selectedRequest.value,
  async (req) => {
    originalFAQ.value = null
    if (req && req.action === 'UPDATE' && req.record_id) {
      isOriginalLoading.value = true
      try {
        const res = await getFAQByIdApi(req.record_id)
        originalFAQ.value = res.data
      } catch (err) {
        console.error('Failed to fetch original FAQ', err)
      } finally {
        isOriginalLoading.value = false
      }
    }
  }
)

// ── Handlers ──────────────────────────────────────────────────────────────────
const handleTableAction = (action: 'review', req: ApprovalRequest) => {
  if (action === 'review') {
    selectedRequest.value = req
    showReviewModal.value = true
  }
}

const closeReviewModal = () => {
  showReviewModal.value = false
  selectedRequest.value = null
  originalFAQ.value = null
}

const openRejectConfirm = () => {
  rejectionReason.value = ''
  showRejectConfirmModal.value = true
}

const closeRejectConfirm = () => {
  showRejectConfirmModal.value = false
}

const handleApprove = async () => {
  if (!selectedRequest.value) return
  isSubmitting.value = true
  try {
    await approveFAQApi(selectedRequest.value.id)
    message.success('Pengajuan FAQ berhasil disetujui')
    refetch()
    closeReviewModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyetujui pengajuan'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleReject = async () => {
  if (!selectedRequest.value) return
  if (!rejectionReason.value.trim()) {
    message.warning('Alasan penolakan wajib diisi')
    return
  }
  isSubmitting.value = true
  try {
    await rejectFAQApi(selectedRequest.value.id, rejectionReason.value)
    message.success('Pengajuan FAQ berhasil ditolak')
    refetch()
    closeRejectConfirm()
    closeReviewModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menolak pengajuan'
    message.error(msg)
  } finally {
    isSubmitting.value = false
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
  <SuperAdminLayout>
    <n-config-provider :theme-overrides="themeOverride">
      <div class="space-y-5">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-700">Persetujuan CMS</h1>
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
            <div class="flex items-center gap-3 pb-1 pr-2">
              <n-button
                text
                size="medium"
                class="text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2 py-1"
              >
                <n-icon :component="Calendar" size="18" />
              </n-button>
            </div>
          </div>

          <!-- Table -->
          <FAQApprovalTable
            :data="approvals"
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

      <!-- ─── Modal Review FAQ ────────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showReviewModal"
        title="Review Pengajuan FAQ"
        width="760px"
        @close="closeReviewModal"
      >
        <n-spin :show="isOriginalLoading">
          <div v-if="selectedRequest" class="space-y-6">
            <!-- Header Info -->
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm text-slate-600">
              <div>
                <p class="font-medium text-slate-700">Tipe Aksi</p>
                <n-tag
                  size="small"
                  :type="selectedRequest.action === 'CREATE' ? 'success' : 'warning'"
                  class="mt-1"
                >
                  {{ selectedRequest.action }}
                </n-tag>
              </div>
              <div>
                <p class="font-medium text-slate-700">Diajukan Oleh</p>
                <p class="mt-1 font-semibold text-slate-800">
                  {{ selectedRequest.requested_by_admin_name ?? 'Admin' }}
                </p>
              </div>
            </div>

            <!-- Comparison / Content Details -->
            <div class="space-y-4">
              <!-- Create Case -->
              <div v-if="selectedRequest.action === 'CREATE'" class="space-y-4">
                <div>
                  <h4 class="text-sm font-semibold text-slate-700 mb-1">Pertanyaan yang Diajukan</h4>
                  <div class="p-3 bg-slate-50 rounded-lg text-slate-800 border border-slate-100">
                    {{ parsedProposed.question }}
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-700 mb-1">Jawaban yang Diajukan</h4>
                  <div class="p-3 bg-slate-50 rounded-lg text-slate-800 border border-slate-100 whitespace-pre-line">
                    {{ parsedProposed.answer }}
                  </div>
                </div>
              </div>

              <!-- Update Case (Side-by-side or Stacked Comparison) -->
              <div v-else-if="selectedRequest.action === 'UPDATE'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Original Content -->
                  <div class="space-y-4 border-r border-slate-100 pr-4">
                    <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide">Data Saat Ini</h3>
                    <div v-if="originalFAQ">
                      <h4 class="text-xs font-semibold text-slate-600 mb-1">Pertanyaan</h4>
                      <div class="p-3 bg-slate-100 rounded-lg text-slate-700 min-h-[50px]">
                        {{ originalFAQ.question }}
                      </div>
                    </div>
                    <div v-if="originalFAQ">
                      <h4 class="text-xs font-semibold text-slate-600 mb-1">Jawaban</h4>
                      <div class="p-3 bg-slate-100 rounded-lg text-slate-700 min-h-[100px] whitespace-pre-line">
                        {{ originalFAQ.answer }}
                      </div>
                    </div>
                    <div v-else class="text-slate-400 italic text-sm">
                      FAQ Original tidak ditemukan atau telah dihapus.
                    </div>
                  </div>

                  <!-- Proposed Content -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-bold text-primary uppercase tracking-wide">Usulan Perubahan</h3>
                    <div>
                      <h4 class="text-xs font-semibold text-slate-600 mb-1">Pertanyaan Baru</h4>
                      <div class="p-3 bg-blue-50 rounded-lg text-slate-800 border border-blue-100 min-h-[50px] font-medium">
                        {{ parsedProposed.question }}
                      </div>
                    </div>
                    <div>
                      <h4 class="text-xs font-semibold text-slate-600 mb-1">Jawaban Baru</h4>
                      <div class="p-3 bg-blue-50 rounded-lg text-slate-800 border border-blue-100 min-h-[100px] whitespace-pre-line">
                        {{ parsedProposed.answer }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rejection Info if status is REJECTED -->
            <div v-if="selectedRequest.status === 'REJECTED'" class="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-700">
              <p class="font-bold">Pengajuan Ditolak</p>
              <p class="mt-1"><span class="font-medium">Alasan:</span> {{ selectedRequest.rejected_reason || '—' }}</p>
            </div>

            <!-- Approval Info if status is APPROVED -->
            <div v-if="selectedRequest.status === 'APPROVED'" class="bg-green-50 p-4 rounded-xl border border-green-100 text-sm text-green-700">
              <p class="font-bold">Pengajuan Disetujui</p>
              <p class="mt-1">Telah di-approve dan dipublikasikan ke Landing Page.</p>
            </div>
          </div>
        </n-spin>

        <template #footer>
          <n-button @click="closeReviewModal">Tutup</n-button>
          <template v-if="selectedRequest && selectedRequest.status === 'PENDING'">
            <n-button
              type="error"
              ghost
              :disabled="isSubmitting"
              @click="openRejectConfirm"
            >
              Tolak
            </n-button>
            <n-button
              type="primary"
              color="#0014B2"
              :loading="isSubmitting"
              @click="handleApprove"
            >
              Setujui
            </n-button>
          </template>
        </template>
      </BaseModal>

      <!-- ─── Modal Confirm Reject ────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showRejectConfirmModal"
        title="Alasan Penolakan Pengajuan"
        width="460px"
        @close="closeRejectConfirm"
      >
        <div class="space-y-3">
          <p class="text-sm text-slate-600">Silakan masukkan alasan mengapa Anda menolak pengajuan FAQ ini:</p>
          <n-input
            v-model:value="rejectionReason"
            type="textarea"
            placeholder="Masukkan alasan penolakan..."
            :rows="3"
          />
        </div>

        <template #footer>
          <n-button @click="closeRejectConfirm">Batal</n-button>
          <n-button
            type="error"
            color="#EF4444"
            :disabled="!rejectionReason.trim()"
            :loading="isSubmitting"
            @click="handleReject"
          >
            Tolak Pengajuan
          </n-button>
        </template>
      </BaseModal>
    </n-config-provider>
  </SuperAdminLayout>
</template>
