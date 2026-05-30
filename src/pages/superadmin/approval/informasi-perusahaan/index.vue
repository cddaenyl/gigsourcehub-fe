<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NButton,
  NIcon,
  NTabs,
  NTab,
  NConfigProvider,
  NInput,
  useMessage,
  NSpin,
  NAlert,
  NCard,
} from 'naive-ui'
import { Calendar, Link, Check, X as XIcon } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import { useCompanyProfileApprovals } from '@/composables/useCompanyProfileApprovals'
import { getCompanyProfileApi, approveCompanyProfileApi, rejectCompanyProfileApi } from '@/services/company-profile.service'
import type { CompanyProfile } from '@/models/CompanyProfile'

// ── Router ────────────────────────────────────────────────────────────────────
const router = useRouter()

const handleTabChange = (key: string) => {
  router.push(`/superadmin/approval/${key}`)
}

// ── Message & Notifications ───────────────────────────────────────────────────
const message = useMessage()

// ── State ─────────────────────────────────────────────────────────────────────
const isSubmitting = ref(false)
const showRejectConfirmModal = ref(false)
const rejectionReason = ref('')

// Original Profile
const isOriginalLoading = ref(false)
const originalProfile = ref<CompanyProfile | null>(null)

// ── API Integration ──────────────────────────────────────────────────────────
const { approvals, isLoading: isApprovalsLoading, refetch } = useCompanyProfileApprovals({
  limit: 10,
})

// Find the active PENDING request (since there's at most one active company profile change request)
const pendingRequest = computed(() => {
  return approvals.value.find((a: any) => a.status === 'PENDING') ?? null
})

const parsedProposed = computed(() => {
  if (!pendingRequest.value?.proposed_data) {
    return {} as Record<string, string>
  }
  try {
    return JSON.parse(pendingRequest.value.proposed_data)
  } catch (e) {
    return {} as Record<string, string>
  }
})

// Fetch current company profile data
const fetchOriginalProfile = async () => {
  isOriginalLoading.value = true
  try {
    const res = await getCompanyProfileApi()
    originalProfile.value = res.data
  } catch (err) {
    console.error('Failed to fetch current company profile', err)
  } finally {
    isOriginalLoading.value = false
  }
}

onMounted(() => {
  fetchOriginalProfile()
})

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' • ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )
}

// ── Handlers ──────────────────────────────────────────────────────────────────
const openRejectConfirm = () => {
  rejectionReason.value = ''
  showRejectConfirmModal.value = true
}

const closeRejectConfirm = () => {
  showRejectConfirmModal.value = false
}

const handleApprove = async () => {
  if (!pendingRequest.value) return
  isSubmitting.value = true
  try {
    await approveCompanyProfileApi(pendingRequest.value.id)
    message.success('Perubahan data perusahaan berhasil disetujui')
    refetch()
    fetchOriginalProfile()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyetujui pengajuan'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleReject = async () => {
  if (!pendingRequest.value) return
  if (!rejectionReason.value.trim()) {
    message.warning('Alasan penolakan wajib diisi')
    return
  }
  isSubmitting.value = true
  try {
    await rejectCompanyProfileApi(pendingRequest.value.id, rejectionReason.value)
    message.success('Perubahan data perusahaan berhasil ditolak')
    refetch()
    closeRejectConfirm()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menolak pengajuan'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const themeOverride = {
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
              value="informasi-perusahaan"
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

          <!-- Loading Spin -->
          <n-spin :show="isApprovalsLoading || isOriginalLoading">
            <div class="p-2 space-y-5">
              <!-- Pending Request View -->
              <div v-if="pendingRequest" class="space-y-6">
                <!-- Alert Info -->
                <n-alert type="warning" class="rounded-xl">
                  <span class="font-medium">Menunggu Persetujuan:</span> Pengajuan perubahan data perusahaan oleh Admin 
                  <span class="font-semibold text-slate-800">{{ pendingRequest.requested_by_admin_name ?? 'Admin' }}</span> 
                  pada {{ formatDate(pendingRequest.created_at) }}
                </n-alert>

                <!-- Comparison Cards -->
                <n-card :bordered="true" class="rounded-xl shadow-sm">
                  <div class="space-y-4">
                    <h2 class="text-base font-bold text-slate-700 mb-4">Perbandingan Perubahan Data</h2>

                    <div class="border border-slate-100 rounded-xl overflow-hidden text-sm">
                      <!-- Header -->
                      <div class="grid grid-cols-3 bg-slate-50 font-semibold text-slate-700 p-3.5 border-b border-slate-100">
                        <div>Field / Informasi</div>
                        <div>Data Saat Ini</div>
                        <div class="text-primary">Usulan Perubahan</div>
                      </div>

                      <!-- Email -->
                      <div class="grid grid-cols-3 p-3.5 border-b border-slate-100 items-center">
                        <div class="font-medium text-slate-600">Email Perusahaan</div>
                        <div class="text-slate-600 break-words pr-2">
                          {{ originalProfile?.email || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded break-words"
                          :class="originalProfile?.email !== parsedProposed.email ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          {{ parsedProposed.email || '—' }}
                        </div>
                      </div>

                      <!-- Kontak -->
                      <div class="grid grid-cols-3 p-3.5 border-b border-slate-100 items-center">
                        <div class="font-medium text-slate-600">Kontak / Telepon</div>
                        <div class="text-slate-600 break-words pr-2">
                          {{ originalProfile?.phone || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded break-words"
                          :class="originalProfile?.phone !== parsedProposed.phone ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          {{ parsedProposed.phone || '—' }}
                        </div>
                      </div>

                      <!-- Alamat -->
                      <div class="grid grid-cols-3 p-3.5 border-b border-slate-100 items-start">
                        <div class="font-medium text-slate-600 mt-1">Alamat Lengkap</div>
                        <div class="text-slate-600 break-words pr-2 whitespace-pre-wrap">
                          {{ originalProfile?.address || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded break-words whitespace-pre-wrap"
                          :class="originalProfile?.address !== parsedProposed.address ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          {{ parsedProposed.address || '—' }}
                        </div>
                      </div>

                      <!-- Facebook -->
                      <div class="grid grid-cols-3 p-3.5 border-b border-slate-100 items-center">
                        <div class="font-medium text-slate-600 flex items-center gap-1.5">
                          Facebook
                        </div>
                        <div class="text-slate-500 truncate pr-2 flex items-center gap-1">
                          <n-icon v-if="originalProfile?.facebook_url" :component="Link" size="14" />
                          {{ originalProfile?.facebook_url || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded truncate flex items-center gap-1"
                          :class="originalProfile?.facebook_url !== parsedProposed.facebook_url ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          <n-icon v-if="parsedProposed.facebook_url" :component="Link" size="14" />
                          {{ parsedProposed.facebook_url || '—' }}
                        </div>
                      </div>

                      <!-- Twitter / X -->
                      <div class="grid grid-cols-3 p-3.5 border-b border-slate-100 items-center">
                        <div class="font-medium text-slate-600 flex items-center gap-1.5">
                          Twitter / X
                        </div>
                        <div class="text-slate-500 truncate pr-2 flex items-center gap-1">
                          <n-icon v-if="originalProfile?.twitter_url" :component="Link" size="14" />
                          {{ originalProfile?.twitter_url || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded truncate flex items-center gap-1"
                          :class="originalProfile?.twitter_url !== parsedProposed.twitter_url ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          <n-icon v-if="parsedProposed.twitter_url" :component="Link" size="14" />
                          {{ parsedProposed.twitter_url || '—' }}
                        </div>
                      </div>

                      <!-- Instagram -->
                      <div class="grid grid-cols-3 p-3.5 border-b border-slate-100 items-center">
                        <div class="font-medium text-slate-600 flex items-center gap-1.5">
                          Instagram
                        </div>
                        <div class="text-slate-500 truncate pr-2 flex items-center gap-1">
                          <n-icon v-if="originalProfile?.instagram_url" :component="Link" size="14" />
                          {{ originalProfile?.instagram_url || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded truncate flex items-center gap-1"
                          :class="originalProfile?.instagram_url !== parsedProposed.instagram_url ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          <n-icon v-if="parsedProposed.instagram_url" :component="Link" size="14" />
                          {{ parsedProposed.instagram_url || '—' }}
                        </div>
                      </div>

                      <!-- LinkedIn -->
                      <div class="grid grid-cols-3 p-3.5 items-center">
                        <div class="font-medium text-slate-600 flex items-center gap-1.5">
                          LinkedIn
                        </div>
                        <div class="text-slate-500 truncate pr-2 flex items-center gap-1">
                          <n-icon v-if="originalProfile?.linkedin_url" :component="Link" size="14" />
                          {{ originalProfile?.linkedin_url || '—' }}
                        </div>
                        <div
                          class="p-1.5 px-2.5 rounded truncate flex items-center gap-1"
                          :class="originalProfile?.linkedin_url !== parsedProposed.linkedin_url ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200' : 'text-slate-600'"
                        >
                          <n-icon v-if="parsedProposed.linkedin_url" :component="Link" size="14" />
                          {{ parsedProposed.linkedin_url || '—' }}
                        </div>
                      </div>
                    </div>

                    <!-- Actions Footer -->
                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                      <n-button
                        type="error"
                        ghost
                        size="medium"
                        :disabled="isSubmitting"
                        @click="openRejectConfirm"
                      >
                        <template #icon>
                          <n-icon :component="XIcon" />
                        </template>
                        Tolak Perubahan
                      </n-button>
                      <n-button
                        type="primary"
                        color="#0014B2"
                        size="medium"
                        :loading="isSubmitting"
                        @click="handleApprove"
                      >
                        <template #icon>
                          <n-icon :component="Check" />
                        </template>
                        Setujui Perubahan
                      </n-button>
                    </div>
                  </div>
                </n-card>
              </div>

              <!-- No Pending Request View -->
              <div v-else class="space-y-6">
                <!-- Alert Info -->
                <n-alert type="info" class="rounded-xl">
                  Tidak ada pengajuan perubahan data perusahaan yang sedang menunggu persetujuan (Pending) saat ini. Menampilkan data aktif perusahaan.
                </n-alert>

                <!-- Current Data Form Layout (matching Admin theme/style but read-only) -->
                <n-card :bordered="true" class="rounded-xl">
                  <div class="space-y-4">
                    <h2 class="text-base font-semibold text-slate-700">Informasi Perusahaan</h2>

                    <!-- 2-column grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      <!-- Left Column -->
                      <div class="space-y-5">
                        <!-- Email -->
                        <div>
                          <label class="block text-sm font-medium text-slate-660 mb-1.5">
                            Email Perusahaan
                          </label>
                          <n-input
                            :value="originalProfile?.email ?? ''"
                            placeholder="email@perusahaan.com"
                            :disabled="true"
                            size="medium"
                          />
                        </div>

                        <!-- Phone -->
                        <div>
                          <label class="block text-sm font-medium text-slate-600 mb-1.5">
                            Kontak Perusahaan
                          </label>
                          <n-input
                            :value="originalProfile?.phone ?? ''"
                            placeholder="+62 21 xxxx xxxx"
                            :disabled="true"
                            size="medium"
                          />
                        </div>

                        <!-- Address -->
                        <div>
                          <label class="block text-sm font-medium text-slate-600 mb-1.5">
                            Alamat Perusahaan
                          </label>
                          <n-input
                            :value="originalProfile?.address ?? ''"
                            type="textarea"
                            placeholder="Masukkan alamat perusahaan"
                            :rows="4"
                            :disabled="true"
                            size="medium"
                          />
                        </div>
                      </div>

                      <!-- Right Column -->
                      <div class="space-y-5">
                        <!-- Facebook -->
                        <div>
                          <div class="flex items-center justify-between mb-1.5">
                            <label class="text-sm font-medium text-slate-600">Facebook</label>
                            <span class="text-xs text-slate-400">Optional</span>
                          </div>
                          <n-input
                            :value="originalProfile?.facebook_url ?? ''"
                            placeholder="https://www.facebook.com/"
                            :disabled="true"
                            size="medium"
                          >
                            <template #prefix>
                              <n-icon :component="Link" class="text-slate-400" />
                            </template>
                          </n-input>
                        </div>

                        <!-- Twitter / X -->
                        <div>
                          <div class="flex items-center justify-between mb-1.5">
                            <label class="text-sm font-medium text-slate-600">Twitter/X</label>
                            <span class="text-xs text-slate-400">Optional</span>
                          </div>
                          <n-input
                            :value="originalProfile?.twitter_url ?? ''"
                            placeholder="https://x.com/"
                            :disabled="true"
                            size="medium"
                          >
                            <template #prefix>
                              <n-icon :component="Link" class="text-slate-400" />
                            </template>
                          </n-input>
                        </div>

                        <!-- Instagram -->
                        <div>
                          <div class="flex items-center justify-between mb-1.5">
                            <label class="text-sm font-medium text-slate-600">Instagram</label>
                            <span class="text-xs text-slate-400">Optional</span>
                          </div>
                          <n-input
                            :value="originalProfile?.instagram_url ?? ''"
                            placeholder="https://www.instagram.com/"
                            :disabled="true"
                            size="medium"
                          >
                            <template #prefix>
                              <n-icon :component="Link" class="text-slate-400" />
                            </template>
                          </n-input>
                        </div>

                        <!-- LinkedIn -->
                        <div>
                          <div class="flex items-center justify-between mb-1.5">
                            <label class="text-sm font-medium text-slate-600">LinkedIn</label>
                            <span class="text-xs text-slate-400">Optional</span>
                          </div>
                          <n-input
                            :value="originalProfile?.linkedin_url ?? ''"
                            placeholder="https://www.linkedin.com/"
                            :disabled="true"
                            size="medium"
                          >
                            <template #prefix>
                              <n-icon :component="Link" class="text-slate-400" />
                            </template>
                          </n-input>
                        </div>
                      </div>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </n-spin>
        </div>
      </div>

      <!-- ─── Modal Confirm Reject ────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showRejectConfirmModal"
        title="Alasan Penolakan Perubahan Data Perusahaan"
        width="460px"
        @close="closeRejectConfirm"
      >
        <div class="space-y-3">
          <p class="text-sm text-slate-600">Silakan masukkan alasan mengapa Anda menolak pengajuan ini:</p>
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

<style scoped>
:deep(.n-input.n-input--disabled .n-input__input-el),
:deep(.n-input.n-input--disabled .n-input__textarea-el) {
  color: #334155;
  -webkit-text-fill-color: #334155;
  cursor: default;
}

:deep(.n-input.n-input--disabled) {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}
</style>
