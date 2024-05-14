<template>
  <div ref="threeRef"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import img from "@/assets/wall.jpg";
import * as THREE from "three";
// 导入轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const threeRef = ref();
//创建场景
const scene = new THREE.Scene();

const fov = 45;
const aspect = window.innerWidth / window.innerHeight; // canvas 的默认宽高 300:150
const near = 0.1;
const far = 100;
// 创建相机
const camera = new THREE.PerspectiveCamera(
  fov, //视角
  aspect, //宽高比
  near, //近平面
  far //远平面
);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const loadManager = new THREE.LoadingManager();

const loader = new THREE.TextureLoader(loadManager); //创建一个加载类
loader.load(img, (e) => {
  //创建几何体
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    // color: 0x00f0ff
    map: e,
  });
});

loadManager.onProgress = (img, e, itemsTotal) => {
  console.log("加载器", img, e, itemsTotal);
};

//相机位置
camera.position.z = 0;
camera.position.y = 10;
camera.position.x = 20;
camera.lookAt(0, 0, 0);

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//添加光源
const light = new THREE.PointLight(0xff0000, 1, 100);
light.position.set(50, 50, 50);
scene.add(light);

//轨道控制器
const controls = new OrbitControls(camera, document.body);
// controls.autoRotate = true; //自动旋转
controls.autoRotateSpeed = 10.0;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

//渲染函数动画
function animate() {
  // controls.update();
  //旋转
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

//监听浏览器画布大小
const listerCanvas = () => {
  window.addEventListener("resize", (e) => {
    // console.log(e, window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
  threeRef.value.appendChild(renderer.domElement);
};
onMounted(() => {
  listerCanvas();
});
</script>

<style scoped></style>
