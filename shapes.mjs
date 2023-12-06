export const createMesh1 = (nu, nv, p) => {
  let mesh = [];
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      let u = i / nu,
        v = j / nv;
      let p00 = p(u, v);
      let p10 = p(u + 1 / nu, v);
      let p01 = p(u, v + 1 / nv);
      let p11 = p(u + 1 / nu, v + 1 / nv);
      mesh.push(p00, p10, p11);
      mesh.push(p11, p01, p00);
    }
  return mesh.flat();
};

export const createMesh = (nu, nv, p) => {
  let mesh = [];
  for (let j = nv; j > 0; j--) {
    for (let i = 0; i <= nu; i++)
      mesh.push(p(i / nu, j / nv), p(i / nu, j / nv - 1 / nv));
    mesh.push(p(1, j / nv - 1 / nv), p(0, j / nv - 1 / nv));
  }
  return mesh.flat();
};

export const sphere = (nu, nv) =>
  createMesh(nu, nv, (u, v) => {
    let theta = 2 * Math.PI * u;
    let phi = Math.PI * (v - 0.5);
    let x = Math.cos(phi) * Math.cos(theta),
      y = Math.cos(phi) * Math.sin(theta),
      z = Math.sin(phi);
    return [x, y, z, x, y, z];
  });

export const tube = (nu, nv) =>
  createMesh(nu, nv, (u, v) => {
    let theta = 2 * Math.PI * u;
    let x = Math.cos(theta),
      y = Math.sin(theta),
      z = 2 * v - 1;
    return [x, y, z, x, y, 0];
  });

export const disk = (nu, nv) =>
  createMesh(nu, nv, (u, v) => {
    let theta = 2 * Math.PI * u;
    let x = v * Math.cos(theta),
      y = v * Math.sin(theta);
    return [x, y, 0, 0, 0, 1];
  });

export const cylinder = (nu, nv) =>
  createMesh(nu, nv, (u, v) => {
    let theta = 2 * Math.PI * u;
    let x = Math.cos(theta),
      y = Math.sin(theta);
    switch ((5 * v) >> 0) {
      case 0:
        return [0, 0, -1, 0, 0, -1];
      case 1:
        return [x, y, -1, 0, 0, -1];
      case 2:
        return [x, y, -1, x, y, 0];
      case 3:
        return [x, y, 1, x, y, 0];
      case 4:
        return [x, y, 1, 0, 0, 1];
      case 5:
        return [0, 0, 1, 0, 0, 1];
    }
  });

export const torus = (nu, nv) =>
  createMesh(nu, nv, (u, v) => {
    let theta = 2 * Math.PI * u;
    let phi = 2 * Math.PI * v;
    let ct = Math.cos(theta),
      cp = Math.cos(phi);
    let st = Math.sin(theta),
      sp = Math.sin(phi);
    let x = (1 + 0.5 * cp) * ct,
      y = (1 + 0.5 * cp) * st,
      z = 0.5 * sp;
    return [x, y, z, cp * ct, cp * st, sp];
  });

export const hyperbolicParaboloid = (nu, nv) => 
  createMesh(nu, nv, (u, v) => {
    let x = u;
    let y = v;
    let z = x * x - y * y;
    let normalization = 1/Math.sqrt(4 * x * x + 4 * y * y + 1);
    return [x,y,z, -normalization * 2*x, normalization * 2 * y, normalization];   
  });

export const strToTris = (str) => {
  let tris = [];
  for (let n = 0; n < str.length; n++)
    switch (str.charAt(n)) {
      case "N":
        tris.push(-1);
        break;
      case "n":
        tris.push(-0.577);
        break;
      case "0":
        tris.push(0);
        break;
      case "p":
        tris.push(0.577);
        break;
      case "P":
        tris.push(1);
        break;
    }
  return tris;
};

export const cube = strToTris(`PNP00P PPP00P NPP00P  NPP00P NNP00P PNP00P
                      NPN00N PPN00N PNN00N  PNN00N NNN00N NPN00N
                      PPNP00 PPPP00 PNPP00  PNPP00 PNNP00 PPNP00
                      NNPN00 NPPN00 NPNN00  NPNN00 NNNN00 NNPN00
                      NPP0P0 PPP0P0 PPN0P0  PPN0P0 NPN0P0 NPP0P0
                      PNN0N0 PNP0N0 NNP0N0  NNP0N0 NNN0N0 PNN0N0`);

export const octahedron = strToTris(`00Nnnn 0N0nnn N00nnn  P00pnn 0N0pnn 00Npnn
                            N00npn 0P0npn 00Nnpn  00Nppn 0P0ppn P00ppn
                            00Pnnp 0N0nnp N00nnp  P00pnp 0N0pnp 00Ppnp
                            N00npp 0P0npp 00Pnpp  00Pppp 0P0ppp P00ppp`);