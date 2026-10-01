import * as THREE from "three";

export const flavors = [
  {
    id: "chocolate-fudge",
    name: "Chocolate Fudge",
    lines: ["Chocolate", "Fudge"],
    word: "FUDGE",
    color: "#d9533b",
    tint: "#eee0d6",
    dark: "#4b2016",
    cream: "#f4e8ce",
    filling: "#4b2013",
    description: "Deep cocoa. Rich, creamy chocolate. Full dessert energy.",
    crop: [0.342, 0.925, 0.516, 0.535, 0.306, 0.192],
  },
  {
    id: "cookies-and-cream",
    name: "Cookies & Cream",
    lines: ["Cookies", "& Cream"],
    word: "COOKIES",
    color: "#3f8fd8",
    tint: "#dfe9ed",
    dark: "#22201d",
    cream: "#f6eedb",
    filling: "#eddfbe",
    description:
      "Creamy, cookie-specked happiness. A familiar favorite by the spoonful.",
    crop: [0.397, 0.945, 0.477, 0.48, 0.261, 0.17],
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    lines: ["Salted", "Caramel"],
    word: "CARAMEL",
    color: "#df941c",
    tint: "#f1e4cc",
    dark: "#894616",
    cream: "#f5e4be",
    filling: "#d6a65e",
    description:
      "Buttery caramel, a little salt, and a seriously smooth finish.",
    crop: [0.377, 0.943, 0.491, 0.493, 0.314, 0.205],
  },
  {
    id: "mint-chip",
    name: "Mint Chip",
    lines: ["Mint", "Chip"],
    word: "MINT",
    color: "#51b58d",
    tint: "#deebe0",
    dark: "#123751",
    cream: "#eeeacb",
    filling: "#c3d9a2",
    description:
      "Cool mint meets dark chocolate. Fresh, creamy, and full of little chips.",
    crop: [0.396, 0.934, 0.5, 0.512, 0.313, 0.225],
  },
  {
    id: "cookie-dough",
    name: "Cookie Dough",
    lines: ["Cookie", "Dough"],
    word: "DOUGH",
    color: "#8445b5",
    tint: "#e9dfed",
    dark: "#512479",
    cream: "#f4e7cd",
    filling: "#dac090",
    description:
      "Brown-sugar nostalgia, chocolate chips, and one-more-bite energy.",
    crop: [0.374, 0.946, 0.493, 0.51, 0.35, 0.228],
  },
];
const cache = new Map();
const material = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.42, ...extra });
function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function texture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function text(ctx, value, x, y, size, color = "#3b1d13", weight = 800) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(value, x, y);
}
function logo(ctx, x, y, scale, color, smileColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  text(ctx, "HAPPY", 0, 0, 100, color, 950);
  text(ctx, "SPOON", 0, 90, 100, color, 950);
  ctx.strokeStyle = smileColor;
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(15, 118);
  ctx.quadraticCurveTo(95, 171, 165, 113);
  ctx.stroke();
  ctx.restore();
}
async function imageFor(f) {
  const im = new Image();
  im.src = `../new/img/${f.id}.webp`;
  await im.decode();
  return im;
}

// Reproject the photographed front onto the tapered cup, instead of wrapping the
// entire cutout (spoon, peeled foil and background) around a cylinder. Unseen
// surfaces are a distinct concept design, with no invented regulatory details.
function bodyTexture(f, im) {
  const w = 2048,
    h = 1024,
    c = canvas(w, h),
    ctx = c.getContext("2d");
  ctx.fillStyle = f.cream;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = f.dark;
  ctx.fillRect(0, 810, w, 180);
  ctx.fillStyle = f.color;
  ctx.fillRect(0, 785, w, 25);
  // Back panel straddles the UV seam. Render once and repeat on both edges.
  const back = canvas(620, h),
    b = back.getContext("2d");
  b.fillStyle = f.cream;
  b.fillRect(0, 0, 620, h);
  logo(b, 310, 210, 0.85, "#3b1d13", f.color);
  text(b, "A LITTLE CUP OF HAPPY.", 310, 465, 25, f.dark);
  text(b, "HIGH-PROTEIN", 310, 531, 21, f.dark, 600);
  text(b, "DESSERT YOGURT", 310, 565, 21, f.dark, 600);
  b.fillStyle = f.color;
  b.fillRect(115, 620, 390, 3);
  text(b, f.lines[0].toUpperCase(), 310, 699, 36, f.dark);
  text(b, f.lines[1].toUpperCase(), 310, 744, 36, f.dark);
  text(b, "PACKAGING CONCEPT", 310, 863, 19, f.dark, 500);
  text(b, "BACK ARTWORK TO BE FINALIZED", 310, 897, 15, f.dark, 500);
  ctx.drawImage(back, -310, 0);
  ctx.drawImage(back, w - 310, 0);
  // Blend the front artwork into the concept wrap at the side seams only.
  const src = canvas(im.width, im.height),
    s = src.getContext("2d", { willReadFrequently: true });
  s.drawImage(im, 0, 0);
  const pixels = s.getImageData(0, 0, im.width, im.height).data;
  const out = ctx.getImageData(0, 0, w, h),
    d = out.data;
  const [top, bottom, cxTop, cxBottom, rTop, rBottom] = f.crop;
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1),
      center = (cxTop + (cxBottom - cxTop) * v) * im.width,
      radius = (rTop + (rBottom - rTop) * v) * im.width;
    for (let x = 530; x < 1518; x++) {
      const a = (x / w - 0.5) * Math.PI * 2,
        side = Math.abs(a),
        alpha = Math.min(1, Math.max(0, (1.5 - side) / 0.21));
      if (!alpha) continue;
      const sy = Math.max(
        0,
        Math.min(
          im.height - 1,
          Math.round(
            (top +
              (bottom - top) * v -
              0.025 * (1 - Math.cos(a)) -
              0.012 * Math.sin(a)) *
              im.height,
          ),
        ),
      );
      const sx = Math.max(
        0,
        Math.min(im.width - 1, Math.round(center + Math.sin(a) * radius)),
      );
      const si = (sy * im.width + sx) * 4,
        di = (y * w + x) * 4,
        blend = (alpha * pixels[si + 3]) / 255;
      for (let k = 0; k < 3; k++)
        d[di + k] = pixels[si + k] * blend + d[di + k] * (1 - blend);
    }
  }
  ctx.putImageData(out, 0, 0);
  return texture(c);
}
function lidTexture(f) {
  const c = canvas(1024, 1024),
    ctx = c.getContext("2d");
  ctx.fillStyle = f.color;
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = f.cream;
  ctx.beginPath();
  ctx.arc(512, 512, 428, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = f.dark;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 2;
  for (let r = 457; r < 502; r += 8) {
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  logo(ctx, 512, 373, 1.45, "#3b1d13", f.color);
  text(ctx, f.name.toUpperCase(), 512, 684, 37, f.dark);
  text(ctx, "HIGH-PROTEIN DESSERT YOGURT", 512, 741, 20, f.dark, 600);
  text(ctx, "HAPPY SPOON", 512, 840, 16, f.dark, 600);
  return texture(c);
}
function fillingTexture(f) {
  const c = canvas(512, 512),
    ctx = c.getContext("2d");
  ctx.fillStyle = f.filling;
  ctx.fillRect(0, 0, 512, 512);
  let seed = 41;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 160; i++) {
    const x = rand() * 512,
      y = rand() * 512,
      r = rand() * 8 + 1;
    ctx.fillStyle =
      f.id === "chocolate-fudge"
        ? "#683323"
        : f.id === "salted-caramel"
          ? "#b87532"
          : "#483023";
    ctx.globalAlpha = 0.35 + rand() * 0.35;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + r, y + r * 0.3);
    ctx.lineTo(x + r * 0.7, y + r);
    ctx.lineTo(x - r * 0.4, y + r * 0.5);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return texture(c);
}
function addMesh(group, name, geo, mat, y = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.y = y;
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}
function ring(group, name, r, t, y, mat) {
  const m = addMesh(
    group,
    name,
    new THREE.TorusGeometry(r, t, 12, 128),
    mat,
    y,
  );
  m.rotation.x = Math.PI / 2;
  return m;
}
export async function createContainer(f) {
  if (cache.has(f.id)) return cache.get(f.id);
  const im = await imageFor(f),
    group = new THREE.Group();
  group.name = `Happy Spoon — ${f.name}`;
  group.userData = {
    flavor: f.name,
    note: "Concept reconstruction from front artwork. Back, lid and base illustrative. Geometry uses approximate proportions, not manufacturing dimensions.",
  };
  const plastic = material("#fff4db", { roughness: 0.29 }),
    foil = material("#dadbd8", { metalness: 0.8, roughness: 0.36 });
  addMesh(
    group,
    "Printed tapered cup",
    new THREE.CylinderGeometry(1.01, 0.79, 2.02, 128, 1, true, Math.PI),
    material("#ffffff", { map: bodyTexture(f, im), roughness: 0.52 }),
  );
  const inner = addMesh(
    group,
    "Inner cup wall",
    new THREE.CylinderGeometry(0.981, 0.766, 2.0, 128, 1, true),
    plastic,
  );
  inner.material = plastic.clone();
  inner.material.side = THREE.BackSide;
  ring(group, "Rolled upper rim", 1.016, 0.042, 1.018, plastic);
  ring(group, "Foot ring", 0.776, 0.037, -1.029, plastic);
  addMesh(
    group,
    "Recessed base",
    new THREE.CylinderGeometry(0.77, 0.77, 0.04, 128),
    plastic,
    -1.017,
  );
  ring(group, "Molded base detail", 0.59, 0.012, -1.043, plastic);
  const bottom = addMesh(
    group,
    "Base center",
    new THREE.CylinderGeometry(0.17, 0.17, 0.008, 48),
    plastic,
    -1.044,
  );
  const filling = addMesh(
    group,
    "Yogurt surface",
    new THREE.SphereGeometry(0.976, 96, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    material(f.filling, { map: fillingTexture(f), roughness: 0.32 }),
    0.936,
  );
  filling.scale.y = 0.052;
  const lid = new THREE.Group();
  lid.name = "Removable foil lid";
  lid.position.y = 1.058;
  group.add(lid);
  addMesh(
    lid,
    "Foil seal edge",
    new THREE.CylinderGeometry(1.047, 1.047, 0.012, 128),
    foil,
  );
  const printed = addMesh(
    lid,
    "Printed lid",
    new THREE.CircleGeometry(1.045, 128),
    material("#ffffff", {
      map: lidTexture(f),
      roughness: 0.38,
      metalness: 0.12,
    }),
    0.008,
  );
  printed.rotation.x = -Math.PI / 2;
  const underside = addMesh(
    lid,
    "Silver underside",
    new THREE.CircleGeometry(1.045, 128),
    foil,
    -0.008,
  );
  underside.rotation.x = Math.PI / 2;
  const tab = addMesh(
    lid,
    "Foil pull tab",
    new THREE.CylinderGeometry(0.18, 0.18, 0.012, 40),
    foil,
  );
  tab.scale.set(0.8, 1, 1.2);
  tab.position.set(0.76, 0, 0.76);
  const result = { group, lid };
  cache.set(f.id, result);
  return result;
}
