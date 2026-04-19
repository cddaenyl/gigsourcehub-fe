<script setup lang="ts">
import LandingLayout from '@/layouts/UserLayout.vue'
import Hero from '@/components/Hero.vue'
import CTASection from '@/components/CTASection.vue'

defineOptions({
  name: 'HomePage',
})
</script>

<template>
  <LandingLayout>
    <Hero />
    <CTASection />
  </LandingLayout>
</template>
