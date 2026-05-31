<script setup lang="ts">
defineOptions({
  name: 'RegisterSuccessPage',
})

import { ref, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResendVerification } from '@/composables/useAuth'
import { NIcon } from 'naive-ui'
import { Mail, ArrowLeft, CircleCheck, CircleX } from '@vicons/tabler'
import AuthLayoutSide from '@/components/shared/AuthLayoutSide.vue'

const route = useRoute()
const router = useRouter()
const { mutate, isPending, isSuccess, isError, error } = useResendVerification()

// Retrieve email from query params
const email = computed(() => (route.query.email as string) || '')

// Cooldown state
const cooldown = ref(0)
let timerInterval: any = null

const startCooldown = (seconds: number) => {
  cooldown.value = seconds
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const handleResend = () => {
  if (cooldown.value > 0 || !email.value) return

  mutate(
    { email: email.value },
    {
      onSuccess: () => {
        // Start 60 seconds cooldown on success
        startCooldown(60)
      },
      onError: (err: any) => {
        // If backend returned cooldown remaining or too many requests error
        const msg = err?.message || ''
        const match = msg.match(/wait (\d+) seconds/i)
        if (match && match[1]) {
          startCooldown(parseInt(match[1], 10))
        } else {
          // Default cooldown to prevent spamming on error
          startCooldown(30)
        }
      }
    }
  )
}
</script>

<template>
  <div class="min-h-screen flex items-center h-screen justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center justify-center h-full w-full lg:w-1/2 mx-auto bg-background px-8">
      <div class="w-full max-w-md text-center">
        <!-- Logo -->
        <img src="../../assets/LogoGigSource.svg" alt="GigSource Logo" class="mx-auto mb-8" />

        <div class="bg-white p-8 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
          <!-- Icon -->
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <n-icon size="40" color="#0014B2">
              <Mail />
            </n-icon>
          </div>

          <h2 class="text-2xl font-bold text-gray-800 mb-2">Verifikasi Email Anda</h2>
          <p class="text-gray-500 text-sm mb-6 leading-relaxed">
            Pendaftaran berhasil! Kami telah mengirimkan link verifikasi akun ke email:
            <span class="font-semibold text-gray-800 block mt-1 break-all">{{ email || 'email Anda' }}</span>
          </p>

          <p class="text-xs text-gray-400 mb-6 italic">
            Silakan periksa kotak masuk (inbox) atau folder spam Anda, dan klik link di dalamnya untuk mengaktifkan akun Anda.
          </p>

          <!-- Feedback messages -->
          <div v-if="isSuccess" class="w-full mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded flex items-center gap-2">
            <n-icon size="18" color="#18a058">
              <CircleCheck />
            </n-icon>
            <span class="text-left">Link verifikasi baru telah dikirim!</span>
          </div>

          <div v-if="isError" class="w-full mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
            <n-icon size="18" color="#d03050">
              <CircleX />
            </n-icon>
            <span class="first-letter:uppercase text-left">{{ error?.message || 'Gagal mengirim ulang email verifikasi.' }}</span>
          </div>

          <!-- Buttons -->
          <button 
            type="button"
            :disabled="isPending || cooldown > 0 || !email"
            class="w-full flex justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mb-4 transition-colors duration-200"
            @click="handleResend"
          >
            <span v-if="isPending">Mengirim...</span>
            <span v-else-if="cooldown > 0">Kirim Ulang Email ({{ cooldown }}s)</span>
            <span v-else>Kirim Ulang Email</span>
          </button>

          <button 
            type="button" 
            class="w-full flex justify-center items-center gap-2 py-3 border border-gray-300 rounded-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer transition-colors duration-200"
            @click="router.push('/login')"
          >
            <n-icon size="16">
              <ArrowLeft />
            </n-icon>
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
    <AuthLayoutSide />
  </div>
</template>

<style scoped>
/* Extra styling matching the rest of the app */
.bg-primary {
  background-color: #0014B2;
}
.hover\:bg-blue-900:hover {
  background-color: #000f80;
}
</style>
