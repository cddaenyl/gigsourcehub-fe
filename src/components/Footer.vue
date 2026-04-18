<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  BrandFacebook,
  BrandInstagram,
  BrandLinkedin,
  BrandTwitter,
  Mail,
  MapPin,
  Phone,
} from '@vicons/tabler'
import { NIcon } from 'naive-ui'
import logoSrc from '@/assets/LogoGigSource.svg'

defineOptions({
  name: 'LandingFooter',
})

type FooterLink = {
  label: string
  href: string
}

type ContactItem = {
  label: string
  value: string
  href: string
  icon: Component
}

type SocialItem = {
  label: string
  href: string
  icon: Component
}

const quickLinks: FooterLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Opportunities', href: '#opportunities' },
  { label: 'FAQ', href: '#faq' },
]

const contactItems: ContactItem[] = [
  {
    label: 'Location',
    value: '42 Hangang-daero, Yongsan-gu, Seoul, 04389, South Korea',
    href: 'https://www.google.com/maps',
    icon: MapPin,
  },
  {
    label: 'Email',
    value: 'careers@gigsourcehub.com',
    href: 'mailto:careers@gigsourcehub.com',
    icon: Mail,
  },
  {
    label: 'Phone',
    value: '+62 21 1234 5678',
    href: 'tel:+622112345678',
    icon: Phone,
  },
]

const socialItems: SocialItem[] = [
  { label: 'Facebook', href: 'https://facebook.com', icon: BrandFacebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: BrandInstagram },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: BrandLinkedin },
  { label: 'X', href: 'https://x.com', icon: BrandTwitter },
]

const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="bg-slate-950 text-white">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_0.9fr]">
        <section class="space-y-5">
          <RouterLink to="/" class="inline-flex items-center gap-3">
            <img :src="logoSrc" alt="GigSourceHub" class="h-10 w-auto" />
            <div>
              <div class="text-xl font-semibold leading-none text-blue-400">GIGSOURCE</div>
              <div class="text-xs font-medium uppercase tracking-[0.3em] text-white/70">
                Company
              </div>
            </div>
          </RouterLink>

          <p class="max-w-md text-sm leading-6 text-white/75 sm:text-base">
            Your technology partner for the digital era. Building future-proof solutions for secure
            digital societies.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-white">Explore</h2>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.label">
              <a :href="link.href" class="text-sm text-white/75 transition-colors hover:text-white">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-white">Contact</h2>
          <ul class="space-y-4">
            <li v-for="item in contactItems" :key="item.label" class="flex gap-3">
              <span
                class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-inset ring-white/10"
              >
                <NIcon :size="18" :component="item.icon" />
              </span>
              <div class="min-w-0">
                <p class="text-sm font-medium text-white">{{ item.label }}</p>
                <a :href="item.href" class="wrap-break-word text-sm text-white/75 hover:text-white">
                  {{ item.value }}
                </a>
              </div>
            </li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-white">Social Media</h2>
          <div class="flex flex-wrap gap-3">
            <a
              v-for="social in socialItems"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noreferrer"
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10"
              :aria-label="social.label"
            >
              <NIcon :size="20" :component="social.icon" />
            </a>
          </div>
        </section>
      </div>

      <div
        class="mt-10 border-t border-white/10 pt-6 text-sm text-white/65 sm:flex sm:items-center sm:justify-between"
      >
        <p>&copy; {{ currentYear }} GigSource Company. All rights reserved.</p>
        <p class="mt-2 sm:mt-0">Built for responsive hiring experiences.</p>
      </div>
    </div>
  </footer>
</template>
