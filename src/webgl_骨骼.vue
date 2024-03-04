<template>
  <div>
    <canvas id="canvas" ref="webGl" width="600" height="600"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import wall from "@/assets/wall.jpg";
const webGl = ref();
let gl;
let n;
//顶点着色器程序
var VSHADER_SOURCE =
  "attribute vec4 a_Position;" +
  "attribute vec4 a_Normal;" + //法向量
  "uniform mat4 u_MvpMatrix;" +
  "uniform mat4 u_NormalMatrix;\n" +
  "varying vec4 v_Color;" +
  "void main(){" +
  "gl_Position = u_MvpMatrix * a_Position;" +
  "vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));" + // Light direction
  "vec4 color = vec4(1.0, 0.4, 0.0, 1.0);" +
  "vec3 ambientLight = vec3(0.2, 0.2, 0.2);" +
  //对法向量进行归一化
  "vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);" +
  //计算法向量和光线方向的点积
  "float nDotL = max(dot(normal, lightDirection), 0.0);" +
  //计算漫反射光的颜色
  "vec3 diffuse = vec3(color) * nDotL;" +
  //计算环境光产生的反射颜色
  "vec3 ambient = ambientLight * color.rgb;" +
  "v_Color = vec4(diffuse + ambient, color.a);" +
  "}";

//片元着色器程序
var FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "varying vec4 v_Color;" +
  "void main() {" +
  "gl_FragColor = v_Color;" +
  "}";
const initVertexBuffers = () => {
  var vertices = new Float32Array([
    //顶点坐标
    1.5,
    10.0,
    1.5,
    -1.5,
    10.0,
    1.5,
    -1.5,
    0.0,
    1.5,
    1.5,
    0.0,
    1.5, // v0-v1-v2-v3
    1.5,
    10.0,
    1.5,
    1.5,
    0.0,
    1.5,
    1.5,
    0.0,
    -1.5,
    1.5,
    10.0,
    -1.5, // v0-v3-v4-v5
    1.5,
    10.0,
    1.5,
    1.5,
    10.0,
    -1.5,
    -1.5,
    10.0,
    -1.5,
    -1.5,
    10.0,
    1.5, // v0-v5-v6-v1
    -1.5,
    10.0,
    1.5,
    -1.5,
    10.0,
    -1.5,
    -1.5,
    0.0,
    -1.5,
    -1.5,
    0.0,
    1.5, // v1-v6-v7-v2
    -1.5,
    0.0,
    -1.5,
    1.5,
    0.0,
    -1.5,
    1.5,
    0.0,
    1.5,
    -1.5,
    0.0,
    1.5, // v7-v4-v3-v2
    1.5,
    0.0,
    -1.5,
    -1.5,
    0.0,
    -1.5,
    -1.5,
    10.0,
    -1.5,
    1.5,
    10.0,
    -1.5, // v4-v7-v6-v5
  ]);

  var normals = new Float32Array([
    // 法向量
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
    0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
  ]);
  var indices = new Uint8Array([
    // 顶点索引
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
    15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
  ]);
  if (!initArrayBuffer( 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer( 'a_Normal', normals, 3, gl.FLOAT)) return -1;
  //创建缓冲对象
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return indices.length;
};
const initArrayBuffer = (attribute, data, num, type) => {
  let buffer = gl.createBuffer()
  //将缓冲区对象保存到目标上
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
  //向缓存对象写入数据
  gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW)
  const a_attribute = gl.getAttribLocation(gl.program,attribute)//获取着色器属性的变量
  gl.vertexAttribPointer(a_attribute,num,type,false,0,0)
  gl.enableVertexAttribArray(a_attribute)
  return true
};
//坐标变换矩阵
let g_modelMatrix = new Matrix4(),g_mvpMatrix = new Matrix4()
//绘制手臂
const draw = (n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  const arm1Length = 10.0
  g_modelMatrix.setTranslate(0.0,-12.0,0.0)
  g_modelMatrix.rotate(g_arm1Angle,0.0,1.0,0.0)
  drawBox(n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix)

  g_modelMatrix.translate(0.0,arm1Length,0.0)
  g_modelMatrix.rotate(g_jointAngle,0.0,0.0,1.0)
  g_modelMatrix.scale(1.3,1.0,1.3)
  drawBox(n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix)
};
var g_normalMatrix = new Matrix4();
const drawBox = (n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix) => { 
  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(u_MvpMatrix,false,g_mvpMatrix.elements)
  //计算法线变化矩阵
  g_normalMatrix.setInverseOf(g_modelMatrix)
  g_normalMatrix.transpose()
  gl.uniformMatrix4fv(u_NormalMatrix,false,g_normalMatrix.elements)
  //绘制
  gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_BYTE,0)
 }
 var ANGLE_STEP = 3.0;  //每次按键转动的角度
var g_arm1Angle = 90.0;  //arm1 当前角度
var g_jointAngle = 0.0;  //joint1 当前角度

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix){
    switch (ev.keyCode){
        case 38:
            if(g_jointAngle < 135.0) g_jointAngle += ANGLE_STEP;
            break;
        case 40:
            if(g_jointAngle > -135.0) g_jointAngle -= ANGLE_STEP;
            break;
        case 39:
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 37:
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        default:
            return;
    }

    draw(n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}
onMounted(()=>{
  gl = webGl.value.getContext("webgl");
  if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Failed to initialize shaders.");
        return;
    }
  n = initVertexBuffers()
  gl.clearColor(0.0,0.0,0.0,1.0)
  gl.enable(gl.DEPTH_TEST)
  let u_MvpMatrix = gl.getUniformLocation(gl.program,'u_MvpMatrix')
  let u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix')
  //视图投影矩阵
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(50.0,webGl.value.width/webGl.value.height,1.0,100.0)
  viewProjMatrix.lookAt(20.0,10.0,30.0,0.0,0.0,0.0,0.0,1.0,0.0)
  //注册键盘事件
  document.onkeydown = function(ev){ keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };

  draw(n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

})
</script>

<style scoped></style>
