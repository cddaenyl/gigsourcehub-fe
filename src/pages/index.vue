<script setup lang="ts">
import LandingLayout from '@/layouts/UserLayout.vue'
import Hero from '@/components/landing-page/HeroSection.vue'
import CTASection from '@/components/landing-page/CTASection.vue'
import CareerPathSection from '@/components/landing-page/CareerPathSection.vue'
import OpportunitiesSection from '@/components/landing-page/OpportunitiesSection.vue'
import ApplicationSection from '@/components/landing-page/ApplicationSection.vue'

defineOptions({
  name: 'HomePage',
})
</script>

<template>
  <LandingLayout>
    <Hero />
    <CTASection />
    <CareerPathSection />
    <OpportunitiesSection />
    <ApplicationSection />
  </LandingLayout>
</template>
