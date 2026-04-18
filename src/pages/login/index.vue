<script setup lang="ts">
defineOptions({
  name: 'LoginPage',
})

import { useLogin } from '@/composables/useAuth'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ref } from 'vue'
import { NInput, NIcon } from 'naive-ui'
import { Mail, Lock, Eye, EyeOff } from '@vicons/tabler'

const loginPayloadSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export type LoginPayload = z.infer<typeof loginPayloadSchema>
const { mutate, isPending, error } = useLogin()

// Setup form with vee-validate + zod
const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(loginPayloadSchema),
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
    <div
      class="hidden flex-col gap-16 items-center justify-center h-full w-1/2 mx-auto rounded-md bg-linear-to-b from-[#0823A0] to-[#081863] xl:flex"
    >
      <div
        class="float-card-1 w-92 h-56 relative origin-top-left left-24 rotate-[-9.61deg] bg-white/10 rounded-[20px] outline-2 outline-white/20 overflow-x-clip"
      >
        <div class="w-60 h-36 left-[33.52px] top-[28.82px] absolute">
          <div
            class="w-14 h-14 top-0 absolute bg-linear-to-br from-[#C27AFF] to-[#8B5CF6] rounded-[10px]"
          ></div>
          <div class="w-32 h-20 left-13 absolute">
            <div class="w-38 h-9 left-3 absolute bg-white/30 rounded"></div>
            <div class="w-24 h-4 left-3 top-11 absolute bg-white/20 rounded"></div>
          </div>
        </div>
        <div class="w-64 h-10 left-8 top-26 absolute bg-white/20 rounded-[3px]"></div>
        <div class="w-44 h-8 left-8 top-38 absolute bg-white/20 rounded-[3px]"></div>
      </div>
      <div
        class="float-card-2 w-92 h-56 relative origin-top-left right-24 rotate-[9.61deg] bg-white/10 rounded-[20px] outline-2 outline-white/20 overflow-x-clip"
      >
        <div class="w-60 h-36 left-[33.52px] top-[28.82px] absolute">
          <div
            class="w-14 h-14 top-0 absolute bg-linear-to-br from-emerald-500 to-green-600 rounded-[10px]"
          ></div>
          <div class="w-32 h-20 left-13 absolute">
            <div class="w-38 h-9 left-3 absolute bg-white/30 rounded"></div>
            <div class="w-24 h-4 left-3 top-11 absolute bg-white/20 rounded"></div>
          </div>
        </div>
        <div class="w-64 h-8 left-8 top-26 absolute bg-white/20 rounded-[3px]"></div>
        <div class="w-52 h-4 left-8 top-36 absolute bg-white/20 rounded-[3px]"></div>
        <div class="w-44 h-4 left-8 top-42 absolute bg-white/20 rounded-[3px]"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.float-card-1 {
  animation: card-float 3.8s ease-in-out infinite;
  will-change: translate;
}

.float-card-2 {
  animation: card-float 4.2s ease-in-out infinite;
  will-change: translate;
}

@keyframes card-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -10px;
  }
}

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
