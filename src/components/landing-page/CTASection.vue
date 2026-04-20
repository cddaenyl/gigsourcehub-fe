<script setup lang="ts">
import { ArrowRight, Checks, Rocket, Shield, Users } from '@vicons/tabler'
import { NIcon } from 'naive-ui'

defineOptions({
  name: 'CTASection',
})
</script>

<template>
  <section
    id="cta"
    class="bg-linear-to-b from-[#0723A1] to-[#2461EA] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
  >
    <div
      class="mx-auto flex w-full max-w-181.25 flex-col items-center justify-center gap-5 text-center"
    >
      <div
        class="inline-flex items-center bg-white/10 justify-start gap-1.25 rounded-full border border-white px-3 py-2 shadow-md backdrop-blur-2xl"
      >
        <div class="relative flex justify-center font-normal text-yellow-400">
          <n-icon :size="16"><Rocket /></n-icon>
        </div>
        <div class="flex text-xs leading-5 font-semibold text-white">Start Your Journey</div>
      </div>

      <h2 class="text-3xl leading-tight font-bold text-white sm:text-4xl">
        Ready to Join Our Talent Network?
      </h2>

      <p
        class="w-full text-white text-center text-base font-medium text-whites sm:text-xl lg:leading-7"
      >
        Start your journey with GigSource Hub today. Connect with relevant opportunities, grow your
        skills, and expand your professional network.
      </p>
    </div>

    <div class="mx-auto mt-6 w-full max-w-4xl lg:mt-12">
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/sign-up"
          class="flex justify-center items-center gap-1 bg-white text-gray-800 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-5 py-3 font-bold rounded-full hover:bg-gray-300 transition-colors text-center"
        >
          Join Talent Pool
          <n-icon :size="18" :component="ArrowRight" color="#1e2939" class />
        </a>

        <a
          href="#how-it-works"
          class="flex justify-center outline-1 outline-white/30 -outline-offset-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-md text-white bg-linear-to-t from-white/10 to-white/5 px-5 py-3 rounded-full font-semibold transition-colors text-center hover:bg-white/10"
        >
          Explore Opportunities
        </a>
      </div>
    </div>

    <div
      class="flex flex-col lg:flex-row gap-6 lg:gap-12 justify-center mx-auto mt-12 lg:mb-8 w-full max-w-4xl"
    >
      <div class="flex justify-center items-center gap-1.25">
        <div class="flex justify-center text-white text-base font-normal leading-5 gap-2">
          <n-icon :size="18"><Shield /></n-icon> <span class="flex">Secure Platform</span>
        </div>
      </div>
      <div class="flex justify-center items-center gap-1.25">
        <div class="flex justify-center text-white text-base font-normal leading-5 gap-2">
          <n-icon :size="18"><Checks /></n-icon> <span class="flex">Verified Projects</span>
        </div>
      </div>
      <div class="flex justify-center items-center gap-1.25">
        <div class="flex justify-center text-white text-base font-normal leading-5 gap-2">
          <n-icon :size="18"><Users /></n-icon> <span class="flex">500+ Active Users</span>
        </div>
      </div>
    </div>
  </section>
</template>
