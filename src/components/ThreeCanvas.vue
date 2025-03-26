<template>
  <div class="w-4/5 h-full bg-neutral-900">
    <canvas ref="threeCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useMainStore } from "@/stores/mainStore";
import type { Pallet } from "@/utils";

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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

const directionalLight = new DirectionalLight(0xffffff, 4);
directionalLight.position.z = -2;
directionalLight.position.x = -2;

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
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

  controls.update();
}

onMounted(async () => {
  if (threeCanvas.value) {
    const canvasParent = threeCanvas.value.parentElement;
    if (canvasParent) {
      threeCanvas.value.width = canvasParent.clientWidth;
      threeCanvas.value.height = canvasParent.clientHeight;
      camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
      camera.updateProjectionMatrix();
    }

    await mainStore.loadModel();

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

    await mainStore.createPalletObjects();

    window.addEventListener("resize", () => {
      if (canvasParent) {
        camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);
      }
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
        const selectedObject = intersections[0].object as Pallet;

        mainStore.pallets.forEach((p) => (p.clicked = false));

        if (selectedObject instanceof Mesh) {
          if (
            selectedObject.name.includes("pallet") &&
            selectedObject.visible
          ) {
            const existingDialog = document.getElementById("custom-dialog");
            if (existingDialog) {
              existingDialog.remove();
            }

            selectedObject.clicked = true;

            const dialog = document.createElement("div");
            dialog.id = "custom-dialog";
            dialog.innerHTML = `
            <p class="pallet-name"><strong>${selectedObject.name
              .replace("_", " ")
              .toUpperCase()}</strong></p>
            <p><strong>Width: </strong>${
              Math.round(selectedObject.width * 10) / 10
            }</p>
            <p><strong>Length: </strong>${
              Math.round(selectedObject.length * 10) / 10
            }</p>

        `;
            dialog.classList.add("pallet-dialog");
            dialog.style.position = "absolute";
            dialog.style.left = `${event.clientX}px`;
            dialog.style.top = `${event.clientY}px`;

            const widthSlider = document.createElement("input");
            widthSlider.type = "range";
            widthSlider.max = String(mainStore.trailerWidth);
            widthSlider.min = "0.4";
            widthSlider.step = "0.1";
            widthSlider.value = String((selectedObject as Pallet).width);
            widthSlider.addEventListener("input", () => {
              (selectedObject as Pallet).width = Number(widthSlider.value);
              mainStore.createPalletObjects();
            });
            dialog.appendChild(widthSlider);

            const lengthSlider = document.createElement("input");
            lengthSlider.type = "range";
            lengthSlider.max = String(mainStore.trailerWidth);
            lengthSlider.min = "0.4";
            lengthSlider.step = "0.1";
            lengthSlider.value = String((selectedObject as Pallet).length);
            lengthSlider.addEventListener("input", () => {
              (selectedObject as Pallet).length = Number(lengthSlider.value);
              mainStore.createPalletObjects();
            });
            dialog.appendChild(lengthSlider);

            const colorInput = document.createElement("input");
            const color = "#" + selectedObject.color.getHexString();
            colorInput.type = "color";
            colorInput.value = color;

            colorInput.addEventListener("input", () => {
              (selectedObject.material as MeshStandardMaterial).color =
                new Color(colorInput.value);
              selectedObject.color = new Color(colorInput.value);
            });
            dialog.appendChild(colorInput);
            document.body.appendChild(dialog);

            const closeDialog = (e: MouseEvent) => {
              if (!dialog.contains(e.target as Node)) {
                dialog.remove();
                selectedObject.clicked = false;
                document.removeEventListener("click", closeDialog);
              }
            };

            setTimeout(() => {
              document.addEventListener("click", closeDialog);
            }, 100);
          }
        }
      }
    });

    camera.position.set(-5, 5, 6.8);
    camera.lookAt(floor.position);

    animate();
  }
});
</script>
