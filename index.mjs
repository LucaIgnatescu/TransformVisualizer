import { cylinder, octahedron, disk, torus, sphere } from "./shapes.mjs";
import {
  mIdentity,
  mInverse,
  mPerspective,
  mRotateX,
  mRotateY,
  mRotateZ,
  mScale,
  mTranslate,
  matrixMultiply,
  m4,
  mInverseRotateX,
  mInverseRotateY,
} from "./matrix.mjs";

let NLIGHTS = 1;

let start_gl = (canvas, meshData, vertexSize, vertexShader, fragmentShader) => {
  let gl = canvas.getContext("webgl");
  let program = gl.createProgram();
  gl.program = program;
  let addshader = (type, src) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
    gl.attachShader(program, shader);
  };
  addshader(gl.VERTEX_SHADER, vertexShader);
  addshader(gl.FRAGMENT_SHADER, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw "Could not link the shader program!";
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  let vertexAttribute = (name, size, position) => {
    let attr = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(
      attr,
      size,
      gl.FLOAT,
      false,
      vertexSize * 4,
      position * 4
    );
  };
  vertexAttribute("aPos", 3, 0);
  vertexAttribute("aNor", 3, 3);
  return gl;
};

let vertexSize = 6;
let vertexShader = `
   attribute vec3 aPos, aNor;
   uniform mat4 uMatrix, uInvMatrix;
   varying vec3 vPos, vNor;
   void main() {
      vec4 pos = uMatrix * vec4(aPos, 1.0);
      vec4 nor = vec4(aNor, 0.0) * uInvMatrix;
      vPos = pos.xyz;
      vNor = nor.xyz;
      gl_Position = pos * vec4(1.,1.,-.1,1.);
      // gl_Position = pos;
   }
`;
let fragmentShader =
  `
   precision mediump float;
   uniform vec3 uColor;
   varying vec3 vPos, vNor;

   vec3 LC = vec3(1.);
   vec3 LD = normalize(vec3(1., 1., 0.));
   vec3 ambient = vec3(1., 1., 1.); //should I be normalizing this?
   vec3 specular = vec3(1., 1., 1.); //how the surface reflects colors
   vec3 diffuse = vec3(0.2); //how the surface absorbes color

   float kd = .1, ks = 0., ka = .2, alpha = 10.; 

   float uFl = 3.;

   vec3 camera = vec3(.0, .0, -uFl);
   
  uniform vec3  uLC[` +
  NLIGHTS +
  `]; 
  uniform vec3  uLD[` +
  NLIGHTS +
  `];

  vec3 shadeSurface() {
      vec3 N = normalize(vNor);
      vec3 R;
      vec3 W = normalize(vPos - camera);
      vec3 color = ambient*ka;
      for (int i = 0; i < ` +
  NLIGHTS +
  `; i ++){
        R = 2. * dot(uLD[i], N) * N - uLD[i];
        // color += kd * max(0., dot(N, uLD[i])) * uLC[i] + specular * pow(max(0., dot(R, W)), alpha) * ks;
        color += kd * max(0., dot(N, uLD[i]))+ pow(max(0., dot(R, W)), alpha) * ks;
      }
      return color;
   }

   void main(void) {
     // float c = .05 + max(0., dot(normalize(vNor), vec3(.57)));
     // vec3 color = c * uColor;
      //vec3 color = shadeSurface(vPos, normalize(vNor), vec3(.05), vec3(0.9), vec4(0.1, 0.04, 0.1, 30), vec3(.57)) * uColor;
      vec3 color = uColor * shadeSurface();
      gl_FragColor = vec4(sqrt(color), 1.);
   }
`;

let clicked = false;
let pos = [];

// let startMatrix = mPerspective(1, mIdentity());
let startMatrix = mIdentity();

const canvas1 = document.getElementById("canvas1");

const { width, height } = canvas1.getBoundingClientRect();
console.log(width, height);
canvas1.onmousedown = (event) => {
  clicked = true;
  pos = [event.clientX, event.clientY];
};

canvas1.onmouseup = (event) => {
  clicked = false;
  pos = [];
};

canvas1.onmousemove = (event) => {
  if (!clicked) return;

  const rotationSpeed = 2;

  const [moveX, moveY] = [pos[0] - event.clientX, pos[1] - event.clientY];
  pos = [event.clientX, event.clientY];
  console.log(moveX, moveY);
  startMatrix = mInverseRotateX((Math.PI / height) * moveY, startMatrix);
  startMatrix = mInverseRotateY((Math.PI / width) * moveX, startMatrix);
};

document.onkeydown = (event) => {
  switch (event.key) {
    case "w":
      startMatrix = mScale(1.1, 1.1, 1.1, startMatrix);
      break;
    case "s":
      startMatrix = mScale(0.9, 0.9, 0.9, startMatrix);
      break;
  }
};

// canvas1.onmousedown = (e, )

setTimeout(() => {
  let gl = start_gl(canvas1, null, vertexSize, vertexShader, fragmentShader);

  let meshData = [
    { type: 1, color: [1, 0.5, 1], mesh: new Float32Array(torus(20, 20)) },
  ];
  //let uFL = gl.getUniformLocation(gl.program, "uFl");
  // let uTime = gl.getUniformLocation(gl.program, "uTime");
  let uLD = gl.getUniformLocation(gl.program, "uLD");
  let uLC = gl.getUniformLocation(gl.program, "uLC");

  // let uSphere = gl.getUniformLocation(gl.program, "uSphere");
  // let uAmbient = gl.getUniformLocation(gl.program, "uAmbient");
  // let uDiffuse = gl.getUniformLocation(gl.program, "uDiffuse");
  // let uSpecular = gl.getUniformLocation(gl.program, "uSpecular");

  let uColor = gl.getUniformLocation(gl.program, "uColor");
  let uMatrix = gl.getUniformLocation(gl.program, "uMatrix");
  let uInvMatrix = gl.getUniformLocation(gl.program, "uInvMatrix");

  let startTime = Date.now() / 1000;

  function glDraw(meshData, m) {
    gl.uniform3fv(uColor, meshData.color);
    gl.uniformMatrix4fv(uMatrix, false, m);
    gl.uniformMatrix4fv(uInvMatrix, false, mInverse(m));
    let r3 = Math.sqrt(1 / 3);
    // gl.uniform3fv(uLC, [1, 1, 1, 0.3, 0.2, 0.1]);
    // gl.uniform3fv(uLD, [r3, r3, r3, -r3, -r3, -r3]);
    gl.uniform3fv(uLC, [1, 1, 1]);
    gl.uniform3fv(uLD, [r3, r3, r3]);

    let mesh = meshData.mesh;
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
    gl.drawArrays(
      meshData.type ? gl.TRIANGLE_STRIP : gl.TRIANGLES,
      0,
      mesh.length / vertexSize
    );
  }

  function drawLine(x, y, z, color = [1, 0.5, 1]) {
    let meshData = { type: 1, color: color, mesh: new Float32Array(cylinder(20, 20)) };

    let m = startMatrix;
    if (x != 0 || y != 0) {
      m = mRotateX(Math.PI / 2, m);
      m = mRotateY(Math.PI / 2, m);
      let angleval = Math.atan(y / x);
      if (x < 0) {
        angleval += Math.PI;
      }
      m = mRotateY(angleval, m);
      m = mRotateX(Math.atan(-z / Math.sqrt(x * x + y * y)), m);
    }
    m = mScale(0.01, 0.01, .5, m);
    m = mScale(1, 1, Math.sqrt(x * x + y * y + z * z), m);

    m = mTranslate(0, 0, 1, m);

    glDraw(meshData, m);
    // m = mPerspective(1.5, m);
  }

  function drawSphere(x, y, z, r = 1, color = [1, 0.5, 1]) {
    const meshData = {type:1, color:color, mesh: new Float32Array(sphere(20, 20))};
    r = r / 100;
    let m = startMatrix;
    m = mTranslate(x, y, z, m);
    m = mScale(r, r, r, m);
    glDraw(meshData, m);
  }

  setInterval(() => {
    let time = Date.now() / 1000 - startTime;

    const k = time;

    drawLine(0, 0, 1, [0, 1, 1]);
    drawLine(0, 1, 0, [0, 1, 0]);
    drawLine(1, 0, 0, [1, 0, 0]);
    drawLine(1 / 2, 1 / 2, 1 / 2);
    drawSphere(1 / 2, 1 / 2, 1 / 2, 3);

    drawLine(1/3, 1/2, 1/6);
    drawSphere(1/3, 1/2, 1/6, 3);

    /* or (let n = 0; n < meshData.length; n++) {
      let m = startMatrix;
      m = mScale(0.1, 0.1, 0.1, m);

      gl.uniform3fv(uColor, meshData[n].color);
      gl.uniformMatrix4fv(uMatrix, false, m);
      gl.uniformMatrix4fv(uInvMatrix, false, mInverse(m));
      let r3 = Math.sqrt(1 / 3);
      // gl.uniform3fv(uLC, [1, 1, 1, 0.3, 0.2, 0.1]);
      // gl.uniform3fv(uLD, [r3, r3, r3, -r3, -r3, -r3]);
      gl.uniform3fv(uLC, [1, 1, 1]);
      gl.uniform3fv(uLD, [r3, r3, r3]);

      let mesh = meshData[n].mesh;
      gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
      gl.drawArrays(
        meshData[n].type ? gl.TRIANGLE_STRIP : gl.TRIANGLES,
        0,
        mesh.length / vertexSize
      );
    } */
  }, 10);
}, 100);
