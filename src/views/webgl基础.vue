<template>
  <canvas ref="webGl" width="400" height="400"></canvas>
</template>

<script setup>
import { onMounted, ref } from "vue";
import cubetexture from "@/assets/cubetexture.png";
const webGl = ref();
//顶点着色全器
const vsSource = `
attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
`;
//片段着色器

const fsSource = `
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

let shaderProgram;
let programInfo;
let cubeRotation = 0.0;
var then = 0;
var gl;
var buffers;
//反复绘制场景
const render = (now) => {
  now *= 0.001; //转换为秒
  const deltaTime = now - then;
  then = now;
  setPositionAttribute(gl, buffers, programInfo);
  setTextureAttribute(gl, buffers, programInfo);
  drawScene(gl, programInfo, buffers, deltaTime, cubeRotation);
  cubeRotation += deltaTime;
  requestAnimationFrame(render);
};

const init = () => {
  //获取webGl图形上下文
  gl = webGl.value.getContext("webgl");
  console.log(gl);
  if (!gl) {
    alert("无法支持webgl");
  }
  //使用完全不透明的黑色清除所有图像
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //用上面指定的颜色清除缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT);
  shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
    },
  };
  // 这里我们调用构建所有的例程
  // 我们将要绘制的对象。
  buffers = initBuffers(gl);
  const texture = loadTexture(gl, cubetexture);
  // 将图像像素翻转为 WebGL 期望的从下到上的顺序
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  setColorAttribute(gl, buffers, programInfo);
  // drawScene(gl, programInfo, buffers);
  requestAnimationFrame(render);
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
  //如果创建失败,alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("报错:" + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
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

// 创建缓冲器存储顶点
const initBuffers = (gl) => {
  const positionBuffer = initPositionBuffer(gl);
  const textureCoordBuffer = initTextureBuffer(gl);
  const indexBuffer = initIndexBuffer(gl);
  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
};

const initPositionBuffer = (gl) => {
  // 为正方形的位置创建一个缓冲区。
  const positionBuffer = gl.createBuffer();
  //选择positionBuffer作为应用缓冲区的对象
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  //现在为正方形创建一个位置数组。
  const positions = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ];
  //现在将位置列表传入WebGL来构建
  //形状。通过创建一个Float32Array对象来实现
  // JavaScript数组，然后用它来填充当前的缓冲区。
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
};
const drawScene = (gl, programInfo, buffers, deltaTime, cubeRotation) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); //透明至黑色，完全不透明
  gl.clearDepth(1.0); // 清除一切
  gl.enable(gl.DEPTH_TEST); //启用深度测试
  gl.depthFunc(gl.LEQUAL); //近处的事物掩盖了远处的事物
  // 在我们开始在画布上绘图之前，先清除画布。
  //用于模拟相机中的透视失真。
  //我们的视场角是45度，宽度/高度
  //与画布显示尺寸匹配的比例
  //我们只想看到0.1单位之间的对象
  //距离相机100单位。
  const fieldOfView = (45 * Math.PI) / 180; //以弧度为单位
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  // 注意：glmatrix.js 始终有第一个参数
  //作为接收结果的目的地。
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  // 将绘制位置设置为“identity”点，即场景的中心
  const modelViewMatrix = mat4.create();
  //现在将绘图位置稍微移动到我们想要的位置开始画正方形
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0]
  ); //要翻译的数量
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1]
  ); // axis to rotate around
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0]
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0]
  ); // axis to rotate around (X)
  //告诉WebGL如何从position中提取位置将` buffer `保存到vertexPosition属性中。
  {
    const numComponents = 3; //每次迭代提取2个值
    const type = gl.FLOAT; //缓冲区中的数据是32位浮点数
    const normalize = false; //
    const stride = 0; //从一组值到下一组值需要多少字节,0 = 使用上面的 type 和 numComponents
    const offset = 0; //缓冲区内从多少字节开始
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }
  //告诉WebGL在绘图时使用我们的程序
  gl.useProgram(programInfo.program);
  //设置着色器制服
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );
  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
};
//告诉WebGL如何从位置中取出位置,buffer 到 vertexPosition 属性中。
const setPositionAttribute = (gl, buffers, programInfo) => {
  const numComponents = 3; // 每次迭代取出 2 个值
  const type = gl.FLOAT; // 缓冲区中的数据是32位浮点数
  const normalize = false;
  const stride = 0; // 从一组值到下一组值需要多少字节
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
};
//告诉 WebGL 如何从颜色缓冲区中提取颜色
const setColorAttribute = (gl, buffers, programInfo) => {
  const numComponents = 4; // 每次迭代取出 2 个值
  const type = gl.FLOAT; // 缓冲区中的数据是32位浮点数
  const normalize = false;
  const stride = 0; // 从一组值到下一组值需要多少字节
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
};

const initColorBuffer = (gl) => {
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
    [1.0, 0.0, 1.0, 1.0], // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  return colorBuffer;
};
const initIndexBuffer = (gl) => {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // 这个数组使用元素将每个面定义为两个三角形,顶点数组中的索引来指定每个三角形的位置
  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ];
  // 现在将元素数组发送给GL
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  return indexBuffer;
};
//初始化纹理并加载图像
//当图像加载完成后，将其复制到纹理中
const loadTexture = (gl, url) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //因为图片必须通过互联网下载
  //可能需要一段时间才能准备好
  //然后在纹理中添加一个像素，以便我们可以
  //立即使用它。当图像下载完成时
  //我们将使用图像的内容更新纹理。
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );
    // WebGL1对2张图片的功率有不同的要求
    // vs. 2个图像的非幂，所以检查图像是否为a
    //在两个维度上都取2的幂
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // 是的，它是 2 的幂。生成 mips。
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // 不，它不是 2 的幂。关闭 mips 并设置 // 包裹以夹住边缘
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
  return texture;
};
const isPowerOf2 = (value) => {
  return (value & (value - 1)) === 0;
};
const initTextureBuffer = (gl) => {
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  const textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
  );
  return textureCoordBuffer;
};
const setTextureAttribute = (gl, buffers, programInfo) => {
  const num = 2; //每个坐标由2个值组成
  const type = gl.FLOAT; //缓冲区中的数据为32位浮点数
  const normalize = false; // 不做标准化处理
  const stride = 0; // 从一个坐标到下一个坐标要获取多少字节
  const offset = 0; // 从缓冲区内的第几个字节开始获取数据
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    num,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
};
onMounted(() => {
  init();
});
</script>

<style scoped></style>
