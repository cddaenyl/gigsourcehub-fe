<script setup lang="ts">
defineOptions({
  name: 'ResetPasswordPage',
})

import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { NInput, NIcon } from 'naive-ui'
import { Lock, Eye, EyeOff } from '@vicons/tabler'
import AuthLayoutSide from '@/components/shared/AuthLayoutSide.vue'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})

const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const onSubmit = handleSubmit((values) => {
  // Logic will be implemented when API is available
  console.log('Resetting password:', values.password)
  alert('Your password has been reset successfully (Demo)')
})
</script>

<template>
  <div class="min-h-screen flex items-center h-screen justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center justify-center h-full w-1/2 mx-auto bg-background px-8">
      <div class="w-full max-w-md text-center">
        <img src="../../assets/LogoGigSource.svg" alt="GigSource Logo" class="mx-auto mb-8" />

        <form @submit.prevent="onSubmit" class="text-left" autocomplete="off">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
          <p class="text-gray-500 text-sm mb-8 leading-relaxed">
            Enter a new password for your account. Make sure it is strong and secure.
          </p>

          <div class="mb-6">
            <p class="text-sm font-semibold text-gray-700 mb-2">New Password</p>
            <n-input
              v-model:value="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter New Password"
              size="large"
              :status="passwordError ? 'error' : undefined"
              :input-props="{ class: 'px-3 py-2', autocomplete: 'new-password' }"
            >
              <template #prefix>
                <n-icon :component="Lock" />
              </template>
              <template #suffix>
                <n-icon
                  :component="showPassword ? EyeOff : Eye"
                  @click="showPassword = !showPassword"
                  class="cursor-pointer"
                />
              </template>
            </n-input>
            <p v-if="passwordError" class="mt-1 text-xs text-red-600">
              {{ passwordError }}
            </p>
          </div>

          <div class="mb-8">
            <p class="text-sm font-semibold text-gray-700 mb-2">Confirm New Password</p>
            <n-input
              v-model:value="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm New Password"
              size="large"
              :status="confirmPasswordError ? 'error' : undefined"
              :input-props="{ class: 'px-3 py-2', autocomplete: 'new-password' }"
            >
              <template #prefix>
                <n-icon :component="Lock" />
              </template>
              <template #suffix>
                <n-icon
                  :component="showConfirmPassword ? EyeOff : Eye"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="cursor-pointer"
                />
              </template>
            </n-input>
            <p v-if="confirmPasswordError" class="mt-1 text-xs text-red-600">
              {{ confirmPasswordError }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="!meta.valid"
            class="w-full flex items-center justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-bold text-white bg-[#0014B2] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0014B2] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all mb-6"
          >
            Reset Password
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
