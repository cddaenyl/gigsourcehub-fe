<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'

const router = useRouter()

onMounted(() => {
  router.push('/candidate/profile')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <n-spin size="large" />
  </div>
</template>
