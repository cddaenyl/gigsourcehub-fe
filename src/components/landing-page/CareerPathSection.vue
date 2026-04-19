<script setup lang="ts">
import { Bolt } from '@vicons/tabler'
import { NIcon } from 'naive-ui'
import productImage from '@/assets/departement_product.jpg'
import techImage from '@/assets/departement_tech.jpg'
import designImage from '@/assets/departement_design.jpg'
import marketingImage from '@/assets/departement_marketing.jpg'
import businessDevelopmentImage from '@/assets/departement_business developement.jpg'
import operationsImage from '@/assets/working_man.jpg'

type CareerPathCard = {
  label: string
  image: string
}

const careerPathCards: CareerPathCard[] = [
  { label: 'Product', image: productImage },
  { label: 'Technology', image: techImage },
  { label: 'Design', image: designImage },
  { label: 'Marketing', image: marketingImage },
  { label: 'Operations', image: operationsImage },
  { label: 'Bussines Development', image: businessDevelopmentImage },
]

defineOptions({
  name: 'CareerPathSection',
})
</script>

<template>
  <section id="cta" class="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-start items-start flex-col gap-5">
        <div
          class="flex items-center justify-start gap-1.25 rounded-full border border-blue-900 px-4 py-2 shadow-md"
        >
          <div class="flex relative justify-center text-yellow-400 font-normal">
            <n-icon :size="16"><Bolt /></n-icon>
          </div>
          <div class="flex text-xs leading-5 font-semibold text-slate-700">Carrer Paths</div>
        </div>

        <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
          Find Your Perfect Role
        </h2>

        <p class="text-base leading-7 font-medium text-slate-600 sm:text-xl">
          Browse open Explore opportunities across 9 dynamic departments and discover where your
          expertise can make the greatest impactoles we’re currently hiring for across various
          projects and teams.
        </p>
      </div>

      <div class="mt-12 overflow-x-auto pb-2 lg:mt-16">
        <div class="flex min-w-max gap-4 sm:gap-5 lg:min-w-0 lg:grid lg:grid-cols-3 xl:grid-cols-6">
          <article
            v-for="card in careerPathCards"
            :key="card.label"
            class="group relative h-80 w-60 shrink-0 overflow-hidden rounded-3xl border border-blue-900 bg-slate-950 sm:h-96 sm:w-80 lg:w-auto"
          >
            <img
              :src="card.image"
              :alt="card.label"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div
              class="absolute inset-0 bg-linear-to-b from-black/0 via-black/20 to-slate-950/90"
            ></div>

            <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <h3 class="text-2xl font-semibold leading-6 text-white line-clamp-1">
                {{ card.label }}
              </h3>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
