<script setup lang="ts">
import { ArrowRight } from '@vicons/tabler'
import { NIcon } from 'naive-ui'
defineOptions({
  name: 'Hero',
})
</script>

<template>
  <section
    class="relative bg-linear-to-b from-[#0B1121] to-[#020617] h-screen text-white flex items-center overflow-hidden"
  >
    <div class="z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Hero Content -->
        <div class="font-semibold space-y-2">
          <div
            class="px-3 py-2 my-4 bg-white/5 rounded-full outline -outline-offset-1 outline-white/10 inline-flex justify-center items-center gap-2.5 overflow-hidden"
          >
            <div class="justify-center text-white text-sm font-normal">Open for new talents</div>
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl">
            Build Impactful <br />
            <span
              class="text-4xl md:text-5xl lg:text-6xl bg-linear-to-l from-[#C27AFF] via-[#7C86FF] to-[#51A2FF] bg-clip-text text-transparent"
            >
              Solutions.
            </span>
          </h1>
          <h1 class="text-4xl md:text-5xl lg:text-6xl">Grow With Solutionlabs.</h1>
          <p class="text-lg text-[#CAD5E2] font-medium">
            Join a network of project-based professionals and collaborate on real-world technology
            and business solutions with startups and enterprises.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/sign-up"
              class="flex items-center gap-1 bg-white text-gray-800 px-5 py-3 font-bold rounded-full hover:bg-gray-300 transition-colors text-center"
            >
              Join Talent Pool
              <n-icon :size="18" :component="ArrowRight" color="#1e2939" class />
            </a>

            <a
              href="#how-it-works"
              class="flex outline-1 outline-white/10 -outline-offset-1 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-md text-white bg-white/5 px-5 py-3 rounded-full font-semibold transition-colors text-center hover:bg-white/10"
            >
              Explore Opportunities
            </a>
          </div>
          <!-- <div class="flex items-center gap-8 pt-4">
            <div>
              <p class="text-3xl font-bold">10K+</p>
              <p class="text-blue-100">Active Users</p>
            </div>
            <div>
              <p class="text-3xl font-bold">5K+</p>
              <p class="text-blue-100">Projects Completed</p>
            </div>
            <div>
              <p class="text-3xl font-bold">98%</p>
              <p class="text-blue-100">Satisfaction Rate</p>
            </div>
          </div> -->
        </div>

        <!-- Hero Image/Illustration -->
        <div class="hidden md:block">
          <div class="relative">
            <div
              class="absolute inset-0 bg-blue-400 rounded-lg transform rotate-3 opacity-20"
            ></div>
            <div class="relative bg-white rounded-lg shadow-2xl p-8 transform -rotate-2">
              <div class="space-y-4">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-32 bg-blue-100 rounded"></div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="h-20 bg-gray-100 rounded"></div>
                  <div class="h-20 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Elements -->
    <div
      class="absolute z-0 w-140 h-140 -top-32 -left-48 bg-[#4F39F6]/20 rounded-full blur-[100px]"
    ></div>
    <div
      class="absolute z-0 w-140 h-140 -bottom-28 -right-36 bg-[#4F39F6]/20 rounded-full blur-[100px] overflow-clip"
    ></div>
  </section>
</template>
