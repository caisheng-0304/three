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
const main = () => {
  const image = new Image();
  image.src = wall;
  image.onload = () => {
    render(image);
  };
};
const render = (image) => { 
   gl = webGl.value.getContext('webgl')
  if(!gl){
    return
  }
  const program = webglUtils.createProgramFromScripts(gl,["vertex-shader-2d","fragment-shader-2d"])
  const positionLocation = gl.getAttribLocation(program,"a_position")
  const texcoordLocation = gl.getAttribLocation(program,"a_texCoord")
  const textureSizeLocation = gl.getUniformLocation(program,'u_textureSize')
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer)
  setRectangle(gl,0,0,image.width,image.height)
  const texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
    0.0,0.0,
    1.0,0.0,
    0.0,1.0,
    0.0,1.0,
    1.0,0.0,
    1.0,1.0
  ]),gl.STATIC_DRAW)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D,texture)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);

  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);

  const resolutionLocation = gl.getUniformLocation(program,"u_resolution")

  webglUtils.resizeCanvasToDisplaySize(gl.canvas)
  gl.viewport(0,0,gl.canvas.width,gl.canvas.height)
  gl.clearColor(0,0,0,0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(program)
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer)
  var size = 2;
  var type = gl.FLOAT
  var normalize = false;
  var stride = 0;
  var offset = 0
  gl.vertexAttribPointer(positionLocation,size,type,normalize,stride,offset)

  gl.enableVertexAttribArray(texcoordLocation)//启动顶点数组方法

  gl.bindBuffer(gl.ARRAY_BUFFER,texcoordBuffer)//绑定文本缓冲区

  var size =2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0
  gl.vertexAttribPointer(
    texcoordLocation,size,type,normalize,stride,offset
  )

  //设置分辨率
  gl.uniform2f(resolutionLocation,gl.canvas.width,gl.canvas.height)

  //设置图像的大小
  gl.uniform2f(textureSizeLocation,image.width,image.height)

  const primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(primitiveType,offset,count)
 }
 const setRectangle = (gl,x,y,width,height) => { 
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
    x1,y1,
    x2,y1,
    x1,y2,
    x1,y2,
    x2,y1,
    x2,y2
  ]),gl.STATIC_DRAW)

  }
  onMounted(()=>{
    main()
  })
</script>

<style scoped></style>
