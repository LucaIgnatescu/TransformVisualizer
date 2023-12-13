export const mIdentity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export const mInverse = (m) => {
  let dst = [],
    det = 0,
    cofactor = (c, r) => {
      let s = (i, j) => m[((c + i) & 3) | (((r + j) & 3) << 2)];
      return (
        ((c + r) & 1 ? -1 : 1) *
        (s(1, 1) * (s(2, 2) * s(3, 3) - s(3, 2) * s(2, 3)) -
          s(2, 1) * (s(1, 2) * s(3, 3) - s(3, 2) * s(1, 3)) +
          s(3, 1) * (s(1, 2) * s(2, 3) - s(2, 2) * s(1, 3)))
      );
    };
  for (let n = 0; n < 16; n++) dst.push(cofactor(n >> 2, n & 3));
  for (let n = 0; n < 4; n++) det += m[n] * dst[n << 2];
  for (let n = 0; n < 16; n++) dst[n] /= det;
  return dst;
};

export const matrixMultiply = (a, b) => {
  let dst = [];
  for (let n = 0; n < 16; n++)
    dst.push(
      a[n & 3] * b[n & 12] +
        a[(n & 3) | 4] * b[(n & 12) | 1] +
        a[(n & 3) | 8] * b[(n & 12) | 2] +
        a[(n & 3) | 12] * b[(n & 12) | 3]
    );
  return dst;
};

export const vCross = (a, b) => {
  const [a1, a2, a3] = a,
    [b1, b2, b3] = b;
  return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1];
};

export const vNormalize = (a) => {
  const [x, y, z] = a;
  const norm = Math.sqrt(x * x + y * y + z * z);
  return a.map((x) => x * norm);
};

export const vColumnLeftMultiply = (m, v) => {
  const [a, b, c, d, e, f, g, h, i] = m;
  const [x, y, z] = v;
  return [a * x + b * y + c * z, d * x + e * y + f * z, g * x + h * y + i * z];
};

export const mTranslate = (tx, ty, tz, m) => {
  return matrixMultiply(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1]);
};

export const mRotateX = (theta, m) => {
  let c = Math.cos(theta),
    s = Math.sin(theta);
  return matrixMultiply(m, [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
};

export const mInverseRotateX = (theta, m) => {
  let c = Math.cos(theta),
    s = Math.sin(theta);
  return matrixMultiply(
    mInverse([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]),
    m
  );
};

export const mRotateY = (theta, m) => {
  let c = Math.cos(theta),
    s = Math.sin(theta);
  return matrixMultiply(m, [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
};

export const mInverseRotateY = (theta, m) => {
  let c = Math.cos(theta),
    s = Math.sin(theta);
  return matrixMultiply(
    mInverse([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]),
    m
  );
};

export const mRotateZ = (theta, m) => {
  let c = Math.cos(theta),
    s = Math.sin(theta);
  return matrixMultiply(m, [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
};

export const mScale = (sx, sy, sz, m) => {
  return matrixMultiply(m, [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]);
};

export const mPerspective = (fl, m) => {
  return matrixMultiply(m, [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    -1 / fl,
    0,
    0,
    0,
    1,
  ]);
};
