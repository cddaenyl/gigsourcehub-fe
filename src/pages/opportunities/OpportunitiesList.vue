<script setup lang="ts">
import LandingLayout from '@/layouts/UserLayout.vue'
import OpportunitiesHero from '@/components/landing-page/OpportunitiesHero.vue'
import CTASection from '@/components/landing-page/CTASection.vue'

defineOptions({
  name: 'OpportunitiesList',
})
</script>

<template>
  <LandingLayout>
    <OpportunitiesHero />
    <CTASection />
  </LandingLayout>
</template>
