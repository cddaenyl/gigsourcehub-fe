<script setup lang="ts">
import LandingLayout from '@/layouts/UserLayout.vue'
import Hero from '@/components/Hero.vue'

defineOptions({
  name: 'HomePage',
})
</script>

<template>
  <LandingLayout>
    <Hero />
  </LandingLayout>
</template>
