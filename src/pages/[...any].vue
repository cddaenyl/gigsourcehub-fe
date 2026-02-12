<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const randomPath = () => {
  return `/${Math.random().toString(36).substring(2, 15)}`
}
</script>

<template>
  <section class="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
    <h1>404: The page "{{ route.path }}" does not exist.</h1>
    <div class="flex gap-2 p-10">
      <router-link to="/">Go Home</router-link>
      <router-link :to="randomPath()">Go Random</router-link>
    </div>
  </section>
</template>
