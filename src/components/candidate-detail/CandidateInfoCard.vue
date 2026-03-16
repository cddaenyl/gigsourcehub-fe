<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/models/User'
import { NCard, NTag, NIcon, NSpace, NGrid, NGi } from 'naive-ui'
import { Link } from '@vicons/tabler'

const props = defineProps<{
  user: User
}>()

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

const techStack = computed((): string[] => {
  if (!props.user.tech_stack) return []
  try {
    const parsed = JSON.parse(props.user.tech_stack)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to parse tech_stack:', error)
    return []
  }
})
</script>

<template>
  <n-card :content-style="{ padding: '20px' }">
    <n-space vertical :size="24">
      <n-space vertical :size="8">
        <h4 class="font-bold text-xs text-gray-500">Tanggal Lahir</h4>
        <n-space horizontal>
          <span class="font-bold text-sm text-gray-700">{{ formatDate(user.birthdate) }}</span>
          <span class="text-[12px]">({{ getCandidateAge(user.birthdate) }} tahun)</span>
        </n-space>
      </n-space>
      <n-space vertical :size="8">
        <h4 class="font-bold text-xs text-gray-500">Email</h4>
        <span class="font-bold text-sm text-gray-700">{{ user.email }}</span>
      </n-space>
      <n-space vertical :size="8">
        <h4 class="font-bold text-xs text-gray-500">Nomor Telepon</h4>
        <span class="font-bold text-sm text-gray-700">{{ user.phone_number || '-' }}</span>
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
              <span class="font-bold text-sm text-gray-700">{{ user.profile_picture || '-' }}</span>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical :size="4">
              <h4 class="font-bold text-xs text-gray-500">Provinsi</h4>
              <span class="font-bold text-sm text-gray-700">{{ user.profile_picture || '-' }}</span>
            </n-space>
          </n-gi>
        </n-grid>
      </n-space>
      <n-space vertical :size="8">
        <h4 class="font-bold text-xs text-gray-500">Bidang Minat</h4>
        <span class="font-bold text-sm text-gray-700">{{ user.profile_picture || '-' }}</span>
      </n-space>
      <n-space vertical :size="8">
        <h4 class="font-bold text-xs text-gray-500">Applied Role</h4>
        <span class="font-bold text-sm text-gray-700">{{ user.profile_picture || '-' }}</span>
      </n-space>
      <n-space vertical :size="8" class="w-2/3">
        <h4 class="font-bold text-xs text-gray-500">Keahlian</h4>
        <n-space v-if="techStack.length > 0" :size="8">
          <n-tag
            v-for="tech in techStack"
            :key="tech"
            round
            :color="{ color: 'white', borderColor: '#07229E', textColor: '#07229E' }"
          >
            {{ tech }}
          </n-tag>
        </n-space>
        <span v-else class="font-bold text-sm text-gray-700">-</span>
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
</template>

<style scoped></style>
