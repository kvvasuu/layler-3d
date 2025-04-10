import { ref, shallowRef, reactive, shallowReactive } from "vue";
import { defineStore } from "pinia";
import { Pallet, arrangePallets, loadModels } from "@/utils";
import {
  Scene,
  Group,
  Mesh,
  MeshStandardMaterial,
  Color,
  Texture,
  Shape,
  ExtrudeGeometry,
  TextureLoader,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

const colors = [
  "#fa5f5f",
  "#fac15f",
  "#edfa5f",
  "#88fa5f",
  "#5ffacc",
  "#5fd1fa",
  "#5f81fa",
  "#b75ffa",
  "#fa5feb",
  "#fa5f8d",
];

export const useMainStore = defineStore("mainStore", () => {
  const trailerWidth = ref(2.5);
  const trailerLength = ref(13.6);
  const palletNumber = ref(1);
  const palletWidth = ref(0.8);
  const palletLength = ref(1.2);
  const palletHeight = ref(0.6);
  const pallets = shallowRef<Pallet[]>([new Pallet()]);
  const isVisible = ref(true);
  const isWireframe = ref(false);

  const scene = shallowRef<Scene | null>(null);
  const allPallets = shallowRef<Group>(new Group());
  const stats = shallowRef<Stats>(new Stats());

  const selectedPallet = ref<Pallet>();

  const dialogPosition = reactive({ top: 0, left: 0 });
  const isDialogShown = ref(false);

  const setScene = (newScene: Scene) => {
    scene.value = newScene;
  };

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
    isWireframe.value = !isWireframe.value;
    pallets.value.forEach((pallet) => pallet.toggleWireframe());
  };
  const toggleVisible = () => {
    isVisible.value = !isVisible.value;
    pallets.value.forEach((pallet) => pallet.toggleVisible());
  };

  let palletModel: Mesh;

  const loadModel = async () => {
    palletModel = await loadModels();
  };

  const textureLoader = new TextureLoader();
  let cardBoardNormalMap: Texture;
  let cardBoardTexture: Texture;
  let woodNormalMap: Texture;
  let woodTexture: Texture;

  const loadTextures = async () => {
    cardBoardNormalMap = await textureLoader.loadAsync(
      "paper_0025_normal_opengl_1k.png"
    );
    cardBoardNormalMap.wrapS = RepeatWrapping;
    cardBoardNormalMap.wrapT = RepeatWrapping;

    cardBoardTexture = await textureLoader.loadAsync(
      "/paper_0025_color_1k.jpg"
    );
    cardBoardTexture.wrapS = RepeatWrapping;
    cardBoardTexture.wrapT = RepeatWrapping;
    cardBoardTexture.colorSpace = SRGBColorSpace;

    woodNormalMap = await textureLoader.loadAsync("/wood_normal.jpg");
    woodNormalMap.wrapS = RepeatWrapping;
    woodNormalMap.wrapT = RepeatWrapping;

    woodTexture = await textureLoader.loadAsync("/wood.jpg");
    woodTexture.wrapS = RepeatWrapping;
    woodTexture.wrapT = RepeatWrapping;
    woodTexture.colorSpace = SRGBColorSpace;
  };

  const createPalletObjects = async () => {
    if (allPallets.value) {
      allPallets.value.remove(...allPallets.value.children);
    }

    updatePalletQuantity();

    pallets.value.forEach((pallet, index) => {
      if (palletModel) {
        palletModel.scale.x = pallet.width / 0.8 - 0.02;
        palletModel.scale.z = pallet.length / 1.2 - 0.02;

        palletModel.position.set(
          pallet.position.x,
          pallet.position.y + 0.046,
          pallet.position.z
        );
        palletModel.material = new MeshStandardMaterial({
          color: "#ffce85",
          map: woodTexture,
          normalMap: woodNormalMap,
        });
        palletModel.castShadow = true;
        palletModel.receiveShadow = true;

        const isColorWhite =
          (pallet.material as MeshStandardMaterial).color.b ===
            new Color(1, 1, 1).b &&
          (pallet.material as MeshStandardMaterial).color.g ===
            new Color(1, 1, 1).g &&
          (pallet.material as MeshStandardMaterial).color.r ===
            new Color(1, 1, 1).r;

        const material = new MeshStandardMaterial({
          color: !isColorWhite
            ? (pallet.material as MeshStandardMaterial).color
            : colors[index % colors.length],
          roughness: 0.7,
          normalMap: cardBoardNormalMap,
          map: cardBoardTexture,
          wireframe: isWireframe.value,
        });

        const frame = new Shape();
        frame.moveTo(0, 0);
        frame.lineTo(pallet.width - 0.06, 0);
        frame.lineTo(pallet.width - 0.06, pallet.height);
        frame.lineTo(0, pallet.height);

        const extrudeSettings = {
          steps: 1,
          depth: pallet.length - 0.12,
          bevelEnabled: true,
          bevelSegments: 1,
          bevelThickness: 0.04,
          bevelSize: 0.02,
        };

        const geom = new ExtrudeGeometry(frame, extrudeSettings);

        pallet.color = new Color(colors[index % colors.length]);
        pallet.geometry = geom;
        pallet.position.set(
          pallet.position.x - pallet.width / 2 + 0.03,
          pallet.position.y + 0.124,
          pallet.position.z - pallet.length / 2 + 0.06
        );

        pallet.name = `pallet_${index + 1}`;

        pallet.castShadow = !(pallet.material as MeshStandardMaterial)
          .wireframe;
        pallet.receiveShadow = !(pallet.material as MeshStandardMaterial)
          .wireframe;
        pallet.material = material;
        pallet.visible = isVisible.value;

        const wholePallet = new Group();
        wholePallet.add(palletModel.clone());
        wholePallet.add(pallet);
        if (allPallets.value) {
          allPallets.value.add(wholePallet);
          scene.value?.add(allPallets.value);
        }
      }
    });
  };

  return {
    trailerLength,
    trailerWidth,
    palletHeight,
    palletLength,
    palletWidth,
    palletNumber,
    pallets,
    scene,
    allPallets,
    stats,
    selectedPallet,
    dialogPosition,
    isDialogShown,
    updatePalletQuantity,
    toggleVisible,
    toggleWireframe,
    changePalletHeight,
    changePalletLength,
    changePalletWidth,
    setScene,
    createPalletObjects,
    loadModel,
    loadTextures,
  };
});
