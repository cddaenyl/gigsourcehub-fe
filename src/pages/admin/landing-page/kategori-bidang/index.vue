<script setup lang="ts">
import CandidatePagination from '@/components/CandidatePagination.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import CareerDepartmentTable from '@/components/tables/CareerDepartmentTable.vue'
import { useCareerDepartments } from '@/composables/useCareerDepartments'
import AdminLayout from '@/layouts/AdminLayout.vue'
import type { CareerDepartment } from '@/models/CareerDepartment'
import {
  createCareerDepartmentApi,
  deleteCareerDepartmentApi,
  updateCareerDepartmentApi,
  uploadCareerDepartmentImageApi,
} from '@/services/career-department.service'
import { Folder, Plus } from '@vicons/tabler'
import type { UploadFileInfo } from 'naive-ui'
import {
  NAlert,
  NButton,
  NConfigProvider,
  NIcon,
  NInput,
  NP,
  NTab,
  NTabs,
  NText,
  NUpload,
  NUploadDragger,
  useDialog,
  useMessage,
} from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

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
const editTarget = ref<CareerDepartment | null>(null)

// Form state
const formName = ref('')
const formDescription = ref('')
const formImageFile = ref<File | null>(null)
const formImagePreviewUrl = ref<string | null>(null)

// ── API Integration ──────────────────────────────────────────────────────────
const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  search: searchQuery.value || undefined,
}))

const { careerDepartments, pageCount, isLoading, refetch } = useCareerDepartments(queryParams)

const formIsReady = computed(
  () => formName.value.trim().length > 0 && formDescription.value.trim().length > 0,
)

// ── File Upload Handlers ──────────────────────────────────────────────────────
const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  const fileInfo = options.fileList[0]
  if (fileInfo?.file) {
    formImageFile.value = fileInfo.file
    formImagePreviewUrl.value = URL.createObjectURL(fileInfo.file)
  } else {
    formImageFile.value = null
    formImagePreviewUrl.value = null
  }
}

const handleFileRemove = () => {
  formImageFile.value = null
  formImagePreviewUrl.value = null
  return true
}

// ── Handlers ──────────────────────────────────────────────────────────────────
const handleSearch = (val: string) => {
  searchQuery.value = val
  currentPage.value = 1
}

const resetForm = () => {
  formName.value = ''
  formDescription.value = ''
  formImageFile.value = null
  formImagePreviewUrl.value = null
}

const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

const openEditModal = (item: CareerDepartment) => {
  editTarget.value = item
  formName.value = item.name
  formDescription.value = item.description
  formImageFile.value = null
  formImagePreviewUrl.value = item.image_url ?? null
  showEditModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  resetForm()
}

const closeEditModal = () => {
  showEditModal.value = false
  editTarget.value = null
  resetForm()
}

const handleAdd = async () => {
  if (!formIsReady.value) {
    message.warning('Nama Bidang dan Deskripsi wajib diisi')
    return
  }
  isSubmitting.value = true
  try {
    const res = await createCareerDepartmentApi({
      name: formName.value,
      description: formDescription.value,
    })

    // Upload image jika ada (setelah record approval dibuat, image langsung ke record yang diapprove)
    // Untuk saat ini, image bisa diupload setelah approval
    if (formImageFile.value && res.data?.id) {
      try {
        await uploadCareerDepartmentImageApi(res.data.id, formImageFile.value)
      } catch {
        message.warning('Bidang berhasil ditambahkan, tetapi gagal mengunggah gambar')
      }
    }

    message.success('Kategori Bidang berhasil ditambahkan')
    refetch()
    closeAddModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan Kategori Bidang'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleEdit = async () => {
  if (!formIsReady.value) {
    message.warning('Nama Bidang dan Deskripsi wajib diisi')
    return
  }
  if (!editTarget.value) return
  isSubmitting.value = true
  try {
    await updateCareerDepartmentApi(editTarget.value.id, {
      name: formName.value,
      description: formDescription.value,
    })

    // Upload image baru jika dipilih
    if (formImageFile.value) {
      try {
        await uploadCareerDepartmentImageApi(editTarget.value.id, formImageFile.value)
      } catch {
        message.warning('Perubahan berhasil disimpan, tetapi gagal mengunggah gambar baru')
      }
    }

    message.success('Kategori Bidang berhasil diperbarui')
    refetch()
    closeEditModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui Kategori Bidang'
    message.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

const handleTableAction = (action: 'edit' | 'delete', item: CareerDepartment) => {
  if (action === 'edit') {
    openEditModal(item)
  } else if (action === 'delete') {
    dialog.warning({
      title: 'Hapus Kategori Bidang',
      content: `Yakin ingin menghapus Kategori Bidang "${item.name}"?`,
      positiveText: 'Hapus',
      negativeText: 'Batal',
      onPositiveClick: async () => {
        try {
          await deleteCareerDepartmentApi(item.id)
          message.success('Kategori Bidang berhasil dihapus')
          refetch()
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menghapus Kategori Bidang'
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
        <div class="flex-1">
          <!-- Tabs + Action bar -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
            <n-tabs
              value="kategori-bidang"
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
                Tambah Bidang
              </n-button>
            </div>
          </div>

          <!-- Table -->
          <CareerDepartmentTable
            :data="careerDepartments"
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

      <!-- ─── Modal Tambah Bidang ────────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showAddModal"
        title="Tambah Bidang"
        width="560px"
        @close="closeAddModal"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Nama Bidang</label>
            <n-input
              v-model:value="formName"
              placeholder="Masukkan nama bidang"
              size="medium"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi Bidang</label>
            <n-input
              v-model:value="formDescription"
              type="textarea"
              placeholder="Masukkan deskripsi bidang"
              :rows="4"
              size="medium"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Gambar Bidang</label>
            <n-upload
              accept="image/jpeg,image/png"
              :max="1"
              @change="handleFileChange"
              @remove="handleFileRemove"
            >
              <n-upload-dragger class="!border-dashed !border-slate-300 !rounded-xl !bg-white hover:!border-blue-900 transition-colors">
                <div class="flex flex-col items-center gap-2 py-6">
                  <n-icon :component="Folder" size="36" class="text-slate-400" />
                  <n-text class="text-sm font-semibold text-slate-700">
                    Drop your files or click to upload
                  </n-text>
                  <n-p class="text-xs text-slate-400 !mt-0 !mb-3">
                    Supported file types: PNG, JPG
                  </n-p>
                  <n-button size="small" class="!border-slate-200 !text-slate-600 px-4" ghost>
                    Browse
                  </n-button>
                </div>
              </n-upload-dragger>
            </n-upload>
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

      <!-- ─── Modal Edit Bidang ──────────────────────────────────────────────── -->
      <BaseModal
        v-model:show="showEditModal"
        title="Edit Bidang"
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
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Nama Bidang</label>
            <n-input
              v-model:value="formName"
              placeholder="Masukkan nama bidang"
              size="medium"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi Bidang</label>
            <n-input
              v-model:value="formDescription"
              type="textarea"
              placeholder="Masukkan deskripsi bidang"
              :rows="4"
              size="medium"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Gambar Bidang</label>

            <!-- Preview gambar yang sudah ada -->
            <div v-if="formImagePreviewUrl && !formImageFile" class="mb-3">
              <p class="text-xs text-slate-500 mb-1">Gambar saat ini:</p>
              <img
                :src="formImagePreviewUrl"
                alt="Current image"
                class="h-24 w-auto rounded-md border border-slate-200 object-cover"
              />
            </div>

            <n-upload
              accept="image/jpeg,image/png"
              :max="1"
              @change="handleFileChange"
              @remove="handleFileRemove"
            >
              <n-upload-dragger class="!border-dashed !border-slate-300 !rounded-xl !bg-white hover:!border-blue-900 transition-colors">
                <div class="flex flex-col items-center gap-2 py-6">
                  <n-icon :component="Folder" size="36" class="text-slate-400" />
                  <n-text class="text-sm font-semibold text-slate-700">
                    Drop your files or click to upload
                  </n-text>
                  <n-p class="text-xs text-slate-400 !mt-0 !mb-3">
                    Supported file types: PNG, JPG
                  </n-p>
                  <n-button size="small" class="!border-slate-200 !text-slate-600 px-4" ghost>
                    Browse
                  </n-button>
                </div>
              </n-upload-dragger>
            </n-upload>
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
