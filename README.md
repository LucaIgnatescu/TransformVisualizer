# Linear Transformation Visualizer

This project aims to provide a quick introduction to linear transformations and matrices, through three short lessons.

1. Visualizing how column vectors can express points.
2. Visualizing a change of coordinates with respect to a new basis.
3. Transforming objects by changing the basis.

## Deployment

The deployed version can be found on my [Courant](https://cims.nyu.edu/~li2058/graphics/final/) webpage. In addition, my other graphics projects and assignments can be viewed at [https://cims.nyu.edu/~li2058/graphics/](https://cims.nyu.edu/~li2058/graphics/).



## Implementation Details

The bulk of the logic is emcompassed by the `graph.js` file, which exports a `DrawContext` class. This provides an abstraction over WebGL, enabling the drawing of lines, points, and planes, as well as providing camera movements and transformation animations.

Each object has the ability to either be stationary or transform with the animation, and each `DrawContext` class maintains its own canvas and provides and optional xyz coordinate system.

Each object is fully Phong shaded, with configurable parameters in the GLSL scripts.

In addition, `MathJax` and vanilla Javascript are used to display Mathematical notation and handle user input and state. 



