<script setup lang="ts">
defineOptions({
  name: 'VerifyAccountPage',
})

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVerifyAccount } from '@/composables/useAuth'
import { NIcon, NSpin, NResult, NButton } from 'naive-ui'
import { CircleCheck, CircleX } from '@vicons/tabler'
import AuthLayoutSide from '@/components/shared/AuthLayoutSide.vue'

const route = useRoute()
const router = useRouter()
const { mutate, isPending, isSuccess, isError, error } = useVerifyAccount()

const countdown = ref(5)

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

        <div v-else-if="isError || !route.query.token" class="py-4 flex flex-col items-center">
          <n-icon size="80" color="#d03050">
            <CircleX />
          </n-icon>
          <h2 class="text-3xl font-bold text-red-600 mt-6">Verifikasi Gagal</h2>
          <p class="w-full my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ (error as any)?.message || 'Link verifikasi tidak valid atau telah kadaluwarsa.' }}
          </p>
          <button 
            type="submit" 
            class="w-full flex justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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