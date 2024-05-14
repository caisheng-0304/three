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
attribute vec4 a_Position; // 定义一个从外部传进来的数据
attribute float a_PointSize;
attribute vec4 a_Color;
varying vec4 v_Color;
uniform mat4 u_ProjMatrix;
            void main(){
                gl_Position = u_ProjMatrix * a_Position;
                v_Color = a_Color;
            }
`;
// uniform:声明变量表示渲染过程中保持不变,mat4表示4*4的矩阵，
//attribute vec4 a_Position;: 定义了一个顶点属性 a_Position，这个属性是一个四维向量用来表示顶点的位置信息。
//attribute vec4 a_Color;: 定义了另一个顶点属性 a_Color，表示顶点的颜色信息，同样是一个四维向量
// varying vec4 v_Color;: 一个varying类型的变量，用于在顶点着色器和片段着色器之间传递数据。这里将顶点着色器计算得到的颜色值传递给片段着色器。
// gl_Position是一个内建的输出变量，表示顶点的最终位置。v_Color是我们自定义的用于传递颜色信息的变量，将顶点的颜色信息赋值给它

//片段着色器
const fragmentString = `
            precision mediump float; // 必须设置精度否则无法通过编译
            uniform vec4 u_FragColor; // 外部的颜色数据
            varying vec4 v_Color;
            void main(){
                gl_FragColor = v_Color;
            }
`;
//varying vec4 v_Color;: 这里使用与顶点着色器中相同名称的 v_Color 变量。varying 表示这个变量是由顶点着色器传递过来的，它会在每个片段（像素）上进行插值，使得片段着色器可以获取到相应的颜色信息。
const init = () => {
  gl = webGl.value.getContext("webgl");
  nf = document.getElementById('nearFar')
  // console.log("==", webGl.value.clientX, webGl.value.clientY);
  // gl.viewport(0, 0, webGl.value.offsetWidth, webGl.value.offsetHeight);
  // gl.viewport(0, 0, webGl.value.offsetWidth, webGl.value.offsetHeight);
  // mat4.ortho(1, 0, webGl.value.clientWidth, webGl.value.clientHeight, 0, -1, 1); //创建一个正交投影矩阵
  // 在我们开始在画布上绘图之前，先清除画布。
  //用于模拟相机中的透视失真。
  //我们的视场角是45度，宽度/高度
  //与画布显示尺寸匹配的比例
  //我们只想看到0.1单位之间的对象
  //距离相机100单位。
  // const fieldOfView = (45 * Math.PI) / 180; //以弧度为单位
  // const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  // const zNear = 0.1;
  // const zFar = 100.0;
  // const projectionMatrix = mat4.create();
  // // 注意：glmatrix.js 始终有第一个参数
  // //作为接收结果的目的地。
  // mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  // const modelViewMatrix = mat4.create();
  // mat4.translate(
  //   modelViewMatrix, // destination matrix
  //   modelViewMatrix, // matrix to translate
  //   [-0.0, 0.0, -6.0]
  // ); //要翻译的数量
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

//shader初始化函数,初始化着色器
// const initShader = () => {
//   const vsShader = gl.createShader(gl.VERTEX_SHADER); //创建着色器
//   const fsShader = gl.createShader(gl.FRAGMENT_SHADER);
//   gl.shaderSource(vsShader, vertexString); //将c源码设置给webgl着色器
//   gl.shaderSource(fsShader, fragmentString);
//   gl.compileShader(vsShader); //编译源码
//   gl.compileShader(fsShader); //编译源码
//   console.log(gl.getShaderInfoLog(vsShader), gl.getShaderInfoLog(fsShader));
//   let program = gl.createProgram(); //创建一个用来处理图形渲染的对象，该对象可以存储顶点和片元，并且链接成一个可执行程序
//   gl.attachShader(program, vsShader); //将着色器添加到webgl中
//   gl.attachShader(program, fsShader); //将着色器添加到webgl中\
//   gl.linkProgram(program); //链接已经编译好的着色器程序，生成一个可渲染的程序
//   gl.useProgram(program); //指定要选中的着色器
//   gl.program = program;
// };
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
const n = 9;
const initBuffer = () => {
  shaderProgram = initShaderProgram(gl, vertexString, fragmentString);

  vertices = new Float32Array([
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.5, -0.5,
    -0.4, 1.0, 0.4, 0.4, 0.5, 0.4, -0.2, 1.0, 0.4, 0.4, -0.5, 0.4, -0.2, 1.0,
    1.0, 0.4, 0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0, 0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); //绑定缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); //ARRAY_BUFFER是存储顶点的缓冲类型,存储浮点数;STATIC_DRAW告诉data只处理一次，用于提高性能
  const FSIZE = vertices.BYTES_PER_ELEMENT; //获取数组中每个字节占的节数
  console.log(FSIZE);
  const a_position = gl.getAttribLocation(shaderProgram, "a_Position");
  console.log("aPosition", a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 5, 0); //告诉GPU如何解释或者解析这个顶点数据
  gl.enableVertexAttribArray(a_position); //激活顶点数据，开启缓冲区

  const a_Color = gl.getAttribLocation(shaderProgram, "a_Color");
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);

  // //创建缓冲区的a_PointSize动态变量
  // const sizes = new Float32Array([10.0, 20.0, 30.0]);
  // const sizeBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  // const a_PointSize = gl.getAttribLocation(shaderProgram, "a_PointSize");
  // gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(a_PointSize);
  // let aPosition = gl.getAttribLocation(shaderProgram, "a_position"); //返回某个属性的位置
  // console.log("aPosition", aPosition);
  // gl.vertexAttrib4fv(aPosition, pointPostion); //设置顶点着色器中的顶点属性，用来设置四维浮点数数组类型的顶点属性
  // let uniforproj = gl.getUniformLocation(shaderProgram, "proj"); //获取uniform变量位置的函数
  // console.log("uniforproj", uniforproj, projMat4);
  // gl.uniformMatrix4fv(uniforproj, false, projMat4); //向uniform变量设置4*4矩阵
};
const onMatrix = () => {
  const u_ModelViewMatrix = gl.getUniformLocation(
    shaderProgram,
    "u_ProjMatrix"
  ); //获取u_ViewMatrix变量的存储地址
  // 一、
  // const viewMatrix = new Matrix4(); //设置视点、视线和上方向
  // viewMatrix.setLookAt(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0); //(eyaX,eyeY,eyeZ,atX,atY,atZ,upX,upY,upZ)eyaX,eyeY,eyeZ是视点，位于坐标系统原点，atX,atY,atZ是观察点,upX,upY,upZ是上方向
  // //计算旋转矩阵
  // const modelMatrix = new Matrix4()
  // modelMatrix.setRotate(-10,0,0,1)//绕z轴旋转
  // const modelViewMatrix = viewMatrix.multiply(modelMatrix)//两个矩阵相乘
  // 二、
  const modelViewMatrix = new Matrix4();
  //将模型视图矩阵传给u_ModelViewMatrix
  // gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);

  document.onkeydown = (e) => {
    keydown(e, n, u_ModelViewMatrix, modelViewMatrix);
  };
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
  viewMatrix.setOrtho(-1.0,1.0,-1.0,1.0,g_near,g_far)

  //将投影矩阵传递给u_ViewMatrix变量
  gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements)
  gl.clearColor(0.1, 0, 0.2, 0.5);
  // gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
  nf.innerHTML = `near:${Math.round(g_near*100)/100}+,far:${Math.round(g_far*100)/100}`
  gl.drawArrays(gl.TRIANGLES, 0, n);
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
