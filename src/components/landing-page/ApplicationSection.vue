<script setup lang="ts">
import { Bolt, FileUpload, Send, CheckupList, UserPlus } from '@vicons/tabler'
import { NIcon } from 'naive-ui'

type ApplicationStep = {
  title: string
  description: string
  featured?: boolean
  icon: 'user' | 'upload' | 'submit' | 'review'
}

const applicationSteps: ApplicationStep[] = [
  {
    title: 'Create Your Account',
    description:
      'Sign up in minutes and set up your freelancer profile with essential personal details.',
    featured: true,
    icon: 'user',
  },
  {
    title: 'Complete Your Profile & Upload CV',
    description:
      'Showcase your skills, experience, and portfolio to build a strong and credible profile.',
    icon: 'upload',
  },
  {
    title: 'Submit Your Application',
    description:
      'Apply to available roles or join our talent pool based on your skills and interests.',
    icon: 'submit',
  },
  {
    title: 'Get Reviewed & Matched',
    description:
      'Our team reviews your profile and matches you with suitable roles and opportunities.',
    icon: 'review',
  },
]

const stepIconMap = {
  user: UserPlus,
  upload: FileUpload,
  submit: Send,
  review: CheckupList,
} as const

defineOptions({
  name: 'ApplicationSection',
})
</script>

<template>
  <section id="application" class="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col items-center justify-center gap-5">
        <div
          class="inline-flex items-center justify-center gap-1.25 rounded-full border border-blue-900 px-4 py-2 shadow-md"
        >
          <div class="flex justify-center text-yellow-400 font-normal">
            <n-icon :size="16"><Bolt /></n-icon>
          </div>
          <div class="text-xs leading-5 font-semibold text-slate-700">Application Steps</div>
        </div>

        <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
          Your Journey Starts Here
        </h2>

        <p class="text-base leading-7 text-center font-medium text-slate-600 sm:text-xl">
          Four simple steps to unlock exciting freelance opportunities with us
        </p>
      </div>

      <div
        class="relative mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:mt-16 lg:gap-9"
      >
        <div
          class="hidden xl:inline absolute top-12 h-2 w-full rounded-full border bg-primary"
        ></div>
        <article
          v-for="step in applicationSteps"
          :key="step.title"
          class="relative flex min-h-72 flex-col items-center gap-5 overflow-hidden rounded-3xl px-8 pt-8 pb-12 text-center shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] outline -outline-offset-1 outline-slate-300"
          :class="
            step.featured ? 'bg-slate-50 outline-2 -outline-offset-2 outline-blue-900' : 'bg-white'
          "
        >
          <div
            class="inline-flex items-center justify-start rounded-[10px] p-2.5"
            :class="step.featured ? 'bg-primary' : 'bg-indigo-200'"
          >
            <NIcon
              :size="28"
              :component="stepIconMap[step.icon]"
              :color="step.featured ? '#ffffff' : '#07229e'"
            />
          </div>

          <div class="flex w-full flex-col items-start justify-start gap-2">
            <h3 class="w-full text-center text-xl leading-6 font-bold text-slate-800">
              {{ step.title }}
            </h3>
            <p class="w-full text-center text-base leading-5 font-normal text-slate-600">
              {{ step.description }}
            </p>
          </div>
        </article>
      </div>

      <div
        class="mt-6 inline-flex w-full flex-col items-start justify-start overflow-hidden rounded-[10px] border-l-2 border-blue-900 bg-slate-100 p-3 lg:mt-8"
      >
        <div class="inline-flex w-full items-start justify-start gap-2.5">
          <div class="relative h-5 w-5 shrink-0 overflow-hidden">
            <div
              class="absolute left-0.75 top-0.75 h-3.5 w-3.5 rounded-full border border-blue-900"
            ></div>
            <div class="absolute left-2.5 top-1.5 w-0 border border-blue-900"></div>
            <div class="absolute left-2.5 top-2.5 h-1 w-0.5 border border-slate-700"></div>
          </div>

          <div class="inline-flex flex-1 flex-col items-start justify-center gap-1.25">
            <div class="w-full text-base leading-5 font-semibold text-slate-700">
              Application Review Process
            </div>
            <div class="w-full text-sm leading-5 font-medium text-slate-500">
              All applications will be carefully reviewed by our recruitment team. Only shortlisted
              candidates who match our current requirements will be contacted. However, your profile
              remains in our talent pool for future opportunities.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
