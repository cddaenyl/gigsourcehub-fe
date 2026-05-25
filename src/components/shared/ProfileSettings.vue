<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  NCard,
  NInput,
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NSpin,
  useMessage,
  NAvatar,
} from 'naive-ui'
import { Camera, Lock, User as UserIcon } from '@vicons/tabler'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth.store'
import { useMeQuery } from '@/composables/useAuth'

const message = useMessage()
const authStore = useAuthStore()
const { data: me } = useMeQuery()

const {
  uploadPictureAsync,
  updateProfileAsync,
  changePasswordAsync,
  profile,
} = useProfile()

const defaultAvatarSeed = 'HumanResource'

const getThumbUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined
  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) return url
  const filename = url.substring(0, lastDotIndex)
  const extension = url.substring(lastDotIndex)
  return `${filename}_thumb${extension}`
}

const userInfo = computed(() => {
  const user = profile.value || me.value || authStore.user
  const name = user?.name || 'Human Resource'
  const email = user?.email || 'human.resource@gigsource.com'
  const avatar =
    getThumbUrl(user?.profile_picture) ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || defaultAvatarSeed)}`

  return {
    name,
    email,
    avatar,
  }
})

const isLoading = ref(false)
const isSavingProfile = ref(false)
const isSavingPassword = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewAvatarUrl = ref<string | null>(null)

const profileForm = ref({
  name: '',
  birthdate: null as number | null,
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Initialize/Reset forms
const initProfileForm = () => {
  isLoading.value = true
  const user = (profile.value || me.value || authStore.user) as any
  profileForm.value.name = user?.name || ''
  profileForm.value.birthdate = user?.birthdate ? new Date(user.birthdate).getTime() : null
  previewAvatarUrl.value = null
  selectedFile.value = null
  isLoading.value = false
}

const initPasswordForm = () => {
  passwordForm.value.oldPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
}

onMounted(() => {
  initProfileForm()
  initPasswordForm()
})

watch(() => profile.value, () => {
  initProfileForm()
}, { deep: true })

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ukuran gambar maksimal adalah 2MB')
      return
    }
    selectedFile.value = file
    previewAvatarUrl.value = URL.createObjectURL(file)
  }
}

const handleSaveProfile = async () => {
  if (!profileForm.value.name.trim()) {
    message.error('Nama lengkap wajib diisi')
    return
  }

  isSavingProfile.value = true
  try {
    // 1. Upload picture if selected
    if (selectedFile.value) {
      await uploadPictureAsync(selectedFile.value)
    }

    // 2. Update profile name & birthdate
    const birthdateStr = profileForm.value.birthdate
      ? new Date(profileForm.value.birthdate).toISOString().split('T')[0]
      : null

    await updateProfileAsync({
      name: profileForm.value.name,
      birthdate: birthdateStr,
    })

    message.success('Profil Anda berhasil diperbarui!')
    selectedFile.value = null
  } catch (err: any) {
    message.error(err.message || 'Gagal memperbarui profil')
  } finally {
    isSavingProfile.value = false
  }
}

const handleSavePassword = async () => {
  if (!passwordForm.value.oldPassword) {
    message.error('Password saat ini wajib diisi')
    return
  }
  if (!passwordForm.value.newPassword) {
    message.error('Password baru wajib diisi')
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    message.error('Password baru minimal 6 karakter')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    message.error('Konfirmasi password baru tidak sesuai')
    return
  }

  isSavingPassword.value = true
  try {
    await changePasswordAsync({
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword,
    })

    message.success('Password Anda berhasil diperbarui!')
    initPasswordForm()
  } catch (err: any) {
    message.error(err.message || 'Gagal memperbarui password')
  } finally {
    isSavingPassword.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Profile Settings</h1>
    </div>

    <!-- Profile Information Card -->
    <n-spin :show="isLoading || isSavingProfile">
      <n-card class="shadow-sm border-none rounded-xl" title="Informasi Profil">
        <div class="max-w-2xl mx-auto py-4">
          <div class="flex flex-col items-center mb-8">
            <div
              @click="triggerFileInput"
              class="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border-4 border-[#C7D0F3] shadow-md transition-all hover:scale-105"
            >
              <n-avatar
                round
                :size="104"
                :src="previewAvatarUrl || userInfo.avatar"
                class="bg-gray-100"
              />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera class="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              class="hidden"
              @change="onFileSelected"
            />
            <div class="text-xs text-gray-400 mt-3">JPEG, PNG, WebP (Maks. 2MB)</div>
          </div>

          <n-form :model="profileForm" label-placement="top" size="medium">
            <n-form-item label="Nama Lengkap" path="name" required>
              <n-input
                v-model:value="profileForm.name"
                placeholder="Masukkan nama lengkap Anda"
                class="rounded-lg"
              >
                <template #prefix>
                  <UserIcon class="w-4 h-4 text-gray-400 mr-1" />
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="Tanggal Lahir" path="birthdate">
              <n-date-picker
                v-model:value="profileForm.birthdate"
                type="date"
                class="w-full rounded-lg"
                placeholder="Pilih tanggal lahir"
                clearable
              />
            </n-form-item>
          </n-form>

          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <n-button :disabled="isSavingProfile" @click="initProfileForm" class="rounded-lg">
              Reset
            </n-button>
            <n-button
              type="primary"
              color="#0014B2"
              :loading="isSavingProfile"
              @click="handleSaveProfile"
              class="rounded-lg font-semibold px-6"
            >
              Simpan Profil
            </n-button>
          </div>
        </div>
      </n-card>
    </n-spin>

    <!-- Security & Password Card -->
    <n-spin :show="isSavingPassword">
      <n-card class="shadow-sm border-none rounded-xl" title="Keamanan & Password">
        <div class="max-w-2xl mx-auto py-4">
          <h3 class="text-sm font-semibold text-gray-500 mb-6 flex items-center gap-2">
            <Lock class="w-4 h-4 text-primary" /> Ubah Password
          </h3>

          <n-form :model="passwordForm" label-placement="top" size="medium">
            <n-form-item label="Password Saat Ini" path="oldPassword" required>
              <n-input
                v-model:value="passwordForm.oldPassword"
                type="password"
                show-password-on="click"
                placeholder="Masukkan password saat ini"
                class="rounded-lg"
              />
            </n-form-item>

            <n-form-item label="Password Baru" path="newPassword" required>
              <n-input
                v-model:value="passwordForm.newPassword"
                type="password"
                show-password-on="click"
                placeholder="Masukkan password baru"
                class="rounded-lg"
              />
            </n-form-item>

            <n-form-item label="Konfirmasi Password Baru" path="confirmPassword" required>
              <n-input
                v-model:value="passwordForm.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="Konfirmasi password baru Anda"
                class="rounded-lg"
              />
            </n-form-item>
          </n-form>

          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <n-button :disabled="isSavingPassword" @click="initPasswordForm" class="rounded-lg">
              Reset
            </n-button>
            <n-button
              type="primary"
              color="#0014B2"
              :loading="isSavingPassword"
              @click="handleSavePassword"
              class="rounded-lg font-semibold px-6"
            >
              Ubah Password
            </n-button>
          </div>
        </div>
      </n-card>
    </n-spin>
  </div>
</template>

<style scoped>
:deep(.n-card) {
  --n-border-radius: 12px;
}
</style>
