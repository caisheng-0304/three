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

const planeSize = 40;
const loader = new THREE.TextureLoader(); //创建加载器
const texture = loader.load(checker); //引入文件
texture.wrapS = THREE.RepeatWrapping; //纹理在水平方向上重复平铺
texture.wrapT = THREE.RepeatWrapping; //纹理在垂直方向上重复平铺
texture.magFilter = THREE.NearestFilter; //最近点采样方法,返回与指定纹理坐标（在曼哈顿距离之内）最接近的纹理像素的值。
texture.colorSpace = THREE.SRGBColorSpace; //一种颜色模式
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats); //用来设置纹理在表面上，分别在u、v方向重复多少次，repeat属性是vector2类型,repeats 用来指定在x轴方向上多久重复一次，repeats用来指定在y轴方向上多久重复一次
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize); //创建几何体
const planeMat = new THREE.MeshStandardMaterial({
  map: texture, //颜色贴图
  side: THREE.DoubleSide, //双面显示
}); //创建网络材质
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -0.5;
scene.add(mesh);

{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshStandardMaterial({ color: "#8AC" });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}

{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthDivisions,
    sphereHeightDivisions
  );
  const sphereMat = new THREE.MeshStandardMaterial({ color: "#CA8" });
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}

// 聚光灯
// const color = 0xffffff;
// const intensity = 1;
// const light = new THREE.SpotLight(color, intensity);
// light.position.set(0, 10, 0);
// scene.add(light);
// scene.add(light.target);
// const helper = new THREE.SpotLightHelper(light);
// scene.add(helper);

// 矩形区域光
const color = 0xffffff;
const intensity = 5;
const width = 50;
const height = 4;
const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
light.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(light);
const helper = new RectAreaLightHelper(light);
light.add(helper);

//相机位置
camera.position.z = 0;
camera.position.y = 10;
camera.position.x = 20;
camera.lookAt(0, 0, 0);

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
  RectAreaLightUniformsLib.init();
};
onMounted(() => {
  listerCanvas();
});
</script>

<style scoped></style>
