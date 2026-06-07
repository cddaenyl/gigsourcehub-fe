<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, ArrowsJoin, Menu2, X } from '@vicons/tabler'
import { NIcon } from 'naive-ui'
import logoSrc from '@/assets/LogoGigSource.svg'
import { useAuthStore } from '@/stores/auth.store'
import { getDefaultRouteForUser } from '@/utils/auth'

defineOptions({
  name: 'LandingNavbar',
})

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Career', href: '#career' },
  { label: 'Opportunities', href: '#opportunities' },
  { label: 'FAQ', href: '#faq' },
]

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const targetRoute = computed(() => {
  if (authStore.isAuthenticated) {
    return getDefaultRouteForUser(authStore.user)
  }
  return '/register'
})

const buttonText = computed(() => {
  if (authStore.isAuthenticated) {
    return 'Dashboard'
  }
  return 'Join Talent Pool'
})

const handleQuickLinkClick = (event: MouseEvent, href: string) => {
  if (!href.startsWith('#')) return

  if (route.path !== '/') {
    event.preventDefault()
    closeMenu()
    router.push('/' + href)
  } else {
    const target = document.querySelector(href)
    if (!target) return
    closeMenu()
    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', href)
  }
}

// Watch route hash to handle scroll when routing from other pages
watch(
  () => route.hash,
  (newHash) => {
    if (newHash && route.path === '/') {
      nextTick(() => {
        setTimeout(() => {
          const target = document.querySelector(newHash)
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      })
    }
  },
  { immediate: true },
)

const isMenuOpen = ref(false)
const isScrolled = ref(false)

const mobileMenuIcon = computed(() => (isMenuOpen.value ? X : Menu2))
const navTextClass = computed(() => (isScrolled.value ? 'text-slate-900' : 'text-white'))
const navLinkClass = computed(() =>
  isScrolled.value
    ? 'rounded-full px-4 py-2 text-md text-slate-900 transition-colors hover:bg-slate-900/10 hover:text-slate-900'
    : 'rounded-full px-4 py-2 text-md text-white transition-colors hover:bg-white/10 hover:text-white',
)

function handleScroll() {
  isScrolled.value = window.scrollY > 100
}

function closeMenu() {
  isMenuOpen.value = false
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-xl transition-colors"
    :class="isScrolled ? 'border-slate-200/80 bg-white/65' : ' '"
  >
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink to="/" class="flex items-center gap-3" :class="navTextClass">
        <img :src="logoSrc" alt="GigSourceHub" class="h-12 w-auto shrink-0" />
      </RouterLink>

      <div class="hidden md:flex md:space-x-2">
        <nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <a
            v-for="item in navItems"
            :key="item.label"
            :href="item.href"
            :class="navLinkClass"
            @click="handleQuickLinkClick($event, item.href)"
          >
            {{ item.label }}
          </a>
        </nav>
        <RouterLink
          :to="targetRoute"
          class="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm outline -outline-offset-1 transition-colors"
          :class="
            isScrolled
              ? 'bg-blue-500/15 text-blue-900 outline-blue-900/20 hover:bg-blue-500/25'
              : 'bg-blue-500/20 text-white outline-white/10 hover:bg-blue-500/30'
          "
        >
          {{ buttonText }}
          <NIcon :size="18" :component="ArrowsJoin" />
        </RouterLink>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full border p-2 transition-colors md:hidden"
        :class="
          isScrolled
            ? 'border-slate-300 text-slate-900 hover:bg-slate-900/10'
            : 'border-white/10 text-white hover:bg-white/10'
        "
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-navigation"
        aria-label="Toggle navigation menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        <NIcon :size="22" :component="mobileMenuIcon" />
      </button>
    </div>

    <div
      v-if="isMenuOpen"
      id="mobile-navigation"
      class="border-t md:hidden"
      :class="isScrolled ? 'border-slate-200/80 bg-white/90' : 'border-white/10 bg-slate-950/35'"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="rounded-2xl px-4 py-3 text-sm font-medium transition-colors"
          :class="
            isScrolled
              ? 'text-slate-700 hover:bg-slate-900/10 hover:text-slate-900'
              : 'text-white/85 hover:bg-white/10 hover:text-white'
          "
          @click="handleQuickLinkClick($event, item.href)"
        >
          {{ item.label }}
        </a>

        <RouterLink
          :to="targetRoute"
          class="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium ring-1 ring-inset transition-colors"
          :class="
            isScrolled
              ? 'bg-blue-500/15 text-blue-900 ring-blue-900/25 hover:bg-blue-500/25'
              : 'bg-blue-500/20 text-white ring-blue-400/25 hover:bg-blue-500/30'
          "
          @click="closeMenu"
        >
          {{ buttonText }}
          <NIcon :size="18" :component="ArrowRight" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
