<template></template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
// 导入轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//创建场景
const scene = new THREE.Scene();

const geometry = new THREE.BufferGeometry(); //声明一个缓冲几何体对象

//类型数组创建顶点位置position数据
const vertices = new Float32Array([
  0,
  0,
  0, //顶点1坐标
  50,
  0,
  0, //顶点2坐标
  0,
  100,
  0, //顶点3坐标
  0,
  0,
  10, //顶点4坐标
  0,
  0,
  100, //顶点5坐标
  50,
  0,
  10, //顶点6坐标
]);
//创建属性缓冲区对象
const attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组,作为一个顶点的xyz坐标
//设置几何体attributes属性的位置positi属性
geometry.attributes.position = attribue;
//类型数组创建顶点颜色color数据
var colors = new Float32Array([
  1,
  0,
  0, //顶点1颜色
  0,
  1,
  0, //顶点2颜色
  0,
  0,
  1, //顶点3颜色

  1,
  1,
  0, //顶点4颜色
  0,
  1,
  1, //顶点5颜色
  1,
  0,
  1, //顶点6颜色
]);
//设置几何体attributes属性的颜色color属性
geometry.attributes.color = new THREE.BufferAttribute(colors, 3);
//材质对象
const material = new THREE.PointsMaterial({
  //使用顶点颜色数据渲染模型，不需要再定义color属性
  vertexColors: THREE.VertexColors, //以顶点颜色为准
  size: 50,
});

const axisHelper = new THREE.AxesHelper(250);
scene.add(axisHelper);

// const mesh = new THREE.Line(geometry, material); //网络模型对象

//点渲染模式，点模型对象points
const points = new THREE.Points(geometry, material); //点模型对象

scene.add(points); //模型添加到场景中

const point = new THREE.PointLight(0xffffff);
point.position.set(400, 200, 300); //点光源位置
scene.add(point); //光源添加到场景中

const ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient); //添加环境光

const height = window.innerHeight; //窗口高度
const width = window.innerWidth; //窗口宽度

const k = width / height; //窗口宽高比
const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
camera.position.set(200, 300, 200); //设置相机位置
camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height); //设置渲染区域尺寸
renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
//执行渲染操作   指定场景、相机作为参数

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
const controls = new OrbitControls(camera, renderer.domElement);
onMounted(() => {
  // listerCanvas();
});
</script>

<style scoped></style>
