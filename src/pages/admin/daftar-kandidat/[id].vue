<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CandidateBookmark from '@/components/CandidateBookmark.vue'
import {
  NCard,
  NButton,
  NIcon,
  NSpin,
  NTag,
  NAvatar,
  NSelect,
  NInput,
  NGrid,
  NGi,
  NSpace,
} from 'naive-ui'
import { ChevronLeft, UserSearch, MessageCircle2, Link, Send } from '@vicons/tabler'

const route = useRoute()
const router = useRouter()

const userId = computed((): string => {
  const params = route.params as Record<string, string | string[]>
  const id = params['id']
  if (Array.isArray(id)) {
    return id[0] || ''
  }
  return id || ''
})

const levelOptions = [
  {
    label: 'Junior',
    value: 'Junior',
  },
  {
    label: 'Middle',
    value: 'Middle',
  },
  {
    label: 'Senior',
    value: 'Senior',
  },
  {
    label: 'In-Eligible',
    value: 'In-Eligible',
  },
]

const recruitmentOptions = [
  {
    label: 'Drive My Car',
    value: 'song1',
  },
  {
    label: 'Norwegian Wood',
    value: 'song2',
  },
  {
    label: "You Won't See",
    value: 'song3',
  },
  {
    label: 'Nowhere Man',
    value: 'song4',
  },
]

// Fetch user data
const { user, isLoading, isError, error } = useUser(userId)

// Handlers
const handleBack = () => {
  router.push('/admin/daftar-kandidat')
}

const handleRecruit = () => {
  console.log('Recruit candidate:', user.value)
  // TODO: Implement recruit logic
}

const handleChat = () => {
  console.log('Chat with candidate:', user.value)
  // TODO: Implement chat logic
}

// Format date helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getCandidateAge = (dateString: string | null) => {
  if (!dateString) return '-'
  const birthDate = new Date(dateString)
  const ageDifMs = Date.now() - birthDate.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

// Add thumbnail suffix to profile picture
const getProfilePictureThumbnail = (url: string | null) => {
  if (!url) return undefined

  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) return url

  const filename = url.substring(0, lastDotIndex)
  const extension = url.substring(lastDotIndex)

  return `${filename}_thumb${extension}`
}

const profilePictureThumbnail = computed(() =>
  user.value ? getProfilePictureThumbnail(user.value.profile_picture) : undefined,
)

// Get recruitment status color
// const getRecruitmentStatusColor = (status: string | null): TagProps['type'] => {
//   if (!status) return 'default'
//   const statusColors: Record<string, TagProps['type']> = {
//     'un-reviewed': 'default',
//     reviewed: 'info',
//     shortlisted: 'warning',
//     interview: 'warning',
//     accepted: 'success',
//     rejected: 'error',
//   }
//   return statusColors[status.toLowerCase()] || 'default'
// }
</script>

<template>
  <AdminLayout>
    <div class="mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between h-12">
        <div class="flex items-center gap-4">
          <div class="flex items-center bg-primary rounded-full p-1">
            <n-button text @click="handleBack">
              <template #icon>
                <n-icon :component="ChevronLeft" :size="16" color="#FFFFFF" />
              </template>
            </n-button>
          </div>

          <h1 class="text-xl font-semibold text-gray-700">Detail Kandidat</h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <n-spin size="large" />
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="text-center py-20">
        <p class="text-red-500">{{ error?.message || 'Failed to load candidate data' }}</p>
        <n-button type="primary" @click="handleBack" class="mt-4">
          Kembali ke Daftar Kandidat
        </n-button>
      </div>

      <!-- Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- Profile Card -->
        <n-card>
          <div class="flex gap-4 items-center px-1 stroke-gray-200">
            <div class="flex items-center justify-center">
              <n-avatar :size="50" :src="profilePictureThumbnail" round>
                <template #fallback>
                  <n-icon :component="UserSearch" :size="24" />
                </template>
              </n-avatar>
            </div>

            <div class="flex-1">
              <h2 class="text-lg font-bold text-gray-800">{{ user.name }}</h2>
              <!-- <p class="text-gray-600">{{ user.email }}</p> -->
              <n-tag size="small" type="primary" round>Available (Api Not Developed)</n-tag>
            </div>
            <div class="flex items-center gap-2">
              <n-button style="width: 40px; height: 35px; padding: 0">
                <CandidateBookmark class="scale-125" v-if="user" :user-id="user.id" />
              </n-button>
              <n-button type="primary" @click="handleChat">
                <template #icon>
                  <n-icon :component="MessageCircle2" />
                </template>
              </n-button>
              <n-button type="primary" @click="handleRecruit">
                <template #icon>
                  <n-icon :component="UserSearch" />
                </template>
                Rekrut
              </n-button>
            </div>
          </div>
        </n-card>

        <n-grid :x-gap="8" :cols="2" item-responsive>
          <!-- Contact Information -->
          <n-gi>
            <n-card :content-style="{ padding: '20px' }">
              <n-space vertical :size="24">
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Tanggal Lahir</h4>
                  <n-space horizontal
                    ><span class="font-bold text-sm text-gray-700">{{
                      formatDate(user.birthdate)
                    }}</span>
                    <span class="text-[12px]">({{ getCandidateAge(user.birthdate) }} tahun)</span>
                  </n-space>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Email</h4>
                  <span class="font-bold text-sm text-gray-700">{{ user.email }}</span>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Nomor Telepon</h4>
                  <span class="font-bold text-sm text-gray-700">{{
                    user.phone_number || '-'
                  }}</span>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Pendidikan Terakhir</h4>
                  <n-grid :cols="2" :x-gap="12">
                    <n-gi>
                      <n-space vertical :size="4">
                        <h4 class="font-bold text-xs text-gray-500">Universitas/Sekolah</h4>
                        <span class="font-bold text-sm text-gray-700">{{
                          user.school_university || '-'
                        }}</span>
                      </n-space>
                    </n-gi>
                    <n-gi>
                      <n-space vertical :size="4">
                        <h4 class="font-bold text-xs text-gray-500">Jurusan</h4>
                        <span class="font-bold text-sm text-gray-700">{{ user.major || '-' }}</span>
                      </n-space>
                    </n-gi>
                  </n-grid>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">IP Kumulatif</h4>
                  <span class="font-bold text-sm text-gray-700">{{ user.gpa || '-' }}</span>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Domisili</h4>
                  <n-grid :cols="2" :x-gap="12">
                    <n-gi>
                      <n-space vertical :size="4">
                        <h4 class="font-bold text-xs text-gray-500">Kabupaten/Kota</h4>
                        <span class="font-bold text-sm text-gray-700">{{
                          user.profile_picture || '-'
                        }}</span>
                      </n-space>
                    </n-gi>
                    <n-gi>
                      <n-space vertical :size="4">
                        <h4 class="font-bold text-xs text-gray-500">Provinsi</h4>
                        <span class="font-bold text-sm text-gray-700">{{
                          user.profile_picture || '-'
                        }}</span>
                      </n-space>
                    </n-gi>
                  </n-grid>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Bidang Minat</h4>
                  <span class="font-bold text-sm text-gray-700">{{
                    user.profile_picture || '-'
                  }}</span>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Applied Role</h4>
                  <span class="font-bold text-sm text-gray-700">{{
                    user.profile_picture || '-'
                  }}</span>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Keahlian</h4>
                  <span class="font-bold text-sm text-gray-700">{{ user.tech_stack || '-' }}</span>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Link Portofolio</h4>
                  <n-space align="center" :size="8">
                    <n-icon :component="Link" size="20" color="#64748B" />
                    <a
                      v-if="user.portofolio_link"
                      :href="user.portofolio_link"
                      target="_blank"
                      class="underline text-blue-700 font-semibold text-md truncate"
                    >
                      {{ user.portofolio_link }}
                    </a>
                    <span v-else>-</span>
                  </n-space>
                </n-space>
                <n-space vertical :size="8">
                  <h4 class="font-bold text-xs text-gray-500">Curiculum Vitae</h4>
                  <span class="font-bold text-sm text-gray-700">{{ user.gpa || '-' }}</span>
                </n-space>
              </n-space>
            </n-card>
          </n-gi>

          <!-- Right Side: Kontrol Rekrutmen and Notes -->
          <n-gi>
            <n-space vertical :size="8" style="height: 100%; display: flex; flex-direction: column">
              <!-- Kontrol Rekrutmen-->
              <n-card :content-style="{ padding: '20px' }">
                <n-space vertical :size="24">
                  <n-space vertical :size="2">
                    <h4 class="font-bold text-sm text-gray-500">Kontrol Rekrutmen</h4>
                    <p class="text-xs text-gray-400">Kelola level kandidat dan status Rekrutmen</p>
                  </n-space>
                  <n-space vertical :size="4">
                    <h4 class="font-bold text-xs text-gray-500">Level Kandidat</h4>
                    <n-select placeholder="Pilih Level Kandidat" :options="levelOptions" />
                  </n-space>
                  <n-space vertical :size="4">
                    <h4 class="font-bold text-xs text-gray-500">Status Rekrutmen</h4>
                    <n-select placeholder="Pilih Status Rekrutmen" :options="recruitmentOptions" />
                  </n-space>
                </n-space>
              </n-card>

              <!-- Notes -->
              <n-card
                style="flex: 1"
                :content-style="{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px',
                }"
              >
                <n-space
                  vertical
                  :size="16"
                  style="height: 100%; display: flex; flex-direction: column; flex: 1"
                >
                  <n-space vertical :size="2">
                    <h4 class="font-bold text-sm text-gray-500">Catatan</h4>
                  </n-space>
                  <n-space vertical :size="2">
                    <h4 class="text-xs text-gray-400">Belum Ada Catatan</h4>
                  </n-space>
                  <n-space vertical :size="2">
                    <!-- Search Bar -->
                    <n-input
                      placeholder="Type here..."
                      round
                      type="textarea"
                      style="border-radius: 2rem"
                      class="py-1"
                      :autosize="{
                        minRows: 1,
                        maxRows: 3,
                      }"
                    >
                      <template #suffix>
                        <n-button circle type="primary" size="small">
                          <template #icon>
                            <n-icon :component="Send" />
                          </template>
                        </n-button>
                      </template>
                    </n-input>
                  </n-space>
                </n-space>
              </n-card>
            </n-space>
          </n-gi>
        </n-grid>
        <n-space vertical :size="8">
          <n-space vertical :size="2">
            <h4 class="font-bold text-sm text-gray-500">On Boarding History</h4>
            <p class="text-xs text-gray-400">History on boarding kandidat</p>
          </n-space>
          <!-- Recruitment Information -->
          <n-card>
            <h4 class="font-bold text-xs text-gray-500">Belum ada Status (API NOT DEVELOPED)</h4>
          </n-card>
        </n-space>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.n-card {
  box-shadow: 0 0px px rgba(0, 0, 0, 0.1);
}
</style>
