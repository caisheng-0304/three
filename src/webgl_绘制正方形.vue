<template>
  <div>
    <canvas id="canvas" ref="webGl" width="600" height="600"></canvas>
    <p id="nearFar"></p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import wall from "@/assets/wall.jpg";
const webGl = ref();
let gl;
let projMat4 = mat4.create();
let vertices;
let shaderProgram;
let nf;
//顶点着色器
const vertexString = `
  attribute vec4 a_position;
  attribute vec3 a_color;
  attribute vec3 a_normal;
  uniform mat4 u_world;
  uniform mat4 u_viewInv;
  uniform mat4 u_proj;
  varying vec3 v_color;
  varying vec3 v_worldPos;
  varying vec3 v_normal;
  void main(){
    vec4 worldPos = u_world * a_position;
    vec4 worldNormal = u_world * vec4(a_normal,1.0)
    v_worldPos = worldPos.xyz / worldPos.w;
    v_color = a_color;
    v_normal = worldNormal.xyz/ worldNormal.w;
    gl_Position = u_proj * u_viewInv * worldPos;
  }
`;

//片段着色器
const fragmentString = `
      precision mediump float;
      varying vec3 v_color;
      varying vec3 v_normal;
      varying vec3 v_worldPos;
      uniform vec3 u_lightDir;
      uniform vec3 u_viewWorldPos;
      uniform float u_gloss;
      void main(){
        vec3 n = normalize(v_normal);
        vec3 lightDir = normalize(u_lightDir)
        vec3 viewDir = normalize(u_viewWorldPos - v_worldPos);
        vec3 r = 2.0 * dot(n, lightDir) * n - lightDir;
        float LdotN = dot(lightDir, n);
        float RdotV = dot(viewDir, r);
        vec3 dColor = vec3(0.5);
        vec3 sColor = vec3(1.0);
        vec3 ambient = vec3(0.2);
        vec3 diffuse = dColor * max(0.0, LdotN);
        vec3 specular = sColor * pow(max(0.0, RdotV), u_gloss);

        vec3 color = ambient + diffuse + specular;

        color = pow(color, vec3(1.0 / 1.5));
        gl_FragColor = vec4(color, 1.0);
      }
`;

const init = () => {
  gl = webGl.value.getContext("webgl");
  nf = document.getElementById('nearFar')
};

//创建指定类型的着色器，上传source源码解析并编译
const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type); //创建一个新的着色器
  gl.shaderSource(shader, source); //将源代码发送到着色器
  gl.compileShader(shader); //获取源代码进行编译
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    //检查是否成功编译了着色器
    console.log(gl.getShaderInfoLog(shader));
    alert(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};
//初始化着色器程序，让webgl知道如何绘制我们的数据
const initShaderProgram = (gl, vsSource, fsSource) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  //创建着色器程序
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  //如果创建失败,alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("报错:" + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
};
const n = 30;
const initBuffer = () => {
  shaderProgram = initShaderProgram(gl, vertexString, fragmentString);

  vertices = new Float32Array([
    1.0,1.0,1.0, 1.0,1.0,1.0,
    -1.0,1.0,1.0,1.0,0.0,1.0,
    -1.0,-1.0,1.0,1.0,0.0,0.0,
    1.0,-1.0,1.0,1.0,0.0,0.0,
    1.0,-1.0,-1.0,0.0,1.0,0.0,
    1.0,1.0,-1.0,0.0,1.0,1.0,
    -1.0,1.0,-1.0,0.0,0.0,1.0,
    -1.0,-1.0,-1.0,0.0,0.0,0.0,
  ]);
  //顶点索引
  const indices = new Uint8Array([
    0,1,2,0,2,3,
    0,3,4,0,4,5,
    0,5,6,0,6,1,
    1,6,7,1,7,2,
    4,7,6,4,6,5
  ])
  console.log('indices',indices.length);
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); //绑定缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); //ARRAY_BUFFER是存储顶点的缓冲类型,存储浮点数;STATIC_DRAW告诉data只处理一次，用于提高性能
  const FSIZE = vertices.BYTES_PER_ELEMENT; //获取数组中每个字节占的节数
  console.log(FSIZE);
  const a_position = gl.getAttribLocation(shaderProgram, "a_Position");
  console.log("aPosition", a_position);
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 6, 0); //告诉GPU如何解释或者解析这个顶点数据
  gl.enableVertexAttribArray(a_position); //激活顶点数据，开启缓冲区

  const a_Color = gl.getAttribLocation(shaderProgram, "a_Color");
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW)
  
};
const onMatrix = () => {
  const u_ModelViewMatrix = gl.getUniformLocation(
    shaderProgram,
    "u_MvpMatrix"
  ); //获取u_ViewMatrix变量的存储地址
  const modelViewMatrix = new Matrix4();
  document.onkeydown = (e) => {
    // keydown(e, n, u_ModelViewMatrix, modelViewMatrix);
  };
  draw(n,u_ModelViewMatrix,modelViewMatrix)
};
//视点与近、远裁剪面的距离;
let g_near = 0.0,g_far = 0.5;
const keydown = (e, n, u_ViewMatrix, viewMatrix,nf) => {
  let code = e.keyCode;
  switch (code) {
    case 39:
      g_near+=0.01;//按下右方向键
      break;
    case 37:
      g_near-=0.01;//按下左方向键
      break;
    case 38:
      g_far+=0.01;//按下上方向键
      break;
    case 40:
      g_far-=0.01;//按下下方向键
      break;
  
    default:
      break;
  }
  draw(n,u_ViewMatrix,viewMatrix)
};
const draw = (n,u_ViewMatrix,viewMatrix) => {
  //使用矩阵设置可视空间
  // viewMatrix.setLookAt(0.2,0.25,0.25,0,0,0,0,1,0)
  viewMatrix.setPerspective(30,1,1,100)
  viewMatrix.lookAt(3,3,7,0,0,0,0,1,0)

  //将投影矩阵传递给u_ViewMatrix变量
  gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements)
  gl.clearColor(0.1, 0, 0.2, 0.5);
  gl.enable(gl.DEPTH_TEST)//开启隐藏面消除
  // gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//清空颜色缓冲区和深度缓冲区
  // gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
  // nf.innerHTML = `near:${Math.round(g_near*100)/100}+,far:${Math.round(g_far*100)/100}`
  // gl.drawArrays(gl.TRIANGLES, 0, n);
  gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_BYTE,0)
};
const main = () => {
  init();
  initBuffer();
  onMatrix();
  // draw();
};

onMounted(() => {
  main();
});
</script>

<style scoped></style>
