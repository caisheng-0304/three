<template>
  <div ref="threeRef"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import img from "@/assets/wall.jpg";
import checker from "@/assets/checker.png";
import * as THREE from "three";
// 导入轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
const threeRef = ref();
//创建场景
const scene = new THREE.Scene();
// scene.background = new THREE.Color("white");
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
renderer.setClearColor(new THREE.Color(0xeeeeee));
renderer.setSize(window.innerWidth, window.innerHeight);

//创建两个网络模型mesh1、mesh2
const geometry = new THREE.BoxGeometry(20, 20, 20);
const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
const group = new THREE.Group(); //创建一个组
const mesh1 = new THREE.Mesh(geometry, material);
const mesh2 = new THREE.Mesh(geometry, material);
mesh2.translateX(25);
//把mesh1型插入到组group中，mesh1作为group的子对象
group.add(mesh1, mesh2);
group.remove(mesh1, mesh2);
//沿着y轴平移mesh1和mesh2的父对象，mesh1和mesh2跟着平移
// group.translateY(100);
// group.scale.set(4, 4, 4);
// group.rotateY(Math.PI / 6);
scene.add(group);
console.log("子对象", scene);

//相机位置
camera.position.set(0, 10, 80); //相机位置
camera.lookAt(0, 0, 0); //相机看向哪个目标

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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
