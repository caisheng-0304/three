<template>
  <div ref="threeRef" style="width: 100%; height: 100vh" id="cesiumContainer"></div>
</template>

<script setup>
import * as Cesium from 'cesium'
import { ref, onMounted } from "vue";
let viewer
const init = () => {
  viewer = new Cesium.Viewer('cesiumContainer', {
    geocoder: false,//搜索，查找位置
    homeButton: false,//视角返回初始设置
    sceneModePicker: false,//选择视角的模式
    baseLayerPicker: false,//图层选择器
    navigationHelpButton: false,//导航帮助按钮
    animation: false,//动画器件
    timeline: false,//时间线
  });
  viewer.scene.debugShowFramesPerSecond = true //帧率信息
  viewer.cesiumWidget.creditContainer.style.display = "none"; //隐藏logo

  // 添加立方体
  const redBox = viewer.entities.add({
    name:'立方体',
    position:Cesium.Cartesian3.fromDegrees(111.95,26.55, 300.0),
    box:{
      dimensions:new Cesium.Cartesian3(400.0, 300.0, 500.0),//长宽高
      // material:Cesium.Color.RED.withAlpha(0.5),
      material:Cesium.Color.fromCssColorString('#0f0').withAlpha(0),//颜色
      outline:true,
      // outlineColor:Cesium.Color.BLACK
      outlineColor:'#0f0',
    }
  })
  viewer.zoomTo(viewer.entities)//自动调整相机视角范围

}



onMounted(() => {
  init()
});
</script>

<style lang="less" scoped></style>
