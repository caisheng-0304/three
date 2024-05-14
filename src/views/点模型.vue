<template></template>

<script setup>
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const width = window.innerWidth; //窗口宽度
const height = window.innerHeight; //窗口高度
const scene = new THREE.Scene(); //创建场景
const geometry = new THREE.BufferGeometry(); //创建一个空的几何体顶对象
const vertices = new Float32Array([
  0, 0, 0, 50, 0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 10, 50, 0, 10,
]); //类型化数组定义的一组顶点坐标数据
const attribute = new THREE.BufferAttribute(vertices, 3);
geometry.attributes.position = attribute;
const material = new THREE.PointsMaterial({
  color: 0xffff00,
  size: 10,
}); //点材质
const points = new THREE.Points(geometry, material); //点模型
scene.add(points); //插入点模型到场景中
const axisHelper = new THREE.AxesHelper(250); //创建坐标轴
scene.add(axisHelper); //插入坐标轴到场景中
/**
 *  相机设置
 */
const k = width / height; //窗口宽高比
const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
camera.position.set(200, 300, 200); //设置相机位置
camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
const renderer = new THREE.WebGLRenderer(); //创建渲染器
renderer.setSize(width, height); //设置渲染区域尺寸
renderer.setClearColor(0x000000, 1); //设置背景颜色
document.body.appendChild(renderer.domElement); //body元素中插入canvas
new OrbitControls(camera, renderer.domElement); //创建控制器
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

console.log(renderer.domElement);
</script>

<style scoped></style>
