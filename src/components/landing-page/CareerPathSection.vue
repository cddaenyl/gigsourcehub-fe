<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bolt } from '@vicons/tabler'
import { NIcon, NSpin } from 'naive-ui'
import { usePublicCareerDepartments } from '@/composables/usePublicCareerDepartments'

// Import fallback static images
import productImage from '@/assets/departement_product.jpg'
import techImage from '@/assets/departement_tech.jpg'
import designImage from '@/assets/departement_design.jpg'
import marketingImage from '@/assets/departement_marketing.jpg'
import businessDevelopmentImage from '@/assets/departement_business developement.jpg'
import operationsImage from '@/assets/working_man.jpg'

defineOptions({
  name: 'CareerPathSection',
})

// States for interactive accordion
const hoveredIndex = ref<number | null>(null)
const clickedIndex = ref<number | null>(null)

// Current active expanded index (prioritizing hover, falling back to clicked)
const activeIndex = computed(() => {
  if (hoveredIndex.value !== null) return hoveredIndex.value
  return clickedIndex.value
})

// Fetch public approved career departments from API
const { careerDepartments, isLoading } = usePublicCareerDepartments({
  limit: 10,
})

// Helper for fallback images matching by name
const getFallbackImage = (name: string): string => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('product')) return productImage
  if (nameLower.includes('tech')) return techImage
  if (nameLower.includes('design')) return designImage
  if (nameLower.includes('marketing')) return marketingImage
  if (nameLower.includes('business') || nameLower.includes('bisnis') || nameLower.includes('development')) return businessDevelopmentImage
  if (nameLower.includes('operation') || nameLower.includes('operasi') || nameLower.includes('working')) return operationsImage
  return operationsImage
}

// Compute cards list (uses API data if present, otherwise fallback to mock data)
const displayCards = computed(() => {
  if (careerDepartments.value && careerDepartments.value.length > 0) {
    return careerDepartments.value.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      image: dept.image_url || getFallbackImage(dept.name),
    }))
  }

  return [
    { id: '1', name: 'Product', description: 'Defines and manages product direction to align user needs with overall business goals.', image: productImage },
    { id: '2', name: 'Technology', description: 'Builds and maintains core services, databases, and general infrastructure.', image: techImage },
    { id: '3', name: 'Design', description: 'Creates visual concepts, designs interfaces, and enhances product user experience.', image: designImage },
    { id: '4', name: 'Marketing', description: 'Strategizes and executes plans to reach new audiences and grow product usage.', image: marketingImage },
    { id: '5', name: 'Operations', description: 'Manages day-to-day operations and coordinates cross-functional project teams.', image: operationsImage },
    { id: '6', name: 'Business Development', description: 'Identifies partnership opportunities and drives overall company growth.', image: businessDevelopmentImage },
  ]
})

const handleCardClick = (index: number) => {
  if (clickedIndex.value === index) {
    clickedIndex.value = null
  } else {
    clickedIndex.value = index
  }
}
</script>

<template>
  <section id="career" class="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="flex justify-start items-start flex-col gap-5">
        <div
          class="flex items-center justify-start gap-1.25 rounded-full border border-blue-900 px-4 py-2 shadow-md"
        >
          <div class="flex relative justify-center text-yellow-400 font-normal">
            <n-icon :size="16"><Bolt /></n-icon>
          </div>
          <div class="flex text-xs leading-5 font-semibold text-slate-700">Career Paths</div>
        </div>

        <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
          Find Your Perfect Role
        </h2>

        <p class="text-base leading-7 font-medium text-slate-600 sm:text-xl">
          Browse open Explore opportunities across {{ displayCards.length }} dynamic departments and discover where your
          expertise can make the greatest impact we’re currently hiring for across various
          projects and teams.
        </p>
      </div>

      <!-- Accordion Grid -->
      <n-spin :show="isLoading">
        <div 
          :class="[
            'mt-12 overflow-x-auto pb-6 lg:mt-16',
            displayCards.length > 5 ? '' : 'lg:overflow-x-visible'
          ]"
        >
          <div 
            :class="[
              'flex gap-4 sm:gap-5 h-96 sm:h-[450px] lg:h-[500px]',
              displayCards.length > 5 
                ? 'w-max min-w-max' 
                : 'w-max lg:w-full min-w-max lg:min-w-0'
            ]"
          >
            <article
              v-for="(card, index) in displayCards"
              :key="card.id"
              @click="handleCardClick(index)"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
              :class="[
                'group relative overflow-hidden rounded-[32px] border border-blue-900/10 bg-slate-950 transition-all duration-500 ease-in-out cursor-pointer shadow-md select-none',
                // If there are more than 5 cards, lock fixed widths for horizontal scroll
                displayCards.length > 5
                  ? activeIndex !== null
                    ? activeIndex === index
                      ? 'w-64 sm:w-80 lg:w-[420px] shrink-0'
                      : 'w-20 sm:w-24 lg:w-[140px] shrink-0'
                    : 'w-24 sm:w-28 lg:w-[170px] shrink-0'
                  // Standard flexible flexbox for <= 5 cards
                  : activeIndex !== null
                    ? activeIndex === index
                      ? 'w-64 sm:w-80 lg:w-auto lg:flex-[3.5]'
                      : 'w-20 sm:w-24 lg:w-auto lg:flex-[0.8]'
                    : 'w-24 sm:w-28 lg:w-auto lg:flex-1'
              ]"
            >
              <!-- Background Image fill height center -->
              <img
                :src="card.image"
                :alt="card.name"
                class="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              <!-- Overlay Gradient -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-500"
              ></div>

              <!-- Text Content Aligned at the Bottom -->
              <div class="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col justify-end h-1/2">
                <div :class="[
                  'transition-all duration-500 flex flex-col',
                  activeIndex === index ? 'items-start text-left' : 'items-center text-center'
                ]">
                  <h3 :class="[
                    'font-bold text-white transition-all duration-500 leading-tight tracking-wide whitespace-nowrap',
                    activeIndex === index ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-sm sm:text-base'
                  ]">
                    {{ card.name }}
                  </h3>

                  <!-- Description showing smoothly when expanded -->
                  <p
                    :class="[
                      'text-slate-200 text-xs sm:text-sm line-clamp-3 transition-all duration-500 ease-in-out origin-bottom',
                      activeIndex === index
                        ? 'opacity-100 max-h-24 mt-2 scale-y-100'
                        : 'opacity-0 max-h-0 mt-0 scale-y-0 overflow-hidden'
                    ]"
                  >
                    {{ card.description }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </n-spin>
    </div>
  </section>
</template>

<style scoped>
/* Disable scrollbars but allow scrolling on mobile horizontal lists */
.overflow-x-auto {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}
.overflow-x-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
