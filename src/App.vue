<template></template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
// 导入轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  45, //视角
  window.innerWidth / window.innerHeight, //宽高比
  0.1, //近平面
  1000 //远平面
);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);

//创建材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const parentCubeAterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

//创建网格
const parentCube = new THREE.Mesh(geometry, parentCubeAterial); //父元素
const cube = new THREE.Mesh(geometry, material);
parentCube.add(cube);
parentCube.position.set(2, 2, 0); //修改坐标位置
cube.position.set(-2, -5, 0);
//将网格添加到场景中
scene.add(parentCube);

//放大父元素
parentCube.scale.set(2, 2, 2);

// 旋转
cube.rotation.x = Math.PI / 2;

//相机位置
camera.position.z = 5;
camera.position.y = 0;
camera.position.x = 1;
camera.lookAt(0, 0, 0);

//添加坐标轴
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//轨道控制器
const controls = new OrbitControls(camera, document.body);
// controls.autoRotate = true;
controls.autoRotateSpeed = 10.0;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
//渲染函数动画
function animate() {
  controls.update();

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
    console.log(e, window.innerWidth, window.innerHeight);
  });
};
onMounted(() => {
  listerCanvas();
});
</script>

<style scoped></style>
