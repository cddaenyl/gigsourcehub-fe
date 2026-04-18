<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, ArrowsJoin, Menu2, X } from '@vicons/tabler'
import { NIcon } from 'naive-ui'
import logoSrc from '@/assets/LogoGigSource.svg'

defineOptions({
  name: 'LandingNavbar',
})

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Opportunities', href: '#opportunities' },
  { label: 'FAQ', href: '#faq' },
]

const isMenuOpen = ref(false)

const mobileMenuIcon = computed(() => (isMenuOpen.value ? X : Menu2))

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 border-white/10 backdrop-blur-xl">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink to="/" class="flex items-center gap-3 text-white">
        <img :src="logoSrc" alt="GigSourceHub" class="h-10 w-auto shrink-0" />
      </RouterLink>

      <div class="hidden md:flex md:space-x-2">
        <nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <a
            v-for="item in navItems"
            :key="item.label"
            :href="item.href"
            class="rounded-full px-4 py-2 text-md text-white transition-colors hover:bg-white/10 hover:text-white"
          >
            {{ item.label }}
          </a>
        </nav>
        <RouterLink
          to="/register"
          class="inline-flex items-center gap-2 rounded-full backdrop-blur-sm bg-blue-500/20 px-4 py-2.5 text-sm text-white outline -outline-offset-1 outline-white/10 transition-colors hover:bg-blue-500/30"
        >
          Join Talent Pool
          <NIcon :size="18" :component="ArrowsJoin" />
        </RouterLink>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation"
        aria-label="Toggle navigation menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        <NIcon :size="22" :component="mobileMenuIcon" />
      </button>
    </div>

    <div v-if="isMenuOpen" id="mobile-navigation" class="border-t border-white/10 md:hidden">
      <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="rounded-2xl px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>

        <RouterLink
          to="/register"
          class="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-blue-500/20 px-4 py-3 text-sm font-medium text-white ring-1 ring-inset ring-blue-400/25 transition-colors hover:bg-blue-500/30"
          @click="closeMenu"
        >
          Join Talent Pool
          <NIcon :size="18" :component="ArrowRight" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
