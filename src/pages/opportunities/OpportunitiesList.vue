<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useMessage, NSelect, NIcon, NSpin } from 'naive-ui'
import { SmartHome, Briefcase, MapPin, Clock, Calendar, Checkbox, Checks } from '@vicons/tabler'
import LandingLayout from '@/layouts/UserLayout.vue'
import OpportunitiesHero from '@/components/landing-page/OpportunitiesHero.vue'
import CTASection from '@/components/landing-page/CTASection.vue'
import { getPublicJobVacanciesApi } from '@/services/job-vacancy.service'

defineOptions({
  name: 'OpportunitiesList',
})

const message = useMessage()

type OpportunityCard = {
  id: string
  label: string
  category: string
  postedAt: string
  location: string
  duration: string
  description: string
  tags: string[]
}

const vacancies = ref<any[]>([])
const isLoading = ref(true)
const selectedDepartment = ref<string | null>(null)
const selectedVacancy = ref<OpportunityCard | null>(null)

const staticOpportunities: OpportunityCard[] = [
  {
    id: 'static-1',
    label: 'Senior Front End Developer',
    category: 'Technology Information',
    postedAt: '2 days ago',
    location: 'Remote',
    duration: '3-6 month',
    description:
      'Mengembangkan dan mengoptimalkan antarmuka aplikasi web modern dengan fokus pada performa, scalability, dan user experience yang seamless.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'React.js', 'Tailwind CSS', 'Git', '3+'],
  },
  {
    id: 'static-2',
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
    id: 'static-3',
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
  isLoading.value = true
  try {
    const res = await getPublicJobVacanciesApi({ limit: 100 })
    vacancies.value = res.data.list
  } catch (error) {
    message.error('Failed to load job opportunities')
  } finally {
    isLoading.value = false
  }
})

const mappedVacancies = computed<OpportunityCard[]>(() => {
  if (vacancies.value.length === 0) {
    return staticOpportunities
  }
  return vacancies.value.map((v) => {
    const category = v.subrequest?.job_role || 'Technology Information'
    const location = v.schema ? v.schema.charAt(0) + v.schema.slice(1).toLowerCase() : 'Remote'
    const postedAt = formatPostedAt(v.created_at)
    const tags = parseTags(v.subrequest?.tech_stack)
    return {
      id: v.id,
      label: v.name,
      category,
      postedAt,
      location,
      duration: '3-6 month',
      description: v.overview || v.description || '',
      tags,
    }
  })
})

const departmentOptions = computed(() => {
  const depts = new Set<string>()
  mappedVacancies.value.forEach((v) => {
    if (v.category) {
      depts.add(v.category)
    }
  })
  return [
    { label: 'All Departments', value: null as any },
    ...Array.from(depts).map((d) => ({ label: d, value: d })),
  ]
})

const filteredVacancies = computed(() => {
  if (!selectedDepartment.value) {
    return mappedVacancies.value
  }
  return mappedVacancies.value.filter((v) => v.category === selectedDepartment.value)
})

const openVacancyDetail = (vacancy: OpportunityCard) => {
  selectedVacancy.value = vacancy
  window.scrollTo({ top: 250, behavior: 'smooth' })
}

const getListItems = (text: string | null | undefined): string[] => {
  if (!text) return []
  return text
    .split(/\r?\n|•|-|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const jobDescriptions = computed(() => {
  const items = getListItems(selectedVacancy.value?.description)
  if (items.length > 0) return items
  return [
    `Mengembangkan dan memelihara aplikasi web menggunakan teknologi frontend modern untuk peran ${selectedVacancy.value?.label || 'Developer'}`,
    'Berkolaborasi dengan UI/UX Designer untuk mengimplementasikan desain menjadi interface interaktif',
    'Mengoptimalkan performa aplikasi untuk berbagai perangkat dan browser',
    'Mengintegrasikan API dari backend ke dalam frontend',
    'Menjaga kualitas kode melalui code review dan best practice',
    'Berkontribusi dalam pengambilan keputusan teknis terkait arsitektur frontend',
  ]
})

const qualifications = computed(() => {
  const experienceText = selectedVacancy.value?.tags?.find((t) => t.includes('+'))
    ? `Pengalaman minimal ${selectedVacancy.value?.tags.find((t) => t.includes('+'))} sebagai ${selectedVacancy.value?.label || 'Developer'}`
    : `Pengalaman minimal 3+ tahun sebagai ${selectedVacancy.value?.label || 'Developer'}`

  return [
    experienceText,
    'Menguasai JavaScript modern (ES6+)',
    `Berpengalaman menggunakan framework seperti ${selectedVacancy.value?.tags?.slice(0, 3).join(', ') || 'React.js atau Vue.js'}`,
    'Memahami konsep responsive design dan cross-browser compatibility',
    'Terbiasa menggunakan Git dalam workflow development',
    'Memiliki kemampuan problem solving yang baik dan perhatian terhadap detail',
  ]
})

const benefits = computed(() => {
  return [
    'Sistem kerja fleksibel (remote working)',
    'Kesempatan bekerja dalam proyek skala nasional maupun internasional',
    'Lingkungan kerja kolaboratif dan agile',
    'Peluang pengembangan skill dan exposure teknologi terbaru',
    'Potensi perpanjangan kontrak atau full-time opportunity',
    'Networking dengan profesional di industri teknologi',
  ]
})

const otherOpportunities = computed(() => {
  if (!selectedVacancy.value) return []
  return mappedVacancies.value
    .filter((v) => v.id !== selectedVacancy.value?.id)
    .slice(0, 3)
})

const selectOtherVacancy = (other: OpportunityCard) => {
  selectedVacancy.value = other
  window.scrollTo({ top: 250, behavior: 'smooth' })
}
</script>

<template>
  <LandingLayout>
    <OpportunitiesHero />

    <!-- Main Content Section -->
    <section :class="[selectedVacancy ? 'bg-[#f8fafc]' : 'bg-white', 'py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300']">
      <div class="max-w-7xl mx-auto">
        <!-- List View -->
        <div v-if="!selectedVacancy" class="flex flex-col">
          <!-- Filter and Breadcrumb Header -->
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-gray-100">
            <!-- Breadcrumbs -->
            <div class="flex items-center gap-2 text-slate-500 font-medium">
              <router-link to="/" class="flex items-center gap-1.5 hover:text-[#07229e] transition-colors">
                <n-icon :size="20"><SmartHome /></n-icon>
                <span>Home</span>
              </router-link>
              <span class="text-slate-300">/</span>
              <div class="flex items-center gap-1.5 text-slate-800">
                <n-icon :size="20"><Briefcase /></n-icon>
                <span>Opportunities</span>
              </div>
            </div>

            <!-- Select Department Filter -->
            <div class="relative w-full md:w-80">
              <n-select
                v-slot:arrow
                v-model:value="selectedDepartment"
                :options="departmentOptions"
                placeholder="Select Department"
                class="w-full"
                size="large"
                clearable
              />
            </div>
          </div>

          <!-- Grid of Cards -->
          <div v-if="isLoading" class="flex justify-center items-center py-20">
            <n-spin size="large" />
          </div>
          <div v-else-if="filteredVacancies.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <p class="text-lg text-slate-500 font-medium">No opportunities found for this department.</p>
          </div>
          <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            <article
              v-for="card in filteredVacancies"
              :key="card.id"
              @click="openVacancyDetail(card)"
              class="group cursor-pointer relative overflow-hidden rounded-3xl bg-white px-6 pt-6 pb-8 shadow-[0px_4px_4px_0px_rgba(7,34,158,0.18)] outline -outline-offset-1 outline-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_32px_-18px_rgba(7,34,158,0.35)] sm:px-8 sm:pt-8 sm:pb-10 w-full flex flex-col justify-between"
            >
              <!-- Decorative circle gradient in top-right -->
              <div class="absolute right-0 top-0 h-40 w-40 rounded-bl-[100px] bg-linear-to-br from-blue-500 to-cyan-500 opacity-10 blur-[19.95px]" />

              <!-- Card Header -->
              <div class="relative flex items-center justify-between gap-4 w-full z-10">
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
                <span class="text-[#475569] text-base font-normal">
                  {{ card.postedAt }}
                </span>
              </div>

              <!-- Card Body -->
              <div class="relative mt-4 flex flex-col gap-2 w-full z-10 flex-1">
                <h3 class="text-2xl font-bold leading-6 text-slate-800 group-hover:text-[#07229e] transition-colors">
                  {{ card.label }}
                </h3>
                
                <!-- Info Row (Location & Duration) -->
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex items-center gap-1.5 text-base font-normal leading-5 text-slate-600">
                    <n-icon :size="20" :component="MapPin" class="text-slate-500" />
                    <span class="text-[#475569] text-base font-normal">{{ card.location }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-base font-normal leading-5 text-slate-600">
                    <n-icon :size="20" :component="Clock" class="text-slate-500" />
                    <span class="text-[#475569] text-base font-normal">{{ card.duration }}</span>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-[#475569] text-base leading-normal line-clamp-3 h-20 mt-2">
                  {{ card.description }}
                </p>
              </div>

              <!-- Tech Tags -->
              <div class="relative mt-5 flex flex-wrap items-start gap-2 z-10">
                <div
                  v-for="tag in card.tags"
                  :key="tag"
                  class="bg-[#c7d0f3] flex items-center justify-center px-2 py-0.5 rounded-[22px]"
                >
                  <span class="text-[#07229e] text-sm font-medium leading-5">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Detail View Section -->
        <div v-else class="flex flex-col gap-10">
          <!-- Detail Breadcrumbs -->
          <div class="flex items-center gap-2 text-slate-500 font-medium pb-8 border-b border-gray-100">
            <router-link to="/" class="flex items-center gap-1.5 hover:text-[#07229e] transition-colors">
              <n-icon :size="20"><SmartHome /></n-icon>
              <span>Home</span>
            </router-link>
            <span class="text-slate-300">/</span>
            <button @click="selectedVacancy = null" class="flex items-center gap-1.5 hover:text-[#07229e] transition-colors bg-transparent border-0 p-0 font-medium text-slate-500 cursor-pointer">
              <n-icon :size="20"><Briefcase /></n-icon>
              <span>Opportunities</span>
            </button>
            <span class="text-slate-300">/</span>
            <div class="flex items-center gap-1.5 text-slate-800 font-semibold">
              <span>Details</span>
            </div>
          </div>

          <!-- Detail Grid Container -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start w-full">
            <!-- Left Column (Main details card) -->
            <div class="lg:col-span-2 bg-white flex flex-col gap-6 p-8 lg:p-10 rounded-[24px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-[#e2e8f0]">
              <!-- Header -->
              <div class="flex flex-col gap-4 items-start w-full">
                <div class="bg-[#e2e8f0] px-2 py-0.5 rounded-[22px] text-sm text-[#1e293b] font-medium leading-5">
                  {{ selectedVacancy.category }}
                </div>
                <h1 class="text-[#061b7e] text-3xl font-bold leading-tight">
                  {{ selectedVacancy.label }}
                </h1>
                <div class="flex items-center gap-1.5 text-[#475569] text-base">
                  <n-icon :size="20" :component="Calendar" class="text-slate-500" />
                  <span>Posted On: {{ selectedVacancy.postedAt }}</span>
                </div>
              </div>

              <!-- Overview -->
              <div class="flex flex-col gap-2 items-start mt-4">
                <h2 class="text-[#061b7e] text-xl font-semibold">Overview</h2>
                <p class="text-[#475569] text-base leading-relaxed text-justify whitespace-pre-line">
                  {{ selectedVacancy.description }}
                </p>
              </div>

              <!-- Duration & Location -->
              <div class="grid grid-cols-2 gap-6 py-4 border-y border-slate-100 mt-2">
                <div class="flex flex-col gap-1">
                  <h3 class="text-[#061b7e] text-xl font-semibold">Duration</h3>
                  <p class="text-[#475569] text-base">{{ selectedVacancy.duration }}</p>
                </div>
                <div class="flex flex-col gap-1">
                  <h3 class="text-[#061b7e] text-xl font-semibold">Location</h3>
                  <p class="text-[#475569] text-base">{{ selectedVacancy.location }}</p>
                </div>
              </div>

              <!-- Job Description Points -->
              <div class="flex flex-col gap-3 items-start mt-2">
                <h2 class="text-[#061b7e] text-xl font-semibold">Job Description</h2>
                <div class="flex flex-col gap-3 w-full">
                  <div v-for="(item, idx) in jobDescriptions" :key="idx" class="flex gap-2.5 items-start">
                    <n-icon :size="22" :component="Checkbox" class="text-[#061b7e] shrink-0 mt-0.5" />
                    <p class="text-[#475569] text-base leading-normal">{{ item }}</p>
                  </div>
                </div>
              </div>

              <!-- Qualifications -->
              <div class="flex flex-col gap-3 items-start mt-2">
                <h2 class="text-[#061b7e] text-xl font-semibold">Qualifications</h2>
                <div class="flex flex-col gap-3 w-full">
                  <div v-for="(qual, idx) in qualifications" :key="idx" class="flex gap-2.5 items-start">
                    <n-icon :size="22" :component="Checkbox" class="text-[#061b7e] shrink-0 mt-0.5" />
                    <p class="text-[#475569] text-base leading-normal">{{ qual }}</p>
                  </div>
                </div>
              </div>

              <!-- Tech Stack -->
              <div class="flex flex-col gap-3 items-start mt-2">
                <h2 class="text-[#061b7e] text-xl font-semibold">Tech Stack</h2>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in selectedVacancy.tags"
                    :key="tag"
                    class="bg-[#c7d0f3] text-[#07229e] text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Benefits -->
              <div class="flex flex-col gap-3 items-start mt-2">
                <h2 class="text-[#061b7e] text-xl font-semibold">Benefits</h2>
                <div class="flex flex-col gap-3 w-full">
                  <div v-for="(benefit, idx) in benefits" :key="idx" class="flex gap-2.5 items-start">
                    <n-icon :size="22" :component="Checks" class="text-[#061b7e] shrink-0 mt-0.5" />
                    <p class="text-[#475569] text-base leading-normal">{{ benefit }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column (Other Opportunities) -->
            <div class="flex flex-col gap-6">
              <h2 class="text-[#475569] text-2xl font-medium flex items-center gap-2">
                <n-icon :size="24"><Briefcase /></n-icon>
                <span>Other Opportunities</span>
              </h2>
              
              <div class="flex flex-col gap-6 w-full">
                <article
                  v-for="other in otherOpportunities"
                  :key="other.id"
                  @click="selectOtherVacancy(other)"
                  class="group cursor-pointer relative overflow-hidden rounded-3xl bg-white px-5 pt-5 pb-6 shadow-[0px_4px_4px_0px_rgba(7,34,158,0.18)] outline -outline-offset-1 outline-slate-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_16px_32px_-18px_rgba(7,34,158,0.35)] w-full flex flex-col justify-between"
                >
                  <!-- Decorative circle gradient in top-right -->
                  <div class="absolute right-0 top-0 h-32 w-32 rounded-bl-[100px] bg-linear-to-br from-blue-500 to-cyan-500 opacity-10 blur-[19.95px]" />

                  <!-- Card Header -->
                  <div class="relative flex items-center justify-between gap-4 w-full z-10">
                    <div v-if="other.category === 'Technology Information'" class="bg-[#e2e8f0] flex gap-1 items-center justify-center px-2 py-0.5 rounded-[22px]">
                      <span class="text-[#1e293b] text-sm font-medium leading-5">
                        {{ other.category }}
                      </span>
                    </div>
                    <div v-else class="inline-flex items-center rounded-3xl px-2 py-0.5">
                      <span class="text-sm font-normal leading-5 text-slate-800">
                        {{ other.category }}
                      </span>
                    </div>
                    <span class="text-[#475569] text-sm font-normal">
                      {{ other.postedAt }}
                    </span>
                  </div>

                  <!-- Card Body -->
                  <div class="relative mt-3 flex flex-col gap-1.5 w-full z-10">
                    <h3 class="text-xl font-bold leading-6 text-slate-800 group-hover:text-[#07229e] transition-colors">
                      {{ other.label }}
                    </h3>
                    
                    <!-- Info Row (Location & Duration) -->
                    <div class="flex flex-wrap items-center gap-3">
                      <div class="flex items-center gap-1.5 text-sm font-normal leading-5 text-slate-600">
                        <n-icon :size="16" :component="MapPin" class="text-slate-500" />
                        <span class="text-[#475569] text-sm font-normal">{{ other.location }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-sm font-normal leading-5 text-slate-600">
                        <n-icon :size="16" :component="Clock" class="text-slate-500" />
                        <span class="text-[#475569] text-sm font-normal">{{ other.duration }}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CTASection />
  </LandingLayout>
</template>
