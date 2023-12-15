import { DrawContext } from "./graph.js";

console.log(DrawContext);

const canvas = document.getElementById("canvas1");

const draw = new DrawContext(canvas);

draw.addPoint([0, 0, 0], 1);

draw.addPoint([0.1, 0.2, 0.3]);
draw.addLine([0.1, 0.2, 0.3]);

draw.addPoint([.4, .5, .8]);
draw.addLine([.4, .5, .8]);


// draw.addLine([.1, .2, .3], [.4, .5, .8]);

draw.addLine([.4, .5, .9], [.1, .2, .3]);
draw.startDraw();

document.querySelector(".resetCameraButton").onclick = () => draw.resetCamera();
document.querySelector(".interpolateButton").onclick = () =>
  draw.interpolateTransform([1, 0, 0.5, 0.3, 1, 1, 1, 0.3, 1 / 2], 2);
// document.querySelector(".resetTransformButton").onclick = () => draw.resetTransform();
document.querySelector(".resetObjectsButton").onclick = () =>
  draw.resetObjects();

console.log(document.querySelector("#addPoint"));
document.querySelector("#addPoint").addEventListener("submit", (evt) => {
  evt.preventDefault();
  const data = new FormData(evt.target);
  const vec = [...data.entries()].map((val) => +val[1]);

  draw.addPoint(vec);
  draw.addLine(vec);
});
