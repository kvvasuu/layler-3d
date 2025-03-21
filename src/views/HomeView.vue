<template>
  <main
    class="flex flex-col gap-8 items-center justify-start w-full h-full py-32"
  >
    <h1 class="text-5xl font-bold">Layler</h1>
    <h3 class="text-xl font-semibold w-full max-w-5xl text-center">
      <p class="my-1">
        Your tool for optimal pallet placement on truck trailers. Enter the
        dimensions and quantity of pallets, and our app will automatically plan
        the most efficient layout, saving you time and space.
      </p>

      <p class="my-1">The perfect solution for logistics and transportation!</p>
    </h3>

    <RouterLink
      to="/viewer"
      class="self-center justify-self-center rounded-full text-neutral-700 bg-salmon border-blush hover:bg-salmon/70 hover:-translate-y-0.5 border-2 font-bold text-2xl px-8 py-4 transition-all"
      >Get Started!</RouterLink
    >
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
