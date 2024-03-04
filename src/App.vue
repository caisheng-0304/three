<template>
  <model-viewer 
    src="/1.gltf"
    id="view"
    skybox-image=""
    ios-src="https://modelviewer.dev/shared-assets/models/Astronaut.usdz"
    alt="A 3D model of an astronaut"
    ar
    xr-environment
    auto-rotate
    camera-controls
    class="modelViewer"
  ></model-viewer>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import "@google/model-viewer";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


</script>
<style>
.modelViewer {
  width: 100vw;
  height: 100vh;
}
</style>
