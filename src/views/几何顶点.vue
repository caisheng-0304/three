<template>
  <div ref="threeRef" style="width: 100%; height: 100vh"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
const threeRef = ref();
let scene, mesh, camera, renderer, clock, stats;
const init = () => {
  console.log("threeRef.value", threeRef.value);
  const width = window.innerWidth;
  const height = window.innerHeight;
  scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
  camera = new THREE.PerspectiveCamera(30, width / height, 1, 8000);
  camera.position.set(2000, 2000, 2000);
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const vertices = new Float32Array([
    0, 0, 0, //顶点1坐标
    50, 0, 0, //顶点2坐标
    0, 100, 0, //顶点3坐标
    0, 0, 10, //顶点4坐标
    0, 0, 100, //顶点5坐标
    50, 0, 10, //顶点6坐标
  ])
  const attribue = new THREE.BufferAttribute(vertices, 3)
  geometry.attributes.position = attribue
  // const material = new THREE.MeshLambertMaterial({
  //   color: "pink",
  //   opacity: 0.5,
  //   transparent: true,
  // });
  // mesh = new THREE.Mesh(geometry, material);
  // mesh.position.set(1000, 1000, 1000);
  // camera.lookAt(0, 0, 20);
  // scene.add(mesh);

  const material = new THREE.PointsMaterial({
    color:0xffff00,
    size:10
  })
  const points = new THREE.Points(geometry,material)
  scene.add(points);
  // //点光源
  // const pointLight = new THREE.PointLight(0xffff, 10.0)
  // pointLight.intensity = 100.0
  // pointLight.decay = 0.0
  // pointLight.position.set(500, 100, 100)
  // scene.add(pointLight)
  // const pointLightHelper = new THREE.PointLightHelper(pointLight, 10)
  // scene.add(pointLightHelper)
  // //环境光
  const ambient = new THREE.AmbientLight(0xffff, 10);
  scene.add(ambient);
  //平行光
  // const directionalLight = new THREE.DirectionalLight(0xffff,10)
  // directionalLight.position.set(80,100,50)
  // directionalLight.target = mesh
  // scene.add(directionalLight)
  // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight,5,0xff0000)
  // scene.add(directionalLightHelper)
  renderer = new THREE.WebGLRenderer({
    antialias:true
  });
  renderer.setSize(width, height);
  renderer.render(scene, camera);
  threeRef.value.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", (e) => {
    renderer.render(scene, camera);
  });
  clock = new THREE.Clock();
};
const setSize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); //更新相机投影矩阵
  renderer.render(scene, camera);
  renderer.setSize(window.innerWidth, window.innerHeight);
};
const onEventListener = () => {
  window.addEventListener("resize", setSize);
};
const render = () => {
  stats.update();
  const spt = clock.getDelta() * 1000;
  renderer.render(scene, camera);
  mesh.rotateY(0.01);
  requestAnimationFrame(render);
};

const onStats = () => {
  stats = new Stats();
  document.body.appendChild(stats.domElement);
};

//测试性能模型
const maxModel = () => {
  const num = 1000;
  for (let i = 0; i < num; i++) {
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshLambertMaterial({
      color: 0x00ffff,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    mesh.position.set(x, y, z);
    scene.add(mesh); // 模型对象插入场景中
  }
};

const model = () => {
  const geometry = new THREE.CircleGeometry(50,50,100);
  const material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
  });
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(i * 200, 0, j * 200);
      scene.add(mesh);
    }
  }
};

onMounted(() => {
  init();
  onStats();
  // render();
  onEventListener();
  // maxModel()
  // model()
});
</script>

<style lang="less" scoped></style>
