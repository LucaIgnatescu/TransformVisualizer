import { cylinder, octahedron, disk, torus, sphere } from "./shapes.js";
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
  mInverseRotateX,
  mInverseRotateY,
  v3Cross,
  vNormalize,
  vColumnLeftMultiply,
  mInverseTranslate,
  m3Augment,
} from "./matrix.js";

const NLIGHTS = 1;
const REFRESH = 10;
const initialTime = Date.now() / 1000;

const start_gl = (
  canvas,
  meshData,
  vertexSize,
  vertexShader,
  fragmentShader
) => {
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

export class DrawContext {
  constructor(canvas, grid = true) {
    this.REFRESH = 10;
    this.canvas = canvas;
    this.clicked = false;
    this.pos = [];
    this.startMatrix = [
      -0.5393454337097476, -0.23837166032092533, 0.7461015545494831, 0,
      0.7831850922739353, -0.152013876480129, 0.5175857103960809, 0,
      -0.01047327003224925, 0.9079938369406345, 0.28252358786746967, 0, 0, 0, 0,
      1,
    ];
    this.transform = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    this.objects = [];

    this.gl = start_gl(
      this.canvas,
      null,
      vertexSize,
      vertexShader,
      fragmentShader
    );

    let gl = this.gl;
    //let uFL = gl.getUniformLocation(gl.program, "uFl");
    // let uTime = gl.getUniformLocation(gl.program, "uTime");
    this.uLD = gl.getUniformLocation(gl.program, "uLD");
    this.uLC = gl.getUniformLocation(gl.program, "uLC");

    // let uSphere = gl.getUniformLocation(gl.program, "uSphere");
    // let uAmbient = gl.getUniformLocation(gl.program, "uAmbient");
    // let uDiffuse = gl.getUniformLocation(gl.program, "uDiffuse");
    // let uSpecular = gl.getUniformLocation(gl.program, "uSpecular");

    this.uColor = gl.getUniformLocation(gl.program, "uColor");
    this.uMatrix = gl.getUniformLocation(gl.program, "uMatrix");
    this.uInvMatrix = gl.getUniformLocation(gl.program, "uInvMatrix");

    this.startTime = Date.now() / 1000;
    const canvas1 = this.canvas;
    const { width, height } = canvas1.getBoundingClientRect();
    canvas1.onmousedown = (event) => {
      this.clicked = true;
      this.pos = [event.clientX, event.clientY];
    };

    canvas1.onmouseup = (event) => {
      this.clicked = false;
      this.pos = [];
    };

    canvas1.onmousemove = (event) => {
      if (!this.clicked) return;

      const rotationSpeed = 2;

      const [moveX, moveY] = [
        this.pos[0] - event.clientX,
        this.pos[1] - event.clientY,
      ];
      this.pos = [event.clientX, event.clientY];
      this.startMatrix = mInverseRotateX(
        (Math.PI / height) * moveY,
        this.startMatrix
      );
      this.startMatrix = mInverseRotateY(
        (Math.PI / width) * moveX,
        this.startMatrix
      );
    };

    canvas1.onkeydown = (event) => {
      switch (event.key) {
        case "w":
          this.startMatrix = mScale(1.1, 1.1, 1.1, this.startMatrix);
          break;
        case "s":
          this.startMatrix = mScale(0.9, 0.9, 0.9, this.startMatrix);
          break;
      }
    };

    if (grid) {
      this.addGrid();
    }
  }

  resetCamera() {
    this.startMatrix = mIdentity();
  }

  resetTransform() {
    this.transform = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  glDraw(meshData, m) {
    this.gl.uniform3fv(this.uColor, meshData.color);
    this.gl.uniformMatrix4fv(this.uMatrix, false, m);
    this.gl.uniformMatrix4fv(this.uInvMatrix, false, mInverse(m));
    let r3 = Math.sqrt(1 / 3);
    // gl.uniform3fv(uLC, [1, 1, 1, 0.3, 0.2, 0.1]);
    // gl.uniform3fv(uLD, [r3, r3, r3, -r3, -r3, -r3]);
    this.gl.uniform3fv(this.uLC, [1, 1, 1]);
    this.gl.uniform3fv(this.uLD, [r3, r3, r3]);

    let mesh = meshData.mesh;
    this.gl.bufferData(this.gl.ARRAY_BUFFER, mesh, this.gl.STATIC_DRAW);
    this.gl.drawArrays(
      meshData.type ? this.gl.TRIANGLE_STRIP : this.gl.TRIANGLES,
      0,
      mesh.length / vertexSize
    );
  }

  drawLine(
    p1,
    p2 = [0, 0, 0],
    color = [0.5, 0.5, 1],
    width = 1,
    transform = true
  ) {
    let time = Date.now() / 1000 - initialTime;
    if (transform) {
      p1 = vColumnLeftMultiply(this.transform, p1);
      p2 = vColumnLeftMultiply(this.transform, p2);
    }
    let meshData = {
      type: 1,
      color: color,
      mesh: new Float32Array(cylinder(20, 20)),
    };

    let [x, y, z] = p1;
    const [x1, y1, z1] = p2;
    x -= x1;
    y -= y1;
    z -= z1;

    let m = this.startMatrix;
    m = mTranslate(x1, y1, z1, m);
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
    const norm = Math.sqrt(x * x + y * y + z * z);
    const norm1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);

    m = mScale(0.01 * width, 0.01 * width, 0.5, m);
    m = mScale(1, 1, norm, m);
    m = mTranslate(0, 0, 1, m);
    this.glDraw(meshData, m);
  }

  addGrid(transform = true, width = 1) {
    this.addLine([1, 0, 0], [0, 0, 0], [1, 0, 0], width, transform);
    this.addLine([0, 1, 0], [0, 0, 0], [0, 1, 0], width, transform);
    this.addLine([0, 0, 1], [0, 0, 0], [0, 0, 1], width, transform);
    this.addPoint([0, 0, 0], 1);
  }

  drawSphere(
    p,
    r = 2,
    color = [1, 1, 1],
    transform = true,
    transformBasis = false
  ) {
    if (transform) {
      p = vColumnLeftMultiply(this.transform, p);
    }
    const [x, y, z] = p;
    const meshData = {
      type: 1,
      color: color,
      mesh: new Float32Array(sphere(20, 20)),
    };
    r = r / 100;
    let m = this.startMatrix;
    m = mTranslate(x, y, z, m);
    m = mScale(r, r, r, m);
    if (transformBasis) m = matrixMultiply(m, m3Augment(this.transform));
    this.glDraw(meshData, m);
  }

  drawPlane(p1, p2, p3 = [0, 0, 0], color = [1, 0.5, 0.5], transform = true) {
    if (transform) {
      [p1, p2, p3] = [p1, p2, p3].map((v) =>
        vColumnLeftMultiply(this.transform, v)
      );
    }
    const x1 = p2.map((item, index) => item - p1[index]);
    const x2 = p3.map((item, index) => item - p1[index]);
    const normal = vNormalize(v3Cross(x1, x2)); //there is a chance this might be inverted; check when adding lighting

    const meshData = {
      type: 1,
      color: color,
      mesh: new Float32Array(
        [
          [...p1, ...normal],
          [...p2, ...normal],
          [...p3, ...normal],
        ].flat()
      ),
    };
    let m = this.startMatrix;
    this.glDraw(meshData, m);
  }

  drawTorus(center = [0, 0, 0], color = [0.5, 0.5, 1], transform = true) {
    if (transform) center = vColumnLeftMultiply(this.transform, center);
    const meshData = {
      type: 1,
      color: color,
      mesh: new Float32Array(torus(40, 40)),
    };
    let m = this.startMatrix;
    m = mScale(0.1, 0.1, 0.1, m);
    m = matrixMultiply(m, m3Augment(this.transform));
    this.glDraw(meshData, m);
  }

  interpolateTransform(result, time, f = (x) => x) {
    const repetitions = (1000 / REFRESH) * time;
    let counter = 1;
    const original = this.transform.map((x) => x);

    const id = setInterval(() => {
      if (counter === repetitions) {
        window.clearInterval(id);
        this.transform = result;
      }
      let t = counter / repetitions;

      this.transform = this.transform.map(
        (v, i) => original[i] * (1 - f(t)) + result[i] * f(t)
      );
      counter++;
    }, REFRESH);
  }

  drawObject({ type, params }) {
    switch (type) {
      case "line":
        this.drawLine(...params);
        break;
      case "point":
        this.drawSphere(...params);
        break;
      case "plane":
        this.drawPlane(...params);
        break;
      case "torus":
        this.drawTorus(...params);
    }
  }

  addTorus(center = [0, 0, 0], color = [0.5, 0.5, 1], transform = true) {
    this.objects.push({
      type: "torus",
      params: [center, color, transform],
    });
  }

  addLine(
    p1,
    p2 = [0, 0, 0],
    color = [0.5, 0.5, 1],
    width = 1,
    transform = true
  ) {
    this.objects.push({
      type: "line",
      params: [p1, p2, color, width, transform],
    });
  }

  addPoint(
    p,
    r = 2,
    color = [1, 1, 1],
    transform = true,
    transformBasis = false
  ) {
    this.objects.push({
      type: "point",
      params: [p, r, color, transform, transformBasis],
    });
  }

  addPlane(p1, p2, p3 = [0, 0, 0], color = [1, 0.5, 0.5], transform = true) {
    this.objects.push({
      type: "plane",
      params: [p1, p2, p3, color, transform],
    });
  }

  startDraw() {
    this.id = setInterval(() => {
      this.objects.forEach((object) => this.drawObject(object));
    }, REFRESH);
  }

  resetObjects() {
    this.objects = [];
    this.addGrid();
  }

  stopDraw() {
    if (!this.id) return;
    window.clearInterval(this.id);
    this.id = null;
  }
}
