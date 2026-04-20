<script setup lang="ts">
defineOptions({
  name: 'ForgotPasswordPage',
})

import { useForgotPassword } from '@/composables/useAuth'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { NInput, NIcon, useMessage } from 'naive-ui'
import { Mail } from '@vicons/tabler'
import AuthLayoutSide from '@/components/shared/AuthLayoutSide.vue'

const message = useMessage()
const { mutate, isPending } = useForgotPassword()

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
})

const { value: email, errorMessage: emailError } = useField<string>('email')

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: (response: any) => {
      message.success(response.message || 'Password reset link has been sent to your email')
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to send reset link')
    }
  })
})
</script>

<template>
  <div class="min-h-screen flex items-center h-screen justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center justify-center h-full w-1/2 mx-auto bg-background px-8">
      <div class="w-full max-w-md text-center">
        <img src="../../assets/LogoGigSource.svg" alt="GigSource Logo" class="mx-auto mb-8" />

        <form @submit.prevent="onSubmit" class="text-left" autocomplete="off">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Forgot Your Password?</h2>
          <p class="text-gray-500 text-sm mb-8 leading-relaxed">
            Please enter your email address. You will receive a link to create a new password via email
          </p>
          <div class="mb-6">
            <p class="text-sm font-semibold text-gray-700 mb-2">Email</p>
            <n-input v-model:value="email" type="text" placeholder="Masukkan Email" size="large"
              :status="emailError ? 'error' : undefined" :input-props="{ class: 'px-3 py-2', autocomplete: 'off' }">
              <template #prefix>
                <n-icon :component="Mail" />
              </template>
            </n-input>
            <p v-if="emailError" class="mt-1 text-xs text-red-600">
              {{ emailError }}
            </p>
          </div>

          <button type="submit" :disabled="isPending || !meta.valid"
            class="w-full flex items-center justify-center gap-2 py-4 border border-transparent rounded-sm shadow-sm text-lg font-bold text-white bg-[#0014B2] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0014B2] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all mb-6">
            {{ isPending ? 'Sending...' : 'Send' }}
            <n-icon :component="Mail" />
          </button>

          <div class="text-center">
            <p class="text-sm text-gray-600 font-medium">
              Go back to the
              <router-link to="/login" class="text-blue-600 font-bold hover:text-blue-800">Login</router-link>
              page
            </p>
          </div>
        </form>
      </div>
    </div>
    <AuthLayoutSide />
  </div>
</template>

<style scoped>
/* Change input hover and focus colors to blue */
:deep(.n-input:hover .n-input__border),
:deep(.n-input:hover .n-input__state-border) {
  border-color: #3b82f6 !important;
}

:deep(.n-input.n-input--focus .n-input__border),
:deep(.n-input.n-input--focus .n-input__state-border) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

/* Apply autofill background to entire input wrapper */
:deep(.n-input:has(input:-webkit-autofill)) {
  background-color: #e8f0fe !important;
}

:deep(.n-input:has(input:-webkit-autofill) .n-input-wrapper) {
  background-color: #e8f0fe !important;
}

/* Style the autofilled input itself */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 30px #e8f0fe inset !important;
  box-shadow: 0 0 0 30px #e8f0fe inset !important;
  -webkit-text-fill-color: inherit !important;
}
</style>
