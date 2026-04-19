<template>
  <div
    class="hidden flex-col gap-16 items-center justify-center h-full w-1/2 mx-auto rounded-md bg-linear-to-b from-[#0823A0] to-[#081863] xl:flex overflow-hidden"
  >
    <div
      class="float-card-1 w-92 h-56 relative origin-top-left left-24 rotate-[-9.61deg] bg-white/10 rounded-[20px] outline-2 outline-white/20 overflow-x-clip"
    >
      <div class="w-60 h-36 left-[33.52px] top-[28.82px] absolute">
        <div
          class="w-14 h-14 top-0 absolute bg-linear-to-br from-[#C27AFF] to-[#8B5CF6] rounded-[10px]"
        ></div>
        <div class="w-32 h-20 left-13 absolute">
          <div class="w-38 h-9 left-3 absolute bg-white/30 rounded"></div>
          <div class="w-24 h-4 left-3 top-11 absolute bg-white/20 rounded"></div>
        </div>
      </div>
      <div class="w-64 h-10 left-8 top-26 absolute bg-white/20 rounded-[3px]"></div>
      <div class="w-44 h-8 left-8 top-38 absolute bg-white/20 rounded-[3px]"></div>
    </div>
    <div
      class="float-card-2 w-92 h-56 relative origin-top-left right-24 rotate-[9.61deg] bg-white/10 rounded-[20px] outline-2 outline-white/20 overflow-x-clip"
    >
      <div class="w-60 h-36 left-[33.52px] top-[28.82px] absolute">
        <div
          class="w-14 h-14 top-0 absolute bg-linear-to-br from-emerald-500 to-green-600 rounded-[10px]"
        ></div>
        <div class="w-32 h-20 left-13 absolute">
          <div class="w-38 h-9 left-3 absolute bg-white/30 rounded"></div>
          <div class="w-24 h-4 left-3 top-11 absolute bg-white/20 rounded"></div>
        </div>
      </div>
      <div class="w-64 h-8 left-8 top-26 absolute bg-white/20 rounded-[3px]"></div>
      <div class="w-52 h-4 left-8 top-36 absolute bg-white/20 rounded-[3px]"></div>
      <div class="w-44 h-4 left-8 top-42 absolute bg-white/20 rounded-[3px]"></div>
    </div>
  </div>
</template>

<style scoped>
.float-card-1 {
  animation: card-float 3.8s ease-in-out infinite;
  will-change: translate;
}

.float-card-2 {
  animation: card-float 4.2s ease-in-out infinite;
  will-change: translate;
}

@keyframes card-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -10px;
  }
}
</style>
