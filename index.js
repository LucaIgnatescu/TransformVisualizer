import { DrawContext } from "./graph.js";
import { m3Identity, m3Inverse, vColumnLeftMultiply } from "./matrix.js";

{
  function updatePoints(points) {
    document.querySelector("#points").innerHTML = points
      .map(
        (vec, i) =>
          `\\(\\vec{v_{${i}}}=\\begin{bmatrix}${vec[0] * 10} \\\\ ${
            vec[1] * 10
          } \\\\${vec[2] * 10} \\end{bmatrix}\\)`
      )
      .join(" ");
    MathJax.typeset();
  }
  const canvas = document.getElementById("canvas1");
  const draw = new DrawContext(canvas);

  let points = [];

  draw.addLine([0.1, 0.2, 0.3]);
  draw.addPoint([0.1, 0.2, 0.3]);
  draw.startDraw();

  document.querySelector(".resetCameraButton").onclick = () =>
    draw.resetCamera();
  // document.querySelector(".resetTransformButton").onclick = () => draw.resetTransform();
  document.querySelector(".resetObjectsButton").onclick = () => {
    draw.resetObjects();
    points = [];
    updatePoints(points);
  };

  document.querySelector("#addPoint").addEventListener("submit", (evt) => {
    evt.preventDefault();
    const data = new FormData(evt.target);
    const vec = [...data.entries()].map((val) => +val[1] / 10);

    points.push(vec);
    draw.addPoint(vec);
    draw.addLine(vec);

    updatePoints(points);
  });
}

{
  const canvas = document.querySelector("#linearTransformations");
  const draw = new DrawContext(canvas);

  document.querySelector(".resetObjectsButton").onclick = () => {
    draw.resetObjects();
    points = [];
    updatePoints(points);
  };
  draw.startDraw();

  const m = [1, 0, 0, 1, 1, 0.5, 0, 0.5, 0.5];
  let A = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  let vec = [0, 0, 0];
  document.querySelector("#basis").onsubmit = (evt) => {
    evt.preventDefault();
    const vals = [...new FormData(evt.target).entries()].map((val) => +val[1]);

    const e1 = vals.slice(0, 3);
    const e2 = vals.slice(3, 6);
    const e3 = vals.slice(6);

    A = vals.map((val, i) => vals[(i % 3) * 3 + Math.floor(i / 3)]);

    draw.interpolateTransform(A, 2);
  };

  document.querySelector("#addPoint1").onsubmit = (evt) => {
    evt.preventDefault();
    const data = new FormData(evt.target);
    draw.resetObjects();
    vec = [...data.entries()].map((val) => +val[1]);
    const res = vColumnLeftMultiply(A, vec);
    draw.addLine(
      res,
      [0, 0, 0],
      [Math.random(), Math.random(), Math.random()],
      1,
      false
    );
  };

  document.querySelector("#btn3").onclick = () => {
    draw.interpolateTransform(m3Identity(), 2);

    const div = document.querySelector("#transformed");
    const pt = vColumnLeftMultiply(A, vec).map((pt) => pt.toPrecision(2));
    div.innerHTML = `\\(\\vec{v}=\\begin{bmatrix}${pt[0]} \\\\ ${pt[1]} \\\\${pt[2]} \\end{bmatrix}\\)`;
    MathJax.typeset();
  };
}

{
  const canvas = document.querySelector("#canvas3");
  const draw = new DrawContext(canvas, true);
  document.querySelector(".resetObjectsButton").onclick = () => {
    draw.resetObjects();
    points = [];
    updatePoints(points);
  };
  draw.startDraw();

  console.log(canvas);

  document.querySelector("#shape").onchange = (evt) => {
    if (evt.target.value === "placeholder") return;
    const val = evt.target.value;

    draw.resetObjects();

    switch (val) {
      case "torus":
        draw.addTorus();
        break;
      case "sphere":
        draw.addPoint([0, 0, 0], 10, [0.5, 0.5, 1], true, true);
        break;
    }
  };
  document.querySelector("#basis1").onsubmit = (evt) => {
    evt.preventDefault();
    const vals = [...new FormData(evt.target).entries()].map((val) => +val[1]);

    const e1 = vals.slice(0, 3);
    const e2 = vals.slice(3, 6);
    const e3 = vals.slice(6);

    const A = vals.map((val, i) => vals[(i % 3) * 3 + Math.floor(i / 3)]);

    draw.interpolateTransform(A, 2);
  };
}
