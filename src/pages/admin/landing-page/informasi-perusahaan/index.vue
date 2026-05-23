<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  NButton,
  NIcon,
  NInput,
  NCard,
  NTabs,
  NTab,
  NConfigProvider,
  NSpin,
  NAlert,
  useMessage,
  useDialog,
} from 'naive-ui'
import { Edit, Link } from '@vicons/tabler'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useCompanyProfile } from '@/composables/useCompanyProfile'
import { updateCompanyProfileApi, cancelCompanyProfileApprovalApi } from '@/services/company-profile.service'
import type { CompanyProfile } from '@/models/CompanyProfile'

// ── Router ────────────────────────────────────────────────────────────────────
const router = useRouter()

const handleTabChange = (key: string) => {
  router.push(`/admin/landing-page/${key}`)
}

// ── Message & Dialog ──────────────────────────────────────────────────────────
const message = useMessage()
const dialog = useDialog()

// ── State ─────────────────────────────────────────────────────────────────────
const isEditMode = ref(false)
const isSubmitting = ref(false)

// ── API Integration ──────────────────────────────────────────────────────────
const { profile: apiProfile, isLoading, refetch } = useCompanyProfile()

const formProfile = reactive<CompanyProfile>({
  id: '',
  email: '',
  phone: '',
  address: '',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  linkedin_url: '',
  created_at: '',
  updated_at: '',
  pending_approval: null,
})

// Sync backend profile data to form
watch(
  apiProfile,
  (val) => {
    if (val) {
      Object.assign(formProfile, val)
      if (val.pending_approval && val.pending_approval.proposed_data) {
        try {
          const proposed = JSON.parse(val.pending_approval.proposed_data)
          // Prefill fields with draft/proposed values
          Object.assign(formProfile, proposed)
        } catch (e) {
          // ignore
        }
      }
    }
  },
  { immediate: true },
)

// Snapshot for cancel action
let snapshot: CompanyProfile = { ...formProfile }

// ── Handlers ──────────────────────────────────────────────────────────────────
const enterEditMode = () => {
  snapshot = { ...formProfile }
  isEditMode.value = true
}

const cancelEdit = () => {
  Object.assign(formProfile, snapshot)
  isEditMode.value = false
}

const saveEdit = async () => {
  isSubmitting.value = true
  try {
    await updateCompanyProfileApi({
      email: formProfile.email,
      phone: formProfile.phone,
      address: formProfile.address,
      facebook_url: formProfile.facebook_url,
      twitter_url: formProfile.twitter_url,
      instagram_url: formProfile.instagram_url,
      linkedin_url: formProfile.linkedin_url,
    })
    message.success('Perubahan data perusahaan berhasil diajukan')
    isEditMode.value = false
    refetch()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui informasi perusahaan'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancelApproval = () => {
  if (!formProfile.pending_approval) return
  dialog.warning({
    title: 'Batalkan Perubahan',
    content: 'Apakah Anda yakin ingin membatalkan perubahan data perusahaan yang sedang menunggu approval?',
    positiveText: 'Batalkan',
    negativeText: 'Batal',
    onPositiveClick: async () => {
      isSubmitting.value = true
      try {
        await cancelCompanyProfileApprovalApi(formProfile.pending_approval!.id)
        message.success('Perubahan data perusahaan berhasil dibatalkan')
        refetch()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal membatalkan perubahan'
        message.error(msg)
      } finally {
        isSubmitting.value = false
      }
    },
  })
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
              value="informasi-perusahaan"
              type="line"
              @update:value="handleTabChange"
            >
              <n-tab name="faq">FAQ</n-tab>
              <n-tab name="informasi-perusahaan">Informasi Perusahaan</n-tab>
              <n-tab name="kategori-bidang">Kategori Bidang</n-tab>
            </n-tabs>

            <!-- Edit button -->
            <div class="flex gap-2 pb-1">
              <template v-if="formProfile.pending_approval">
                <n-button type="error" color="#EF4444" :disabled="isSubmitting" @click="handleCancelApproval">
                  Batalkan Perubahan
                </n-button>
                <n-button type="primary" color="#0014B2" disabled>
                  <template #icon>
                    <n-icon :component="Edit" />
                  </template>
                  Edit Data Perusahaan
                </n-button>
              </template>
              <template v-else-if="!isEditMode">
                <n-button type="primary" color="#0014B2" :disabled="isLoading" @click="enterEditMode">
                  <template #icon>
                    <n-icon :component="Edit" />
                  </template>
                  Edit Data Perusahaan
                </n-button>
              </template>
              <template v-else>
                <n-button :disabled="isSubmitting" @click="cancelEdit">Batal</n-button>
                <n-button type="primary" color="#0014B2" :loading="isSubmitting" @click="saveEdit">
                  Simpan Perubahan
                </n-button>
              </template>
            </div>
          </div>

          <!-- Alert Banner -->
          <n-alert
            v-if="formProfile.pending_approval"
            type="warning"
            class="rounded-xl"
          >
            Menunggu Approval Superadmin
          </n-alert>

          <!-- Form Card -->
          <n-spin :show="isLoading">
            <n-card :bordered="true" class="rounded-xl">
              <div class="space-y-4">
                <h2 class="text-base font-semibold text-slate-700">Informasi Perusahaan</h2>

                <!-- 2-column grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <!-- Left Column -->
                  <div class="space-y-5">
                    <!-- Email -->
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1.5">
                        Email Perusahaan
                      </label>
                      <n-input
                        v-model:value="formProfile.email"
                        placeholder="email@perusahaan.com"
                        :disabled="!isEditMode"
                        size="medium"
                      />
                    </div>

                    <!-- Phone -->
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1.5">
                        Kontak Perusahaan
                      </label>
                      <n-input
                        v-model:value="formProfile.phone"
                        placeholder="+62 21 xxxx xxxx"
                        :disabled="!isEditMode"
                        size="medium"
                      />
                    </div>

                    <!-- Address -->
                    <div>
                      <label class="block text-sm font-medium text-slate-600 mb-1.5">
                        Alamat Perusahaan
                      </label>
                      <n-input
                        v-model:value="formProfile.address"
                        type="textarea"
                        placeholder="Masukkan alamat perusahaan"
                        :rows="4"
                        :disabled="!isEditMode"
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
                        v-model:value="formProfile.facebook_url"
                        placeholder="https://www.facebook.com/"
                        :disabled="!isEditMode"
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
                        v-model:value="formProfile.twitter_url"
                        placeholder="https://x.com/"
                        :disabled="!isEditMode"
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
                        v-model:value="formProfile.instagram_url"
                        placeholder="https://www.instagram.com/"
                        :disabled="!isEditMode"
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
                        v-model:value="formProfile.linkedin_url"
                        placeholder="https://www.linkedin.com/"
                        :disabled="!isEditMode"
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
          </n-spin>
        </div>
      </div>
    </n-config-provider>
  </AdminLayout>
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
