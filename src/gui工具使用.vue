<template></template>

<script setup>
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
const gui = new GUI();
const obj = {
  x: 30,
  y: 30,
  z: 30,
  color: 0x000fff,
  scale: 0,
  bool: true,
};
gui.add(obj, "x", 0, 100).name("环境光强度").step(0.1);
gui.add(obj, "y", 0, 100);
gui.add(obj, "z", 0, 1000);
gui.addColor(obj, "color").onChange((color) => {
  console.log("color", color);
});
gui.add(obj, "scale", [-100, 0]);
gui.add(obj, "bool");
const mat = gui.addFolder("子菜单");
mat.add(obj, "x", 200);
</script>

<style scoped></style>
