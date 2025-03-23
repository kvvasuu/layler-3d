<template>
  <div
    class="flex flex-col items-center w-1/5 h-full border-l-2 gap-4 border-blush bg-salmon py-2 px-1"
  >
    <p class="text-2xl font-semibold">Settings</p>
    <p class="text-2xl font-semibold">{{ store.palletNumber }}</p>
    <button
      class="text-2xl font-semibold bg-blush px-6 py-3 rounded-full cursor-pointer"
      @click="addPallet"
    >
      Add pallet
    </button>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore";

const store = useMainStore();

const addPallet = () => {
  store.palletNumber++;
  store.updatePalletQuantity();
  console.log(store.pallets);
};
</script>
