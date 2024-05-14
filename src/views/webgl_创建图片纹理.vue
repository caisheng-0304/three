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
let projMat4 = mat4.create();
let vertices;
const n = 4; //顶点数目，四个为一个顶点
//顶点着色器
const vertexString = `
        attribute vec4 a_Position; // 定义一个从外部传进来的数据
        attribute vec2 a_TexCoord; //纹理坐标变量
        varying vec2 v_TexCoord;
        void main(){
            gl_Position = a_Position;
            v_TexCoord = a_TexCoord;
        }
`;
// uniform:声明变量表示渲染过程中保持不变,mat4表示4*4的矩阵，
//attribute vec4 a_Position;: 定义了一个顶点属性 a_Position，这个属性是一个四维向量用来表示顶点的位置信息。
//attribute vec4 a_Color;: 定义了另一个顶点属性 a_Color，表示顶点的颜色信息，同样是一个四维向量
// varying vec4 v_Color;: 一个varying类型的变量，用于在顶点着色器和片段着色器之间传递数据。这里将顶点着色器计算得到的颜色值传递给片段着色器。
// gl_Position是一个内建的输出变量，表示顶点的最终位置。v_Color是我们自定义的用于传递颜色信息的变量，将顶点的颜色信息赋值给它

//片段着色器
const fragmentString = `
        precision mediump float;
        uniform sampler2D u_Sampler; 
        varying vec2 v_TexCoord;
        void main(){
            gl_FragColor = texture2D(u_Sampler,v_TexCoord);
        }
`;
// 表示纹理的变量声明,接收一个2d纹理,u_Sampler是一个变量名,sampler2D表示2d纹理
//varying vec4 v_Color;: 这里使用与顶点着色器中相同名称的 v_Color 变量。varying 表示这个变量是由顶点着色器传递过来的，它会在每个片段（像素）上进行插值，使得片段着色器可以获取到相应的颜色信息。
const init = () => {
  gl = webGl.value.getContext("webgl");
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
  gl.program = shaderProgram
  return shaderProgram;
};

const initBuffer = () => {
  initShaderProgram(gl, vertexString, fragmentString);

  vertices = new Float32Array(
    [
    -0.5, 0.5, 0.0, 1.0, //顶点1
        -0.5, -0.5, 0.0, 0.0, //顶点2
        0.5, 0.5, 1.0, 1.0, //顶点3
        0.5, -0.5, 1.0, 0.0, //顶点4
  ]);
  
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
        console.log('创建缓冲区对象失败！')
        return -1
      }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); //绑定缓冲区
  
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); //ARRAY_BUFFER是存储顶点的缓冲类型,存储浮点数;STATIC_DRAW告诉data只处理一次，用于提高性能
  const FSIZE = vertices.BYTES_PER_ELEMENT; //获取数组中每个字节占的节数
  console.log(FSIZE);
  const a_position = gl.getAttribLocation( gl.program, "a_Position");
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 4, 0); //告诉GPU如何解释或者解析这个顶点数据
  gl.enableVertexAttribArray(a_position); //激活顶点数据，开启缓冲区

  //将纹理坐标分配给a_TexCoord并开启
  const a_TexCoord = gl.getAttribLocation( gl.program,'a_TexCoord')
  gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2)
  gl.enableVertexAttribArray(a_TexCoord)

  initTextures(n)

  // let aPosition = gl.getAttribLocation(shaderProgram, "a_position"); //返回某个属性的位置
  // console.log("aPosition", aPosition);
  // gl.vertexAttrib4fv(aPosition, pointPostion); //设置顶点着色器中的顶点属性，用来设置四维浮点数数组类型的顶点属性
  // let uniforproj = gl.getUniformLocation(shaderProgram, "proj"); //获取uniform变量位置的函数
  // console.log("uniforproj", uniforproj, projMat4);
  // gl.uniformMatrix4fv(uniforproj, false, projMat4); //向uniform变量设置4*4矩阵
};
//创建纹理对象
const initTextures = (n) => { 
    const texture = gl.createTexture()//创建纹理对象
    const u_Sampler = gl.getUniformLocation( gl.program,'u_Sampler')//获取存储位置
    const image = new Image()//创建一个image
    image.src = wall
    image.onload = () => { 
      loadTexture(n,texture,u_Sampler,image)
     }
     return true
 }
 const loadTexture = (n,texture,u_Sampler,image) => { 
  console.log('执行了');
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) //对纹理图像镜像y轴反转     
      gl.activeTexture(gl.TEXTURE0) //激活纹理单元  
      gl.bindTexture(gl.TEXTURE_2D, texture) //绑定纹理对象
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) //配置纹理对象参数
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image) //纹理图像分配给纹理对象
      gl.uniform1i(u_Sampler, 0) //纹理单元编号传给片元着色器中uniform变量u_Sampler
      draw();
  }
const draw = () => {
  gl.viewport(0, 0, webGl.value.offsetWidth, webGl.value.offsetHeight);
  gl.clearColor(0.1, 0, 0.2, 0.5);
  // gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length/4); //绘制矩形

};
const main = () => {
  init();
  initBuffer();
  
};

onMounted(() => {
  main();
});
</script>

<style scoped></style>
