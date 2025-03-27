<template>
  <div class="absolute top-0 right-0 z-10">
    <button
      class="absolute top-4 -left-4 h-8 w-8 rounded-full border-blush border-2 bg-salmon flex items-center justify-center cursor-pointer"
      @click="toggleCollapse"
      :class="!isCollapsed ? '-left-4' : '-left-12 rotate-180'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-chevron-right"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
        />
      </svg>
    </button>

    <div
      class="absolute top-0 left-0"
      v-show="areStatsVisible"
      ref="stats"
    ></div>
    <div
      class="flex flex-col items-center rounded-bl-2xl border-l-2 border-b-2 gap-4 border-blush bg-salmon py-4 px-4"
      v-if="!isCollapsed"
    >
      <p class="text-2xl font-semibold">Settings</p>
      <div class="w-full flex gap-4 justify-center">
        <p class="text-2xl font-semibold">Pallets:</p>
        <p class="text-2xl font-semibold w-8">{{ mainStore.palletNumber }}</p>
        <input
          type="range"
          @input="changePalletQuantity"
          value="1"
          min="1"
          max="100"
          step="1"
        />
      </div>

      <div class="w-full flex flex-col gap-4">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only peer"
            @change="mainStore.toggleWireframe"
          />
          <div
            class="relative w-11 h-6 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
          ></div>
          <span class="ms-3 text-sm font-medium text-gray-900">Wireframe</span>
        </label>
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only peer"
            checked
            @change="mainStore.toggleVisible"
          />
          <div
            class="relative w-11 h-6 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
          ></div>
          <span class="ms-3 text-sm font-medium text-gray-900">Visible</span>
        </label>
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="areStatsVisible"
            class="sr-only peer"
          />
          <div
            class="relative w-11 h-6 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
          ></div>
          <span class="ms-3 text-sm font-medium text-gray-900">Stats</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore";
import { onMounted, ref, useTemplateRef } from "vue";

const mainStore = useMainStore();

const areStatsVisible = ref(false);
const stats = useTemplateRef("stats");

const isCollapsed = ref(false);
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const changePalletQuantity = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    mainStore.palletNumber = Number(target.value);
    mainStore.updatePalletQuantity();
    mainStore.createPalletObjects();
  }
};

onMounted(() => {
  if (stats.value) {
    stats.value.appendChild(mainStore.stats.dom);
  }
});
</script>
