<script setup lang="ts">
import { useRoute } from 'vue-router'
import { NResult, NButton } from 'naive-ui'
const route = useRoute()
</script>

<template>
  <section class="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
    <n-result
      status="404"
      title="404 Not Found"
    >
      <template #footer>
        <h1 class=" text-lg mb-5">The page "{{ route.path }}" does not exist.</h1>
        <n-button>
          <router-link to="/">Go Home</router-link>
        </n-button>
      </template>
    </n-result>
  </section>
</template>
