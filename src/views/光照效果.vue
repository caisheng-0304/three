<template></template>

<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
// 导入轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//创建场景
const scene = new THREE.Scene();

// const geometry = new THREE.BoxGeometry(100, 100, 100); //创建一个立方体几何对象Geometry

// const geometry = new THREE.SphereGeometry(100, 50, 50); //圆体

// const geometry = new THREE.CylinderGeometry(50, 50, 100, 25); //圆柱体

// const geometry = new THREE.OctahedronGeometry(50); //正八面体

//立方体网络模型
const geometry1 = new THREE.BoxGeometry(100, 100, 100);
const material1 = new THREE.MeshLambertMaterial({
  color: 0x0000ff,
});
const mesh1 = new THREE.Mesh(geometry1, material1);
scene.add(mesh1);

//球体模型
const geometry2 = new THREE.SphereGeometry(60, 40, 40);
const material2 = new THREE.MeshLambertMaterial({
  color: 0xff00ff,
  opacity: 0.5, //材质透明度
  transparent: true,
  wireframe: true, //将几何图形渲染为线框。 默认值为false
});
const mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.translateY(120); //y轴方向平移120
scene.add(mesh2);

//圆柱模型
const geometry3 = new THREE.CylinderGeometry(50, 50, 100, 25);
const material3 = new THREE.MeshPhongMaterial({
  color: 0x0000ff,
  specular: 0xff00ff,
  shininess: 12,
}); //高光反射
const mesh3 = new THREE.Mesh(geometry3, material3);
mesh3.position.set(120, 0, 0);
scene.add(mesh3);

const geometry = new THREE.DodecahedronGeometry(50); //正12面体

const material = new THREE.MeshLambertMaterial({
  color: 0x0000ff,
}); //材质对象Material

const axisHelper = new THREE.AxesHelper(250);
scene.add(axisHelper);

const mesh = new THREE.Mesh(geometry, material); //网络模型对象mesh

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
