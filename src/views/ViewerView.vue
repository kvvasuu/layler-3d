<template>
  <main class="flex items-center justify-end w-full h-full">
    <Suspense>
      <ThreeCanvas />
      <template #fallback>
        <div
          class="w-4/5 h-full flex items-center justify-center bg-neutral-900"
        >
          <p
            class="animate-pulse select-none text-neutral-200 font-semibold text-2xl"
          >
            Loading...
          </p>
        </div>
      </template>
    </Suspense>
    <Settings></Settings>
  </main>
</template>

<script setup lang="ts">
import Settings from "@/components/Settings.vue";
import ThreeCanvas from "@/components/ThreeCanvas.vue";
import { Suspense } from "vue";
</script>
