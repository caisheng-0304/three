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
renderer.shadowMap.enabled = true; //渲染器开启阴影效果
renderer.setClearColor(new THREE.Color(0xeeeeee));
renderer.setSize(window.innerWidth, window.innerHeight);

//光源
let spotLight = new THREE.SpotLight(0xffffff); //聚光灯
spotLight.position.set(-40, 50, 30);
spotLight.castShadow = true; //光源开启阴影效果
scene.add(spotLight);

//地面
let planeGeometry = new THREE.PlaneGeometry(60, 20);
let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = (-90 * Math.PI) / 180;
plane.receiveShadow = true; //地面接收阴影
scene.add(plane);

//立方体
let cubeGeometry = new THREE.BoxGeometry(6, 6, 6);
let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff00000 });
let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(-6, 6, 3);
cube.castShadow = true; //立方体开启阴影效果
scene.add(cube);

//相机位置
camera.position.set(-10, 60, 60); //相机位置
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
