<template>
  <canvas ref="webGl" width="400" height="400"></canvas>
</template>

<script setup>
import { onMounted, ref } from "vue";
import wall from "@/assets/wall.jpg";
const webGl = ref();
//获取webGl图形上下文

//正方形顶点坐标
const vertices = [-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5];
//对应的纹理坐标
const texCoords = [0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0];

//顶点着色器
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 = a_Color;
  varying vec4 v_Color;
  void main(){
    gl_Position = a_Position;
    v_Color = a_Color;
  }
`;
//attribute vec4 a_Position;: 定义了一个顶点属性 a_Position，这个属性是一个四维向量用来表示顶点的位置信息。

//attribute vec4 a_Color;: 定义了另一个顶点属性 a_Color，表示顶点的颜色信息，同样是一个四维向量

// varying vec4 v_Color;: 一个varying类型的变量，用于在顶点着色器和片段着色器之间传递数据。这里将顶点着色器计算得到的颜色值传递给片段着色器。

// gl_Position是一个内建的输出变量，表示顶点的最终位置。v_Color是我们自定义的用于传递颜色信息的变量，将顶点的颜色信息赋值给它

//片段着色器
const FSHADER_SOURCE = `
varying vec4 v_Color;
void main(){
  gl_FragColor = v_Color
}
`;
//varying vec4 v_Color;: 这里使用与顶点着色器中相同名称的 v_Color 变量。varying 表示这个变量是由顶点着色器传递过来的，它会在每个片段（像素）上进行插值，使得片段着色器可以获取到相应的颜色信息。
let gl;
const init = () => {
  gl = webGl.value.getContext("webgl");
  onBuffer();
  onParameteri();
  onDraw();
};

//创建缓冲区
const onBuffer = () => {
  //创建顶点缓冲区
  const vertexBuffer = gl.createBuffer(); //创建一个用于存储顶点的缓冲对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); //绑定顶点到目标对象,gl.ARRAY_BUFFER 是一个常量，用于表示缓冲区对象的类型。它指示 WebGL 上下文要操作的缓冲区包含顶点属性数据。在使用 WebGL 进行顶点数据的处理时，你可以使用 gl.ARRAY_BUFFER 来指定要操作的缓冲区类型，然后使用相应的 WebGL 函数来处理这些数据，比如存储顶点数据或者修改顶点属性。
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices)); //初始化buffer对象的数据，也可以说是设置顶点对象的数据
  //创建纹理坐标缓冲区
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords));
};

//创建纹理
const onParameteri = () => {
  const texture = gl.createTexture(); //创建纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture); //绑定纹理对象
  //texParameteri设置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //TEXTURE_MIN_FILTER纹理缩小的过滤方式为线性过滤,
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // gl.TEXTURE_WRAP_S 和 gl.TEXTURE_WRAP_T 设置了纹理的水平和垂直方向的纹理环绕方式为边缘拉伸
  //将图像加载到纹理
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); //将图像的数据加载到纹理当中
    gl.generateMipmap(gl.TEXTURE_2D);
    // Mipmap 用于创建与对象的距离。较高分辨率的 mipmap 用于较近的对象，较低分辨率的 mipmap 用于较远的对象。它从纹理图像的分辨率开始，并将分辨率减半，直到创建 1x1 尺寸的纹理图像。
  };

  image.src = wall;
};
//渲染绘制
const onDraw = () => {
  // 创建着色器程序
  const shaderProgram = gl.createProgram();
  const a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
  const a_TexCoord = gl.getAttribLocation(shaderProgram, "a_TexCoord");
  //启动顶点属性
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);

  //使用着色器
  gl.useProgram(shaderProgram);
  //将纹理绑定到纹理单元
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(u_Sampler, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2);
};

onMounted(() => {
  init();
});
</script>

<style scoped></style>
