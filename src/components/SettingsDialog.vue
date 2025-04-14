<template>
  <div
    class="flex flex-col items-center justify-end w-64 absolute z-20 rounded-2xl border-2 gap-4 border-blush bg-salmon p-4"
    ref="settingsDialog"
    @mousedown.stop
    v-if="mainStore.selectedPallet"
  >
    <h2 class="font-bold text-lg">
      {{ mainStore.selectedPallet?.name.replace("_", " ").toUpperCase() }}
    </h2>
    <div class="font-semibold">
      <p>Width: {{ mainStore.selectedPallet?.width }}</p>
      <input
        type="range"
        step="0.1"
        min="0.4"
        max="2.5"
        :value="mainStore.selectedPallet.width"
        @input="(event) => updateDimension(event, 'width')"
      />
      <p>Length: {{ mainStore.selectedPallet?.length }}</p>
      <input
        type="range"
        step="0.1"
        min="0.4"
        max="2.5"
        :value="mainStore.selectedPallet.length"
        @input="(event) => updateDimension(event, 'length')"
      />
      <p>Height: {{ mainStore.selectedPallet?.height }}</p>
      <input
        type="range"
        step="0.1"
        min="0.4"
        max="2.5"
        :value="mainStore.selectedPallet.height"
        @input="(event) => updateDimension(event, 'height')"
      />
    </div>
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

const updateDimension = (event: Event, type: "height" | "length" | "width") => {
  const input = event.target as HTMLInputElement;

  if (input && mainStore.selectedPallet) {
    const value = Number(input.value);

    switch (type) {
      case "height":
        mainStore.selectedPallet.height = value;
        break;
      case "width":
        mainStore.selectedPallet.width = value;
        break;
      case "length":
        mainStore.selectedPallet.length = value;
        break;
    }
    mainStore.createPalletObjects();
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
