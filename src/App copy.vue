<template>
  <div ref="threeRef" style="width: 500px; height: 500px"></div>
  <button @click="onCanvas">点击</button>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import helvetiker from "@/assets/fonts/helvetiker_bold.typeface.json";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

const threeRef = ref();

const width = 500; //窗口宽度
const height = 500; //窗口高度
const scene = new THREE.Scene(); //创建场景
const renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true,}); //创建渲染器

const boxWidth = 1;
const boxHigeht = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHigeht, boxDepth);

// const material = new THREE.MeshPhongMaterial({color:0x44aa88})

// const cube = new THREE.Mesh(geometry,material)

// scene.add(cube)

makeInstance(geometry, 0x44aa88, 0);
makeInstance(geometry, 0x8844aa, -2);
makeInstance(geometry, 0xaa8844, 2);

const axisHelper = new THREE.AxesHelper(250); //创建坐标轴
scene.add(axisHelper); //插入坐标轴到场景中
/**
 *  相机设置
 */
const fov = 75; //视野范围
const aspect = 2; //画布宽高比
const near = 0.1; //近平面
const far = 5; //远平面

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

{
  const color = 0xffffff;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}

renderer.setSize(width, height); //设置渲染区域尺寸
renderer.setClearColor(0x000000, 1); //设置背景颜色
console.log("renderer.domElement", renderer.domElement, threeRef.value);

const controls = new OrbitControls(camera, renderer.domElement); //创建控制器
console.log("controls", controls);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cube.position.x = x;
  return cube;
}


let renderRequested = false;
function render(e) {
  renderRequested = false;
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  // cube.rotation.x = time;
  renderer.render(scene, camera);
}

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

controls.addEventListener("change", requestRenderIfNotRequested);

window.addEventListener("resize", requestRenderIfNotRequested);

const onCanvas = () => {
  // render();
  const canvas = document.querySelector("canvas");
  console.log("canvas", canvas);
  canvas.toBlob((blob) => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    console.log("blob", blob);
    const fils = new File([blob], "123", { type: "image/png" });
    console.log("fils", fils);
    const url = window.URL.createObjectURL(blob);
    console.log(url);
    a.href = url;
    a.download = "元素";
    a.click();
  });
};

onMounted(() => {
  threeRef.value.appendChild(renderer.domElement); //body元素中插入canvas

  render();
});
</script>

<style scoped></style>
