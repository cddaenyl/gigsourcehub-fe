<script setup lang="ts">
import { Bolt, Clock, Medal, PlugConnected, Users } from '@vicons/tabler'
import { NIcon } from 'naive-ui'

defineOptions({
  name: 'AboutSection',
})
</script>

<template>
  <section id="about" class="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div
      class="mx-auto flex w-full max-w-181.25 flex-col items-center justify-center gap-5 text-center"
    >
      <div
        class="inline-flex items-center justify-start gap-1.25 rounded-full border border-blue-900 px-3 py-2 shadow-md"
      >
        <div class="flex relative justify-center text-yellow-400 font-normal">
          <n-icon :size="16"><Bolt /></n-icon>
        </div>
        <div class="flex text-xs leading-5 font-semibold text-slate-700">
          Why Freelancers Choose Us
        </div>
      </div>

      <h2 class="text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
        Redefending the<br />
        <span class="text-sky-400 bg-linear-to-l from-[#C27AFF] via-[#7C86FF] to-[#51A2FF] bg-clip-text text-transparent">Freelance Experience</span>
      </h2>

      <p class="w-full text-center text-base lg:leading-7 font-medium text-slate-600 sm:text-xl">
        We build a flexible and transparent project-based ecosystem designed to support your growth
        as a freelance professional.
      </p>
    </div>

    <div
      class="mx-auto mt-12 flex w-full max-w-7xl flex-col items-stretch justify-center gap-6 lg:mt-16 lg:flex-row lg:gap-9"
    >
      <img
        class="h-64 w-full rounded-3xl border-x-2 border-blue-900 object-cover sm:h-80 lg:h-auto lg:w-5/12"
        src="../../assets/working_man.jpg"
        alt="Freelancers collaborating"
      />

      <div class="flex w-full flex-col gap-5 sm:gap-6 lg:w-7/12 lg:gap-9">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            class="flex min-h-64 flex-col items-start justify-start gap-5 rounded-3xl border-y-2 border-blue-500 bg-white px-6 pt-6 pb-12 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          >
            <div class="inline-flex items-center justify-start rounded-[10px] bg-blue-500 p-2.5">
              <n-icon :size="28" color="#ffffff"><Clock /></n-icon>
            </div>
            <div class="flex w-full flex-col items-start justify-start gap-3.5 text-left">
              <div class="text-xl leading-6 font-semibold text-slate-800">
                Flexible Work, Your Way
              </div>
              <div class="text-base leading-6 font-medium text-slate-600">
                Choose projects that align with your schedule and preferences, with a fully flexible
                way of working.
              </div>
            </div>
          </div>

          <div
            class="flex min-h-64 flex-col items-start justify-start gap-5 rounded-3xl border-y-2 border-pink-500 bg-white px-6 pt-6 pb-12 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          >
            <div class="inline-flex items-center justify-start rounded-[10px] bg-pink-500 p-2.5">
              <div class="grid h-7 w-7 grid-cols-2 gap-1">
                <n-icon :size="28" color="#ffffff"><PlugConnected /></n-icon>
              </div>
            </div>
            <div class="flex w-full flex-col items-start justify-start gap-3.5 text-left">
              <div class="text-xl leading-7 font-semibold text-slate-800">
                Intelligent Project Matching
              </div>
              <div class="text-base leading-6 font-medium text-slate-600">
                We match your skills with the right projects, helping you work more efficiently and
                make a real impact.
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            class="flex min-h-64 flex-col items-start justify-start gap-5 rounded-3xl border-y-2 border-teal-500 bg-white px-6 pt-6 pb-12 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          >
            <div class="inline-flex items-center justify-start rounded-[10px] bg-teal-500 p-2.5">
              <n-icon :size="28" color="#ffffff"><Users /></n-icon>
            </div>
            <div class="flex w-full flex-col items-start justify-start gap-3.5 text-left">
              <div class="text-xl leading-7 font-semibold text-slate-800">
                Premium Talent Network
              </div>
              <div class="text-base leading-6 font-medium text-slate-600">
                Collaborate with top professionals and work on projects from trusted startups to
                enterprise clients.
              </div>
            </div>
          </div>

          <div
            class="flex min-h-64 flex-col items-start justify-start gap-5 rounded-3xl border-y-2 border-orange-500 bg-white px-6 pt-6 pb-12 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          >
            <div class="inline-flex items-center justify-start rounded-[10px] bg-orange-500 p-2.5">
              <n-icon :size="28" color="#ffffff"><Medal /></n-icon>
            </div>
            <div class="flex w-full flex-col items-start justify-start gap-3.5 text-left">
              <div class="text-xl leading-7 font-semibold text-slate-800">
                Accelerated Career Growth
              </div>
              <div class="text-base leading-6 font-medium text-slate-600">
                Build your portfolio, gain valuable experience, and strengthen your professional
                credibility through real projects.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
