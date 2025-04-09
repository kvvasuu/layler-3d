<template>
  <div
    class="flex flex-col items-center justify-end w-64 h-40 absolute z-20 rounded-2xl border-2 gap-4 border-blush bg-salmon p-4"
    ref="settingsDialog"
  >
    <h2>
      {{ mainStore.selectedPallet?.name.replace("_", " ").toUpperCase() }}
    </h2>
    <!-- <input type="range" v-model="mainStore.selectedPallet?.width" />
    <input type="range" v-model="mainStore.selectedPallet?.height" /> -->
    <p>{{ mainStore.selectedPallet?.width }}</p>
    <p>{{ mainStore.selectedPallet?.length }}</p>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/stores/mainStore";
import { onBeforeUnmount, onMounted, ref } from "vue";

const mainStore = useMainStore();

const settingsDialog = ref<HTMLDivElement | null>(null);

const closeDialog = (e: MouseEvent) => {
  if (
    settingsDialog.value &&
    !settingsDialog.value.contains(e.target as Node)
  ) {
    if (mainStore.selectedPallet) {
      mainStore.selectedPallet.clicked = false;
    }
    mainStore.dialogPosition.left = 0;
    mainStore.dialogPosition.top = 0;
    mainStore.isDialogShown = false;
    document.removeEventListener("click", closeDialog);
  }
};

onMounted(() => {
  setTimeout(() => {
    document.addEventListener("click", closeDialog);
  }, 100);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDialog);
});
</script>
