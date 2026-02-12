<script setup lang="ts">
defineOptions({
  name: 'Hero',
})
</script>

<template>
  <section class="relative bg-linear-to-r from-blue-600 to-indigo-700 text-white pt-32 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Hero Content -->
        <div class="space-y-6">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Connect with Top Freelancers Worldwide
          </h1>
          <p class="text-lg md:text-xl text-blue-100">
            FreelabsHub is your gateway to finding talented professionals and exciting projects.
            Whether you're a freelancer or a client, we've got you covered.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/sign-up"
              class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Get Started Free
            </a>
            <a
              href="#how-it-works"
              class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
            >
              Learn More
            </a>
          </div>
          <div class="flex items-center gap-8 pt-4">
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
          </div>
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

    <!-- Wave separator -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
          fill="white"
        />
      </svg>
    </div>
  </section>
</template>
