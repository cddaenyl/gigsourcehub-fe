<script setup lang="ts">
defineOptions({
  name: 'RegisterPage',
})

import { useLogin } from "@/composables/useLogin"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"
import { ref } from "vue"
import { NInput, NIcon } from "naive-ui"
import { Mail, Lock, Eye, EyeOff } from "@vicons/tabler"

const loginPayloadSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
})

export type LoginPayload = z.infer<typeof loginPayloadSchema>
const { mutate, isPending, error } = useLogin()

// Setup form with vee-validate + zod
const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(loginPayloadSchema)
})

// Setup fields with vee-validate
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')

// Show/hide password state
const showPassword = ref(false)

// Submit handler with validation
const onSubmit = handleSubmit((values) => {
  mutate(values)
})
</script>

<template>
  <div
    class="min-h-screen flex items-center h-screen justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="flex flex-col items-center justify-center h-full w-1/2 mx-auto bg-background">
      <img src="../../assets/LogoGigSource.svg" alt="GigSource Logo" />
        <form @submit.prevent="onSubmit" class="w-2/3">
          <div class="py-2 mt-6">
            <p class="mt-2 text-sm font-semibold text-gray-700">Email</p>
            <n-input
              v-model:value="email"
              type="text"
              placeholder="user@gmail.com"
              size="large"
              :status="emailError ? 'error' : undefined"
              class="mt-1"
              :input-props="{ class: 'px-3 py-2' }"
            >
              <template #prefix>
                <n-icon :component="Mail" />
              </template>
            </n-input>
            <p v-if="emailError" class="mt-1 text-sm text-red-600">
              {{ emailError }}
            </p>
          </div>
          <div class="py-2">
            <p class="mt-4 text-sm font-semibold text-gray-700">Password</p>
            <n-input
              v-model:value="password"
              :type="showPassword ? 'text' : 'password'"
              size="large"
              :status="passwordError ? 'error' : undefined"
              class="mt-1"
              :input-props="{ class: 'px-3 py-2' }"
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
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">
              {{ passwordError }}
            </p>
          </div>
          <!-- Show API error message -->
          <div v-if="error" class="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error.message }}
          </div>
          <div class="mt-3 flex justify-end">
            <a href="#" class="text-sm text-blue-600 hover:text-blue-800">Forgot Password?</a>
          </div>
          <div class="my-4">
            <button
              type="submit"
              :disabled="isPending || !meta.valid"
              class="w-full flex justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {{ isPending ? 'Loading...' : 'Login' }}
            </button>
          </div>

        </form>
    </div>
    <div class="flex items-center justify-center h-full w-1/2 mx-auto rounded-md bg-blue-800"></div>
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
