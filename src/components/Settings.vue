<template>
  <div
    class="flex flex-col items-center w-1/5 h-full border-l-2 gap-4 border-blush bg-salmon py-2 px-4"
  >
    <p class="text-2xl font-semibold">Settings</p>
    <div class="w-full flex gap-4 justify-center">
      <p class="text-2xl font-semibold">Pallets:</p>
      <p class="text-2xl font-semibold w-8">{{ store.palletNumber }}</p>
      <input
        type="range"
        @change="changePalletQuantity"
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
          value=""
          class="sr-only peer"
          @change="store.toggleWireframe"
        />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
        ></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
          >Wireframe</span
        >
      </label>
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          class="sr-only peer"
          checked
          @change="store.toggleVisible"
        />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
        ></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
          >Visible</span
        >
      </label>
    </div>

    <!--     <button
      class="text-2xl font-semibold bg-blush px-6 py-3 rounded-full cursor-pointer"
    >
      Add pallet
    </button> -->
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore";

const store = useMainStore();

const changePalletQuantity = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target) {
    store.palletNumber = Number(target.value);
    store.updatePalletQuantity();
  }
};
</script>
