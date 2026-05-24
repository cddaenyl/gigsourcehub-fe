<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ArrowRight, Bolt, Clock, MapPin } from '@vicons/tabler'
import { NButton, NIcon } from 'naive-ui'
import { useRouter } from 'vue-router'
import { getPublicJobVacanciesApi } from '@/services/job-vacancy.service'

const router = useRouter()

const goToOpportunities = () => {
  router.push('/opportunities/OpportunitiesList')
}

type OpportunityCard = {
  label: string
  category: string
  postedAt: string
  location: string
  duration: string
  description: string
  tags: string[]
}

const vacancies = ref<any[]>([])

const staticOpportunities: OpportunityCard[] = [
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

const formatPostedAt = (dateStr: string) => {
  const date = new Date(dateStr)
  const diffTime = Math.abs(new Date().getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const parseTags = (techStack: string | null | undefined): string[] => {
  if (!techStack) return []
  let cleaned = techStack.trim()
  
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean)
      }
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  cleaned = cleaned.replace(/[\[\]"']/g, '')

  if (cleaned.includes(',')) {
    return cleaned.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return cleaned.split(' ').map((s) => s.trim()).filter(Boolean)
}

onMounted(async () => {
  try {
    const res = await getPublicJobVacanciesApi({ limit: 3 })
    vacancies.value = res.data.list
  } catch (error) {
    // Fallback to static
  }
})

const opportunityCards = computed<OpportunityCard[]>(() => {
  if (vacancies.value.length === 0) {
    return staticOpportunities
  }
  return vacancies.value.map((v) => {
    const category = v.subrequest?.job_role || 'Technology Information'
    const location = v.schema ? v.schema.charAt(0) + v.schema.slice(1).toLowerCase() : 'Remote'
    const postedAt = formatPostedAt(v.created_at)
    const tags = parseTags(v.subrequest?.tech_stack)
    return {
      label: v.name,
      category,
      postedAt,
      location,
      duration: 'Project-based',
      description: v.overview || v.description || '',
      tags,
    }
  })
})

defineOptions({
  name: 'OpportunitiesSection',
})
</script>

<template>
  <section id="opportunities" class="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col items-start justify-start gap-5">
        <div
          class="inline-flex items-center justify-start gap-1.5 rounded-full border border-blue-900 px-4 py-2 shadow-md">
          <div class="flex justify-center text-yellow-400 font-normal">
            <n-icon :size="16">
              <Bolt />
            </n-icon>
          </div>
          <div class="text-xs leading-5 font-semibold text-slate-700">Featured Opportunities</div>
        </div>

        <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
          Opportunities for You
        </h2>

        <div
          class="flex flex-col xl:flex-row justify-between w-full text-base leading-7 font-medium text-slate-600 sm:text-xl">
          <p class="flex">
            Browse open roles we’re currently hiring for across various projects and teams.
          </p>
          <div class="flex my-4 justify-end xl:my-0">
            <n-button tertiary round @click="goToOpportunities">
              View All Opportunities <n-icon class="ml-1">
                <ArrowRight />
              </n-icon>
            </n-button>
          </div>
        </div>
      </div>

      <div class="py-2 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 lg:mt-8 overflow-x-auto">
        <article v-for="card in opportunityCards" :key="card.label"
          class="group relative overflow-hidden rounded-3xl bg-white px-6 pt-6 pb-8 shadow-[0px_4px_4px_0px_rgba(7,34,158,0.18)] outline -outline-offset-1 outline-slate-300 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_32px_-18px_rgba(7,34,158,0.35)] sm:px-8 sm:pt-8 sm:pb-10">
          <div
            class="absolute right-0 top-0 h-40 w-40 rounded-bl-[100px] bg-linear-to-br from-blue-500 to-cyan-500 opacity-10 blur-[19.95px]">
          </div>

          <div class="relative flex items-center justify-between gap-4">
            <div v-if="card.category === 'Technology Information'" class="bg-[#e2e8f0] flex gap-1 items-center justify-center px-2 py-0.5 rounded-[22px]">
              <span class="text-[#1e293b] text-sm font-medium leading-5">
                {{ card.category }}
              </span>
            </div>
            <div v-else class="inline-flex items-center rounded-3xl px-2 py-0.5">
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

            <p class="text-base font-normal leading-5 text-slate-600 line-clamp-3 h-20">
              {{ card.description }}
            </p>
          </div>

          <div class="relative mt-5 flex flex-wrap items-start gap-2">
            <span v-for="tag in card.tags" :key="tag"
              class="inline-flex items-center rounded-3xl bg-[#c7d0f3] px-2 py-0.5 text-sm font-medium leading-5 text-[#07229e]">
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
