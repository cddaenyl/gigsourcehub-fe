<script setup lang="ts">
import LandingLayout from '@/layouts/UserLayout.vue'
import Hero from '@/components/landing-page/HeroSection.vue'
import AboutSection from '@/components/landing-page/AboutSection.vue'
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
    <AboutSection />
    <CareerPathSection />
    <OpportunitiesSection />
    <ApplicationSection />
  </LandingLayout>
</template>
