<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Bolt, ChevronsDown, ChevronsUp, ChevronUp, ChevronDown } from '@vicons/tabler'
import { NIcon } from 'naive-ui'
import { getPublicFAQsApi } from '@/services/faq.service'

defineOptions({
  name: 'FaqSection',
})

type FaqItem = {
  question: string
  answer: string
}

const faqs = ref<any[]>([])

const staticFaqItems: FaqItem[] = [
  {
    question: 'What is the Freelance Talent Pool?',
    answer:
      'It is a curated network of skilled freelancers who are reviewed, matched, and assigned to projects based on their expertise and availability.',
  },
  {
    question: 'How long does the process take?',
    answer:
      'The review process typically takes 5-7 business days. If your profile matches our current needs, our team will reach out to you with next steps. All applications are carefully reviewed and kept on file for future opportunities.',
  },
  {
    question: 'Can I apply for multiple roles?',
    answer:
      'Yes. You can apply for more than one role as long as your skills and experience fit the requirements of each position.',
  },
  {
    question: 'What types of contracts are available?',
    answer:
      'We support project-based, part-time, and long-term contract opportunities depending on client needs and your preferences.',
  },
  {
    question: 'Do I need to be available full-time?',
    answer:
      'No. Many opportunities are flexible. You can choose projects that fit your schedule, and the team will only match you with roles that align with your availability.',
  },
]

onMounted(async () => {
  try {
    const res = await getPublicFAQsApi({ limit: 100 })
    faqs.value = res.data.list
  } catch (error) {
    // Keep using static fallbacks
  }
})

const faqItems = computed<FaqItem[]>(() => {
  if (faqs.value.length === 0) {
    return staticFaqItems
  }
  return faqs.value.map((item) => ({
    question: item.question,
    answer: item.answer,
  }))
})

const openIndex = ref()
const showAll = ref(false)

const visibleFaqItems = computed(() => (showAll.value ? faqItems.value : faqItems.value.slice(0, 3)))

const toggleFaq = (index: number) => {
  openIndex.value = openIndex.value === index ? -1 : index
}
</script>

<template>
  <section id="faq" class="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div
      class="mx-auto flex w-full max-w-181.25 flex-col items-center justify-center gap-5 text-center"
    >
      <div
        class="inline-flex items-center justify-start gap-1.25 rounded-full border border-blue-900 px-3 py-2 shadow-md"
      >
        <div class="relative flex justify-center font-normal text-yellow-400">
          <n-icon :size="16"><Bolt /></n-icon>
        </div>
        <div class="flex text-xs leading-5 font-semibold text-slate-700">FAQ</div>
      </div>

      <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
        Got Questions? We've Got Answers
      </h2>

      <p class="w-full text-center text-base font-medium text-slate-600 sm:text-xl lg:leading-7">
        Everything you need to know about joining our freelance talent network.
      </p>
    </div>

    <div class="mx-auto mt-12 w-full max-w-4xl lg:mt-16">
      <div class="flex flex-col gap-3.5">
        <div
          v-for="(item, index) in visibleFaqItems"
          :key="item.question"
          class="overflow-hidden rounded-[10px] bg-white shadow-sm transition-all duration-200 outline -outline-offset-1"
          :class="openIndex === index ? ' outline-blue-900' : ' outline-slate-300'"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6"
            :aria-expanded="openIndex === index"
            @click="toggleFaq(index)"
          >
            <span
              class="text-left text-sm font-medium leading-7 sm:text-xl hover:text-blue-900 cursor-pointer"
              :class="openIndex === index ? 'text-blue-900' : 'text-slate-700'"
            >
              {{ item.question }}
            </span>

            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center text-slate-700 transition-colors"
              :class="openIndex === index ? 'text-blue-900' : 'text-slate-700'"
              aria-hidden="true"
            >
              <span class="relative block h-5 w-5">
                <n-icon :size="16" :component="openIndex === index ? ChevronUp : ChevronDown" />
              </span>
            </span>
          </button>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-56 opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="max-h-56 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-show="openIndex === index" class="px-4 pb-4 sm:px-6 sm:pb-6">
              <p class="max-w-3xl text-sm leading-6 text-slate-700 sm:text-lg sm:leading-7">
                {{ item.answer }}
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <div class="mt-6 flex justify-center sm:mt-8">
        <button
          type="button"
          class="float-decor inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-blue-900 transition hover:bg-blue-50 sm:text-base"
          @click="showAll = !showAll"
        >
          <span>{{ showAll ? 'Show Less' : 'Show More' }}</span>
          <n-icon :size="16" :component="showAll ? ChevronsUp : ChevronsDown" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.float-decor {
  animation: decor-float 2.8s ease-in-out infinite;
  will-change: translate;
}

@keyframes decor-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -10px;
  }
}
</style>
