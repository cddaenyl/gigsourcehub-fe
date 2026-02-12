<script setup lang="ts">
defineOptions({
  name: 'LoginPage',
})
</script>

<template>
  <div
    class="min-h-screen flex items-center h-screen justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="flex flex-col items-center justify-center h-full w-1/2 mx-auto bg-background">
      <img src="../../assets/LogoGigSource.png" alt="GigSource Logo" />
      <div class="w-2/3">
        <div class="py-2 mt-6">
          <p class="mt-2 text-sm font-semibold text-gray-700">Email</p>
          <input
            type="email"
            placeholder="user@gmail.com"
            class="mt-1 w-full px-3 py-2 border bg-white border-gray-300 rounded-sm shadow-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="py-2">
          <p class="mt-4 text-sm font-semibold text-gray-700">Password</p>
          <input
            type="password"
            class="mt-1 w-full px-3 py-2 border bg-white border-gray-300 rounded-sm shadow-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="mt-3 flex justify-end">
          <a href="#" class="text-sm text-blue-600 hover:text-blue-800">Forgot Password?</a>
        </div>
        <div class="my-4">
          <button
            class="w-full flex justify-center py-4 border border-transparent rounded-sm shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Login
          </button>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center h-full w-1/2 mx-auto rounded-md bg-blue-800"></div>
  </div>
</template>
