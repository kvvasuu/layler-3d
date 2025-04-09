<template>
  <main class="flex items-center justify-end w-full h-full relative">
    <Suspense>
      <ThreeCanvas />
      <template #fallback>
        <div
          class="w-full h-full flex items-center justify-center bg-neutral-900"
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
</script>
