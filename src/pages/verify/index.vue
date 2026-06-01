<script setup lang="ts">
defineOptions({
  name: 'VerifyAccountPage',
})

import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVerifyAccount, useResendVerification } from '@/composables/useAuth'
import { NIcon, NSpin, NInput } from 'naive-ui'
import { CircleCheck, CircleX, Mail } from '@vicons/tabler'
import AuthLayoutSide from '@/components/shared/AuthLayoutSide.vue'

const route = useRoute()
const router = useRouter()
const { mutate, isPending, isSuccess, isError, error } = useVerifyAccount()
const { mutate: resendMutate, isPending: isResendPending, isSuccess: isResendSuccess, isError: isResendError, error: resendError } = useResendVerification()

const countdown = ref(5)
const resendEmail = ref('')
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

onMounted(() => {
  const token = route.query.token as string
  if (token) {
    mutate(token, {
      onSuccess: () => {
        // Start countdown for automatic redirection
        const timer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(timer)
            router.push('/login')
          }
        }, 1000)
      }
    })
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const handleResend = () => {
  if (cooldown.value > 0 || !resendEmail.value) return

  resendMutate(
    { email: resendEmail.value },
    {
      onSuccess: () => {
        startCooldown(60)
      },
      onError: (err: any) => {
        const msg = err?.message || ''
        const match = msg.match(/wait (\d+) seconds/i)
        if (match && match[1]) {
          startCooldown(parseInt(match[1], 10))
        } else {
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
        <img src="../../assets/LogoGigSource.svg" alt="GigSource Logo" class="mx-auto mb-8" />

        <div v-if="isPending" class="py-12">
          <n-spin size="large" stroke="#0014B2" />
          <h2 class="text-2xl font-bold text-gray-800 mt-6 text-center">Memverifikasi Akun...</h2>
          <p class="text-gray-500 mt-2 text-center">Mohon tunggu sebentar selagi kami memvalidasi email Anda.</p>
        </div>

        <div v-else-if="isSuccess" class="py-4 flex flex-col items-center">
          <n-icon size="80" color="#18a058">
            <CircleCheck />
          </n-icon>
          <h2 class="text-3xl font-bold text-green-600 mt-6">Email Terverifikasi!</h2>
          <p class="text-gray-500 my-4 text-center leading-relaxed">
            Terima kasih! Akun Anda telah berhasil diverifikasi. Anda sekarang dapat menggunakan Akun Anda di GigSource Hub.
          </p>
          <button 
            class="w-full flex justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            @click="router.push('/login')"
          >
            Lanjut ke Login
          </button>
          <p class="text-gray-400 mt-2 text-sm">
            Mengarahkan ke halaman login dalam {{ countdown }} detik...
          </p>
        </div>

        <div v-else-if="isError || !route.query.token" class="py-4 flex flex-col items-center w-full">
          <n-icon size="80" color="#d03050">
            <CircleX />
          </n-icon>
          <h2 class="text-3xl font-bold text-red-600 mt-6">Verifikasi Gagal</h2>
          <p class="w-full my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-left">
            {{ (error as any)?.message || 'Link verifikasi tidak valid atau telah kadaluwarsa.' }}
          </p>

          <!-- Resend Section -->
          <div class="w-full bg-gray-50 border border-gray-100 p-6 rounded-md mb-6 text-left">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Kirim Ulang Link Verifikasi</h3>
            <p class="text-xs text-gray-500 mb-4">
              Masukkan email Anda di bawah ini untuk menerima link verifikasi baru.
            </p>

            <div class="mb-4">
              <n-input
                v-model:value="resendEmail"
                type="text"
                placeholder="Masukkan Email Anda"
                size="large"
                :input-props="{ autocomplete: 'email' }"
              >
                <template #prefix>
                  <n-icon :component="Mail" />
                </template>
              </n-input>
            </div>

            <!-- Feedback message for resend -->
            <div v-if="isResendSuccess" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded flex items-center gap-2">
              <n-icon size="18" color="#18a058">
                <CircleCheck />
              </n-icon>
              <span>Link verifikasi baru telah dikirim!</span>
            </div>

            <div v-if="isResendError" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
              <n-icon size="18" color="#d03050">
                <CircleX />
              </n-icon>
              <span class="first-letter:uppercase">{{ resendError?.message || 'Gagal mengirim ulang email.' }}</span>
            </div>

            <button 
              type="button" 
              :disabled="isResendPending || cooldown > 0 || !resendEmail"
              class="w-full flex justify-center py-3 border border-transparent rounded-sm shadow-sm text-base font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors duration-200"
              @click="handleResend"
            >
              <span v-if="isResendPending">Mengirim...</span>
              <span v-else-if="cooldown > 0">Kirim Ulang ({{ cooldown }}s)</span>
              <span v-else>Kirim Link Verifikasi</span>
            </button>
          </div>

          <button 
            type="button" 
            class="w-full flex justify-center py-4 border border-gray-300 rounded-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer transition-colors duration-200"
            @click="router.push('/login')"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
    <AuthLayoutSide />
  </div>
</template>