<script setup lang="ts">
defineOptions({
  name: 'LoginPage',
})

import { useLogin } from "@/composables/useLogin"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"

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
            <input
              v-model="email"
              type="email"
              placeholder="user@gmail.com"
              :class="[
                'mt-1 w-full px-3 py-2 border bg-white rounded-sm shadow-xs focus:outline-none',
                emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              ]"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-600">
              {{ emailError }}
            </p>
          </div>
          <div class="py-2">
            <p class="mt-4 text-sm font-semibold text-gray-700">Password</p>
            <input
              v-model="password"
              type="password"
              :class="[
                'mt-1 w-full px-3 py-2 border bg-white rounded-sm shadow-xs focus:outline-none',
                passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              ]"
            />
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
              class="w-full flex justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {{ isPending ? 'Loading...' : 'Login' }}
            </button>
          </div>

        </form>
    </div>
    <div class="flex items-center justify-center h-full w-1/2 mx-auto rounded-md bg-blue-800"></div>
  </div>
</template>
