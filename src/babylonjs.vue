<template>
  <canvas class="renderCanvas" ref="renderCanvasRef"></canvas>
</template>
<script setup>
import { ref, onMounted } from "vue";
import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import  '@babylonjs/inspector';

console.log("BABYLON", BABYLON);
const renderCanvasRef = ref();

onMounted(() => {
  const canvas = renderCanvasRef.value;
  const engine = new BABYLON.Engine(canvas, true); // 生成3d引引擎
  const createScene = function () {
    const scene = new BABYLON.Scene(engine); //创建场景对象

    const camera = new BABYLON.FreeCamera(
      "camera1",
      new BABYLON.Vector3(0, 5, -10),
      scene
    ); //创建一个自由相机体

    camera.setTarget(BABYLON.Vector3.Zero()); //将相机定位到场景原点

    camera.attachControl(canvas, true); //将相机添加到画布上

    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    ); //创建一个光源

    light.intensity = 0.7;

    const sphere = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene
    );

    sphere.position.y = 1;

    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      scene
    ); //  内置形状

    const groundMaterial = new BABYLON.StandardMaterial(
      "Ground Material",
      scene
    );

    // groundMaterial.diffuseColor = BABYLON.Color3.Red();

    let groundTexture = new BABYLON.Texture(Assets.textures.checkerboard_basecolor_png.rootUrl, scene)

    groundMaterial.diffuseTexture = groundTexture;

    return scene;
  };
  const scene = createScene(); //Call the createScene function
  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render();
  });
  // Watch for browser/canvas resize events
  window.addEventListener("resize", function () {
    engine.resize();
  });
  Inspector.Show(scene,{})
});
</script>
<style>
.renderCanvas {
  width: 100%;
  height: 100vh;
}
</style>
