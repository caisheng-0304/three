<template>
  <div ref="threeRef" style="width: 100%; height: 100vh"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import map from '@/assets/map.jpg'
const threeRef = ref();
let scene, mesh, camera, renderer, clock, stats;
const init = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
  camera = new THREE.PerspectiveCamera(30, width / height, 1, 8000);
  camera.position.set(200, 200, 200);
  // const geometry = new THREE.SphereGeometry(50, 50, 50) //圆形
  const geometry = new THREE.PlaneGeometry(200,100) //长方形

  const uvs = new Float32Array([
    0,0,
    1,0,
    1,1,
    0,1
  ])
  geometry.attributes.uv = new THREE.BufferAttribute(uvs,2)

  const texLoader = new THREE.TextureLoader()
  const texture = texLoader.load(map)
  const material = new THREE.MeshLambertMaterial({
    color:0xffffff,
    map:texture
  })
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.render(scene, camera);
  threeRef.value.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", (e) => {
    renderer.render(scene, camera);
  });
  clock = new THREE.Clock();
};
const setSize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); //更新相机投影矩阵
  renderer.render(scene, camera);
  renderer.setSize(window.innerWidth, window.innerHeight);
};
const onEventListener = () => {
  window.addEventListener("resize", setSize);
};
const render = () => {
  stats.update();
  renderer.render(scene, camera);
  mesh.rotateY(0.01);
  requestAnimationFrame(render);
};

const onStats = () => {
  stats = new Stats();
  document.body.appendChild(stats.domElement);
};
onMounted(() => {
  init();
  onStats();
  // render();
  onEventListener();
});
</script>

<style lang="less" scoped></style>
