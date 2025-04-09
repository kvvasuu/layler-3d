<template>
  <div class="w-full h-full bg-neutral-900">
    <canvas ref="threeCanvas"></canvas>
    <SettingsDialog
      v-if="mainStore.isDialogShown"
      :style="{
        left: mainStore.dialogPosition.left + 'px',
        top: mainStore.dialogPosition.top + 'px',
      }"
    ></SettingsDialog>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useMainStore } from "@/stores/mainStore";
import type { Pallet } from "@/utils";
import SettingsDialog from "./SettingsDialog.vue";

import {
  Scene,
  DataTexture,
  EquirectangularReflectionMapping,
  Euler,
  GridHelper,
  PerspectiveCamera,
  WebGLRenderer,
  VSMShadowMap,
  Mesh,
  MeshStandardMaterial,
  MathUtils,
  Color,
  Raycaster,
  Vector2,
  DirectionalLight,
  Clock,
  TextureLoader,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
  ExtrudeGeometry,
  Vector3,
  AxesHelper,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

const mainStore = useMainStore();

const scene = new Scene();

mainStore.setScene(scene);

let environmentTexture: DataTexture;

new RGBELoader().load("/zwartkops_pit_1k.hdr", (texture) => {
  environmentTexture = texture;
  environmentTexture.mapping = EquirectangularReflectionMapping;
  scene.environment = environmentTexture;
  scene.background = environmentTexture;
  scene.environmentRotation = new Euler(0, 160, 0);
  scene.backgroundRotation = new Euler(0, 160, 0);
  scene.backgroundBlurriness = 0.06;
  scene.environmentIntensity = 0.2;
});

const grid = new GridHelper(30, 30);
grid.position.z = 6.8;
grid.position.y = -0.21;
scene.add(grid);

const textureLoader = new TextureLoader();
const woodNormalMap = await textureLoader.loadAsync("/wood_normal.jpg");
woodNormalMap.rotation = MathUtils.degToRad(90);
woodNormalMap.wrapS = RepeatWrapping;
woodNormalMap.wrapT = RepeatWrapping;

const woodTexture = await textureLoader.loadAsync("/wood.jpg");
woodTexture.rotation = MathUtils.degToRad(90);
woodTexture.wrapS = RepeatWrapping;
woodTexture.wrapT = RepeatWrapping;
woodTexture.colorSpace = SRGBColorSpace;

const frame = new Shape();
frame.moveTo(0, 0);
frame.lineTo(mainStore.trailerLength, 0);
frame.lineTo(mainStore.trailerLength, mainStore.trailerWidth);
frame.lineTo(0, mainStore.trailerWidth);

const extrudeSettings = {
  steps: 1,
  depth: 0.2,
  bevelEnabled: false,
};

const floor = new Mesh(
  new ExtrudeGeometry(frame, extrudeSettings),
  new MeshStandardMaterial({
    roughness: 0.6,
    normalMap: woodNormalMap,
    map: woodTexture,
  })
);

floor.name = "floor";
floor.rotation.x = MathUtils.degToRad(-90);
floor.rotation.z = MathUtils.degToRad(-90);
floor.position.y = -0.2;
floor.receiveShadow = true;
scene.add(floor);

let renderer: WebGLRenderer;
let controls: OrbitControls;
let gizmo: ViewportGizmo;

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const directionalLight = new DirectionalLight(0xffffff, 5);
directionalLight.position.z = -1;
directionalLight.position.x = -1;
directionalLight.position.y = 1;

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.bias = 0.001;
directionalLight.shadow.radius = 15;
scene.add(directionalLight);

const raycaster = new Raycaster();

const threeCanvas = useTemplateRef("threeCanvas");

const clock = new Clock();
let delta = 0;

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  mainStore.pallets.forEach((p) => {
    p.update(delta);
  });

  if (mainStore.scene) {
    renderer.render(mainStore.scene, camera);
  }

  mainStore.stats.update();

  controls.update();
  gizmo.render();
}

await mainStore.loadModel();
await mainStore.loadTextures();
await mainStore.createPalletObjects();

const resizeRenderer = () => {
  const canvasParent = threeCanvas.value?.parentElement;
  if (canvasParent && renderer) {
    camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);
  }
};

onMounted(async () => {
  if (threeCanvas.value) {
    const canvasParent = threeCanvas.value.parentElement;
    if (canvasParent) {
      threeCanvas.value.width = canvasParent.clientWidth;
      threeCanvas.value.height = canvasParent.clientHeight;
      camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer = new WebGLRenderer({
      canvas: threeCanvas.value,
      antialias: true,
    });
    renderer.setSize(threeCanvas.value.width, threeCanvas.value.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;
    renderer.outputColorSpace = SRGBColorSpace;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.copy(floor.position);
    controls.update();

    gizmo = new ViewportGizmo(camera, renderer);
    gizmo.set({ placement: "bottom-right" });

    gizmo.attachControls(controls);
    gizmo.update();

    window.addEventListener("resize", () => {
      resizeRenderer();
      gizmo.update();
    });

    canvasParent?.addEventListener("mousemove", (event: MouseEvent) => {
      const coords = new Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
      );

      raycaster.setFromCamera(coords, camera);

      const intersections = raycaster.intersectObjects(mainStore.pallets, true);

      mainStore.pallets.forEach((p) => (p.hovered = false));

      intersections.length &&
        ((intersections[0].object as Pallet).hovered = true);
    });

    canvasParent?.addEventListener("mousedown", (event: MouseEvent) => {
      const coords = new Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
      );

      raycaster.setFromCamera(coords, camera);

      const intersections = raycaster.intersectObjects(mainStore.pallets, true);
      if (intersections.length > 0) {
        mainStore.selectedPallet = intersections[0].object as Pallet;
        mainStore.pallets.forEach((p) => (p.clicked = false));

        if (mainStore.selectedPallet instanceof Mesh) {
          if (
            mainStore.selectedPallet.name.includes("pallet") &&
            mainStore.selectedPallet.visible
          ) {
            mainStore.isDialogShown = false;

            mainStore.selectedPallet.clicked = true;

            const widthSlider = document.createElement("input");
            widthSlider.type = "range";
            widthSlider.max = String(mainStore.trailerWidth);
            widthSlider.min = "0.4";
            widthSlider.step = "0.1";
            widthSlider.value = String(
              (mainStore.selectedPallet as Pallet).width
            );
            widthSlider.addEventListener("input", () => {
              (mainStore.selectedPallet as Pallet).width = Number(
                widthSlider.value
              );
              mainStore.createPalletObjects();
            });

            const lengthSlider = document.createElement("input");
            lengthSlider.type = "range";
            lengthSlider.max = String(mainStore.trailerWidth);
            lengthSlider.min = "0.4";
            lengthSlider.step = "0.1";
            lengthSlider.value = String(
              (mainStore.selectedPallet as Pallet).length
            );
            lengthSlider.addEventListener("input", () => {
              (mainStore.selectedPallet as Pallet).length = Number(
                lengthSlider.value
              );
              mainStore.createPalletObjects();
            });

            const colorInput = document.createElement("input");
            const color = "#" + mainStore.selectedPallet.color.getHexString();
            colorInput.type = "color";
            colorInput.value = color;

            colorInput.addEventListener("input", () => {
              if (mainStore.selectedPallet) {
                (
                  mainStore.selectedPallet.material as MeshStandardMaterial
                ).color = new Color(colorInput.value);
                mainStore.selectedPallet.color = new Color(colorInput.value);
              }
            });

            mainStore.dialogPosition.left = event.clientX;
            mainStore.dialogPosition.top = event.clientY;
            mainStore.isDialogShown = true;
          }
        }
      }
    });

    camera.position.set(-7, 5, 10);

    const axesHelper = new AxesHelper(1);
    axesHelper.setColors(
      new Color("#ff0000"),
      new Color("#00ff00"),
      new Color("#0000ff")
    );
    axesHelper.position.set(
      mainStore.trailerWidth / 2,
      0.06,
      mainStore.trailerLength / 2
    );
    // scene.add(axesHelper);

    controls.target.set(
      mainStore.trailerWidth / 2,
      floor.position.y,
      mainStore.trailerLength / 2
    );

    animate();
  }
});
</script>
