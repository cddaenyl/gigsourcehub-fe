<script setup lang="ts">
import { Clock, MapPin, Bolt, ArrowRight } from '@vicons/tabler'
import { NIcon, NButton } from 'naive-ui'

type OpportunityCard = {
  label: string
  category: string
  postedAt: string
  location: string
  duration: string
  description: string
  tags: string[]
}

const opportunityCards: OpportunityCard[] = [
  {
    label: 'Senior Front Developer',
    category: 'Technology Information',
    postedAt: '2 days ago',
    location: 'Remote',
    duration: '3-6 month',
    description:
      'Mengembangkan dan mengoptimalkan antarmuka aplikasi web modern dengan fokus pada performa, scalability, dan user experience yang seamless.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'React.js', 'Tailwind CSS', 'Git', '3+'],
  },
  {
    label: 'Product Designer',
    category: 'Design Systems',
    postedAt: '4 days ago',
    location: 'Hybrid',
    duration: '2-4 month',
    description:
      'Membangun alur desain yang konsisten, berorientasi pengguna, dan mudah diterapkan oleh tim produk lintas fungsi.',
    tags: ['Figma', 'UX', 'UI', 'Research', 'Prototyping', 'Design System'],
  },
  {
    label: 'Product Strategist',
    category: 'Product',
    postedAt: '1 day ago',
    location: 'Remote',
    duration: '3 month',
    description:
      'Menyelaraskan kebutuhan bisnis dan pengguna untuk merancang prioritas produk yang berdampak dan terukur.',
    tags: ['Roadmap', 'Analysis', 'Discovery', 'Stakeholders', 'Metrics'],
  },
]

defineOptions({
  name: 'OpportunitiesSection',
})
</script>

<template>
  <section id="opportunities" class="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col items-start justify-start gap-5">
        <div
          class="inline-flex items-center justify-start gap-1.5 rounded-full border border-blue-900 px-4 py-2 shadow-md"
        >
          <div class="flex justify-center text-yellow-400 font-normal">
            <n-icon :size="16"><Bolt /></n-icon>
          </div>
          <div class="text-xs leading-5 font-semibold text-slate-700">Featured Opportunities</div>
        </div>

        <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
          Opportunities for You
        </h2>

        <div
          class="flex flex-col xl:flex-row justify-between w-full text-base leading-7 font-medium text-slate-600 sm:text-xl"
        >
          <p class="flex">
            Browse open roles we’re currently hiring for across various projects and teams.
          </p>
          <n-button tertiary round class="flex w-1/2">
            View All Opportunities <n-icon class="ml-1"><ArrowRight /></n-icon>
          </n-button>
        </div>
      </div>

      <div class="py-2 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 lg:mt-8 overflow-x-auto">
        <article
          v-for="card in opportunityCards"
          :key="card.label"
          class="group relative overflow-hidden rounded-3xl bg-white px-6 pt-6 pb-8 shadow-[0px_4px_4px_0px_rgba(7,34,158,0.18)] outline -outline-offset-1 outline-slate-300 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_32px_-18px_rgba(7,34,158,0.35)] sm:px-8 sm:pt-8 sm:pb-10"
        >
          <div
            class="absolute right-0 top-0 h-40 w-40 rounded-bl-[100px] bg-linear-to-br from-blue-500 to-cyan-500 opacity-10 blur-[19.95px]"
          ></div>

          <div class="relative flex items-center justify-between gap-4">
            <div class="inline-flex items-center rounded-3xl px-2 py-0.5">
              <span class="text-sm font-normal leading-5 text-slate-800">
                {{ card.category }}
              </span>
            </div>

            <div class="flex items-center gap-1.5 text-base font-normal leading-6 text-slate-600">
              <span>{{ card.postedAt }}</span>
            </div>
          </div>

          <div class="relative mt-4 flex flex-col gap-2">
            <h3 class="text-2xl font-bold leading-6 text-slate-800">
              {{ card.label }}
            </h3>

            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-1.5 text-base font-normal leading-5 text-slate-600">
                <NIcon :size="20" :component="MapPin" />
                <span>{{ card.location }}</span>
              </div>

              <div class="flex items-center gap-1.5 text-base font-normal leading-5 text-slate-600">
                <NIcon :size="20" :component="Clock" />
                <span>{{ card.duration }}</span>
              </div>
            </div>

            <p class="text-base font-normal leading-5 text-slate-600">
              {{ card.description }}
            </p>
          </div>

          <div class="relative mt-5 flex flex-wrap items-start gap-2">
            <span
              v-for="tag in card.tags"
              :key="tag"
              class="inline-flex items-center rounded-3xl bg-indigo-200 px-2 py-0.5 text-sm font-normal leading-5 text-blue-900"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
