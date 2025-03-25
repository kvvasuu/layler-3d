import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { Pallet, arrangePallets } from "@/utils";

export const useMainStore = defineStore("mainStore", () => {
  const trailerWidth = ref(2.5);
  const trailerLength = ref(13.6);
  const palletNumber = ref(1);
  const palletWidth = ref(0.8);
  const palletLength = ref(1.2);
  const palletHeight = ref(0.6);
  const pallets = ref<Pallet[]>([new Pallet()]);

  const updatePalletQuantity = () => {
    let palletsToArrange: Pallet[] = [];

    if (palletNumber.value === pallets.value.length) {
      palletsToArrange = [...pallets.value];
    } else if (palletNumber.value < pallets.value.length) {
      palletsToArrange = [...pallets.value].splice(0, palletNumber.value);
    } else {
      const palletsToAdd = Array.from(
        { length: palletNumber.value - pallets.value.length },
        () => {
          return new Pallet(
            palletWidth.value,
            palletLength.value,
            palletHeight.value
          );
        }
      );

      palletsToArrange = [...[...pallets.value], ...palletsToAdd];
    }
    pallets.value = arrangePallets(
      trailerWidth.value,
      trailerLength.value,
      palletsToArrange
    );
  };

  const changePalletWidth = (width: number) => {
    palletWidth.value = width;
    pallets.value.forEach((pallet) => (pallet.width = width));
  };
  const changePalletLength = (length: number) => {
    palletLength.value = length;
    pallets.value.forEach((pallet) => (pallet.length = length));
  };
  const changePalletHeight = (height: number) => {
    palletHeight.value = height;
    pallets.value.forEach((pallet) => (pallet.height = height));
  };
  const toggleWireframe = () => {
    pallets.value.forEach((pallet) => pallet.toggleWireframe());
  };
  const toggleVisible = () => {
    pallets.value.forEach((pallet) => pallet.toggleVisible());
  };

  return {
    trailerLength,
    trailerWidth,
    palletHeight,
    palletLength,
    palletWidth,
    palletNumber,
    pallets,
    updatePalletQuantity,
    changePalletWidth,
    changePalletLength,
    changePalletHeight,
    toggleWireframe,
    toggleVisible,
  };
});
