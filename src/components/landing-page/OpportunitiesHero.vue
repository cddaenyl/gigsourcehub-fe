<script setup lang="ts">
defineOptions({
    name: 'OpportunitiesHero',
})
</script>

<template>
    <section
        class="relative bg-linear-to-b from-[#0B1121] to-[#020617] py-16 sm:py-24 md:py-32 text-white flex flex-col items-center justify-center overflow-hidden">
        <div class="z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

            <div
                class="px-4 py-1.5 sm:py-2 mb-4 sm:mb-5 bg-white/5 rounded-full border border-white/10 inline-flex justify-center items-center gap-2 shadow-sm">
                <span class="text-[#CAD5E2] text-xs sm:text-sm font-medium">Open for new talents</span>
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight sm:leading-tight md:leading-tight font-bold text-white mb-4 sm:mb-6">
                Opportunities <span class="bg-linear-to-l from-[#C27AFF] via-[#7C86FF] to-[#51A2FF] bg-clip-text text-transparent">for YOU</span>
            </h2>

            <p class="text-sm sm:text-base md:text-lg text-[#CAD5E2] max-w-sm sm:max-w-lg md:max-w-2xl mx-auto font-medium px-2 sm:px-0 mt-2 sm:mt-0">
                Browse open roles we're currently hiring for across various projects and teams.
            </p>

        </div>

        <!-- Background Elements -->
        <div
            class="absolute z-0 w-[500px] h-[500px] -top-32 -left-48 bg-[#4F39F6]/10 rounded-full blur-[100px] pointer-events-none">
        </div>
        <div
            class="absolute z-0 w-[500px] h-[500px] -bottom-28 -right-36 bg-[#4F39F6]/10 rounded-full blur-[100px] pointer-events-none">
        </div>
    </section>
</template>
