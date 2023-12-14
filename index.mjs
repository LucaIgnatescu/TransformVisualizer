import { DrawContext } from "./graph.mjs";

const canvas = document.getElementById("canvas1");
const draw = new DrawContext(canvas);

document.querySelector("#reset").onclick = () => draw.resetCamera();
document.querySelector("#interpolate").onclick = () =>
  draw.interpolateTransform([1, 0, 0.5, 0.3, 1, 1, 1, 0.3, 1 / 2], 2);
document.querySelector("#resetTransform").onclick = () => draw.resetTransform();


const equation = [2, 3, 5, 10];
const [a,b,c,d] = equation;

setTimeout(() => {
  draw.addPoint([0, 0, 0]);

  draw.addLine([0, 0, 1], [0, 0, 0], [0, 1, 1], true);
  draw.addLine([0, 1, 0], [0, 0, 0], [0, 1, 0], true);
  draw.addLine([1, 0, 0], [0, 0, 0], [1, 0, 0], true);

  draw.addPlane([1 / 2, 1 / 2, 1 / 2], [1, 1, 0], [0, 1 / 2, 1]);

  draw.addLine([0, 0, 1], [0, 0, 0], [0, 1, 1], false, 0.5);
  draw.addLine([0, 1, 0], [0, 0, 0], [0, 1, 0], false, 0.5);
  draw.addLine([1, 0, 0], [0, 0, 0], [1, 0, 0], false, 0.5);

  // this.drawLine([0, 0, 1], [0, 0, 0], [0, 1, 1]);
  // this.drawLine([0, 1, 0], [0, 0, 0], [0, 1, 0]);
  // this.drawLine([1, 0, 0], [0, 0, 0], [1, 0, 0]);

  draw.startDraw();
});
