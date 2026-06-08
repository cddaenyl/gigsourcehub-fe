<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { NIcon, NInput, NForm, NFormItem, NSpin, NModal, useMessage } from 'naive-ui'
import { Lock, CircleX } from '@vicons/tabler'
import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth.store'

const message = useMessage()
const router = useRouter()
const authStore = useAuthStore()

const {
  changePasswordAsync,
  isChangingPassword,
  deleteAccountAsync,
  isDeletingAccount,
} = useProfile()

// Ubah Password Form
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const initPasswordForm = () => {
  passwordForm.value.oldPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
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

  try {
    await changePasswordAsync({
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword,
    })
    message.success('Password Anda berhasil diperbarui!')
    initPasswordForm()
  } catch (err: any) {
    message.error(err.message || 'Gagal memperbarui password')
  }
}

// Delete Account Modal
const showDeleteModal = ref(false)
const deletePassword = ref('')

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletePassword.value = ''
}

const confirmDeleteAccount = async () => {
  if (!deletePassword.value) {
    message.error('Password konfirmasi wajib diisi')
    return
  }

  try {
    await deleteAccountAsync({
      password: deletePassword.value,
    })
    message.success('Akun Anda berhasil dihapus.')
    closeDeleteModal()
    authStore.logout()
    router.push('/')
  } catch (err: any) {
    message.error(err.message || 'Gagal menghapus akun')
  }
}
</script>

<template>
  <CandidateLayout>
    <div class="p-8 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-800">Account</h2>
    </div>

    <div class="p-8 space-y-12">
      <!-- Keamanan & Password Section -->
      <n-spin :show="isChangingPassword">
        <template #icon>
          <div class="flex gap-2">
            <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
            <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
        </template>
        <div class="max-w-2xl">
          <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <n-icon :component="Lock" class="text-primary" /> Keamanan & Password
          </h3>
          <p class="text-slate-400 text-xs mb-6">Ubah password Anda untuk menjaga keamanan akun.</p>

          <n-form :model="passwordForm" label-placement="top" size="medium" class="space-y-4">
            <n-form-item label="Password Saat Ini" required>
              <n-input
                v-model:value="passwordForm.oldPassword"
                type="password"
                show-password-on="click"
                placeholder="Masukkan password saat ini"
                class="rounded-lg"
              />
            </n-form-item>

            <n-form-item label="Password Baru" required>
              <n-input
                v-model:value="passwordForm.newPassword"
                type="password"
                show-password-on="click"
                placeholder="Masukkan password baru"
                class="rounded-lg"
              />
            </n-form-item>

            <n-form-item label="Konfirmasi Password Baru" required>
              <n-input
                v-model:value="passwordForm.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="Konfirmasi password baru Anda"
                class="rounded-lg"
              />
            </n-form-item>
          </n-form>

          <div class="flex justify-end gap-3 mt-8">
            <button
              @click="initPasswordForm"
              :disabled="isChangingPassword"
              class="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              @click="handleSavePassword"
              :disabled="isChangingPassword"
              class="px-5 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:scale-[1.02] cursor-pointer bg-[#0014B2] hover:bg-[#000f80]"
            >
              Ubah Password
            </button>
          </div>
        </div>
      </n-spin>

      <hr class="border-gray-100" />

      <!-- Delete Account Section -->
      <div class="max-w-2xl">
        <h3 class="text-lg font-bold text-slate-800 mb-2">Delete Account</h3>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <p class="text-slate-400 text-sm max-w-lg leading-relaxed">
            This action is permanent, and you will not be able to register a new GigSource Hub account using your current email address.
          </p>
          <button
            @click="showDeleteModal = true"
            class="px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:scale-[1.02] cursor-pointer bg-red-500 hover:bg-red-600 active:bg-red-700 shrink-0 self-start md:self-center"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Akun -->
    <n-modal v-model:show="showDeleteModal" transform-origin="center">
      <div class="bg-white rounded-lg shadow-xl overflow-hidden w-[90vw] md:w-[40vw] max-w-[580px] relative flex flex-col">
        <!-- Content -->
        <div class="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          <!-- Big Center Icon -->
          <div class="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
            <n-icon size="40">
              <CircleX />
            </n-icon>
          </div>

          <h3 class="text-xl font-bold text-slate-800 mb-4">
            Hapus Akun
          </h3>
          <p class="text-slate-500 text-sm leading-relaxed max-w-[420px] mb-6">
            Tindakan ini permanent dan Anda tidak akan bisa mendaftar akun GigSource Hub baru dengan menggunakan email saat ini. Silakan masukkan password Anda untuk konfirmasi.
          </p>

          <!-- Password Input -->
          <div class="w-full text-left">
            <label class="block text-xs font-semibold text-slate-500 mb-2">Password Anda</label>
            <n-input
              v-model:value="deletePassword"
              type="password"
              show-password-on="click"
              placeholder="Masukkan password Anda"
              class="rounded-lg w-full"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-slate-50 px-8 py-5 flex items-center justify-center gap-3 border-t border-slate-100">
          <button
            @click="closeDeleteModal"
            :disabled="isDeletingAccount"
            class="px-6 py-2 h-10 min-w-[100px] rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors text-[14px] cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmDeleteAccount"
            :disabled="isDeletingAccount || !deletePassword"
            class="px-6 py-2 h-10 min-w-[100px] rounded-md text-white font-medium transition-colors text-[14px] bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            <span v-if="isDeletingAccount">Processing...</span>
            <span v-else>Hapus Akun</span>
          </button>
        </div>
      </div>
    </n-modal>
  </CandidateLayout>
</template>
