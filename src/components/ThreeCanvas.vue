<template>
  <canvas ref="threeCanvas" id="threeCanvas"></canvas>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useMainStore } from "@/stores/mainStore";

import {
  Scene,
  DataTexture,
  EquirectangularReflectionMapping,
  Euler,
  GridHelper,
  PerspectiveCamera,
  WebGLRenderer,
  PCFSoftShadowMap,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  MathUtils,
  Color,
  Group,
  Raycaster,
  Vector2,
  DirectionalLight,
  Clock,
  TextureLoader,
  Shape,
  ExtrudeGeometry,
  RepeatWrapping,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const mainStore = useMainStore();

const scene = new Scene();

let environmentTexture: DataTexture;

new RGBELoader().load("@/assets/img/zwartkops_pit_1k.hdr", (texture) => {
  environmentTexture = texture;
  environmentTexture.mapping = EquirectangularReflectionMapping;
  scene.environment = environmentTexture;
  scene.background = environmentTexture;
  scene.environmentRotation = new Euler(0, 160, 0);
  scene.backgroundRotation = new Euler(0, 160, 0);
  scene.backgroundBlurriness = 0.06;
  scene.environmentIntensity = 0.2;
});

const cardBoardNormalMap = new TextureLoader().load(
  "@/assets/img/cardboard-normal.png"
);

cardBoardNormalMap.wrapS = RepeatWrapping;
cardBoardNormalMap.wrapT = RepeatWrapping;

const grid = new GridHelper(30, 30);
grid.position.z = 6.8;
grid.position.y = -0.01;
scene.add(grid);

const floor = new Mesh(
  new PlaneGeometry(mainStore.trailerWidth, mainStore.trailerLength),
  new MeshStandardMaterial({ color: "#e3975b", roughness: 0.5 })
);
floor.name = "floor";
floor.rotation.x = MathUtils.degToRad(-90);
floor.position.z = 6.8;
floor.position.x = mainStore.trailerWidth / 2;
floor.receiveShadow = true;
scene.add(floor);

let renderer: WebGLRenderer;
let controls: OrbitControls;

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const threeCanvas = ref<HTMLCanvasElement | null>(null);
if (threeCanvas.value) {
  renderer = new WebGLRenderer({
    canvas: threeCanvas.value,
    antialias: true,
  });
  renderer.setSize(threeCanvas.value.width, threeCanvas.value.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.copy(floor.position);
  controls.update();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("mousedown", () => {
    if (threeCanvas.value) threeCanvas.value.classList.add("grabbing");
  });

  window.addEventListener("mouseup", () => {
    if (threeCanvas.value) threeCanvas.value.classList.remove("grabbing");
  });

  camera.position.set(-5, 5, 6.8);
  camera.lookAt(floor.position);

  const clock = new Clock();
  let delta = 0;

  function animate() {
    requestAnimationFrame(animate);

    delta = clock.getDelta();

    mainStore.pallets.forEach((p) => {
      p.update(delta);
    });

    renderer.render(scene, camera);
    controls.update();
  }

  animate();
}
</script>
