<script setup lang="ts">
defineOptions({
  name: 'LandingLayout',
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="grow">
      <slot />
    </main>
  </div>
</template>
