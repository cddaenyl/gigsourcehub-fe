<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

defineOptions({
  name: 'LandingLayout',
})
</script>

<template>
  <div class="min-h-screen flex flex-col overflow-x-clip bg-slate-950">
    <Navbar />
    <main class="grow -mt-18">
      <slot />
    </main>
    <Footer />
  </div>
</template>
