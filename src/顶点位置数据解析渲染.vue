<template></template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
// 导入轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//创建场景
const scene = new THREE.Scene();

const geometry1 = new THREE.BufferGeometry(); //创建一个buffer类型几何体对象
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
const attribue = new THREE.BufferAttribute(vertices, 3);

const geometry = new THREE.DodecahedronGeometry(50); //正12面体
geometry.attributes.position = attribue; //设置几何体attributes属性的位置属性

const colors = new Float32Array([
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

geometry.attributes.color = new THREE.BufferAttribute(colors, 3); //3个为一组，表示一个顶点

//三角面（网络）渲染模式
// const material = new THREE.MeshBasicMaterial({
//   color: 0x0000ff,
//   side:THREE.DoubleSide //两面可见
// });
// const mesh = new THREE.Mesh(geometry, material);

// //点渲染模式
// const material = new THREE.PointsMaterial({
//   color: 0x0000ff,
//   side: 10, //两面可见
// });
//线模型line
const material = new THREE.LineBasicMaterial({
  color: 0xff0000,
});
const axisHelper = new THREE.AxesHelper(250);
scene.add(axisHelper);

const mesh = new THREE.Line(geometry, material); //网络模型对象mesh

scene.add(mesh); //网络模型添加到场景中

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
