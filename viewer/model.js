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

// Reproject the original front and reflect its outer artwork around the sides.
// The print remains opaque across the entire circumference; back and nutrition
// panels are intentional printed shapes, rather than a fade into an empty wrap.
function bodyTexture(f, im) {
  const w = 2048,
    h = 1024,
    c = canvas(w, h),
    ctx = c.getContext("2d");
  ctx.fillStyle = f.cream;
  ctx.fillRect(0, 0, w, h);
  const src = canvas(im.width, im.height);
  const s = src.getContext("2d", { willReadFrequently: true });
  s.drawImage(im, 0, 0);
  const pixels = s.getImageData(0, 0, im.width, im.height).data;
  const out = ctx.getImageData(0, 0, w, h),
    d = out.data;
  const [top, bottom, cxTop, cxBottom, rTop, rBottom] = f.crop;
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    const center = (cxTop + (cxBottom - cxTop) * v) * im.width;
    const radius = (rTop + (rBottom - rTop) * v) * im.width;
    for (let x = 0; x < w; x++) {
      const angle = (x / w - 0.5) * Math.PI * 2;
      const side = Math.abs(angle);
      // Keep the photographed face intact. Continue its ingredient artwork on
      // both flanks; the central lettering on the return is covered by the back.
      const a =
        Math.sign(angle) * (side <= 1.46 ? side : 1.46 - (side - 1.46) * 0.58);
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
        di = (y * w + x) * 4;
      // Source transparency only, never an angle-dependent fade.
      const alpha = pixels[si + 3] / 255;
      for (let k = 0; k < 3; k++)
        d[di + k] = pixels[si + k] * alpha + d[di + k] * (1 - alpha);
    }
  }
  ctx.putImageData(out, 0, 0);

  // A continuous flavor-color ribbon ties the photographic wrap together at
  // the base, including the UV seam at the center of the back.
  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.moveTo(0, 947);
  for (let x = 0; x <= w; x += 8)
    ctx.lineTo(x, 958 + 13 * Math.cos((x / w) * Math.PI * 4));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = f.cream;
  ctx.fillRect(0, 1010, w, 14);

  // Keep the side ribbon narrow so the flavor artwork remains the main feature.
  // Scale the ribbon horizontally without distorting the lettering or smile.
  ctx.save();
  ctx.translate(494, 0);
  ctx.scale(0.62, 1);
  ctx.translate(-494, 0);
  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.moveTo(315, 0);
  ctx.lineTo(690, 0);
  ctx.bezierCurveTo(590, 275, 635, 605, 670, h);
  ctx.lineTo(310, h);
  ctx.bezierCurveTo(380, 690, 325, 340, 315, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(494, 520);
  ctx.rotate(-Math.PI / 2);
  text(ctx, f.lines[0].toUpperCase(), 0, -13, 49, f.cream, 800);
  text(ctx, f.lines[1].toUpperCase(), 0, 45, 49, f.cream, 800);
  ctx.restore();
  // Filled, asymmetric smile traced from the front brand mark: a fine left
  // tip and a broad, lifted right end, reversed in cream on the flavor color.
  ctx.save();
  ctx.translate(425, 817);
  ctx.scale(0.86, 0.86);
  ctx.fillStyle = f.cream;
  // The two chunky, open O shapes from SPOON become the face's eyes.
  // Cut out the centers so the flavor color shows through each letter.
  for (const [x, y, tilt] of [[49, -28, -0.1], [108, -30, 0.08]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, 19, 24, tilt, 0, Math.PI * 2);
    ctx.ellipse(x, y, 7, 11, tilt, 0, Math.PI * 2);
    ctx.fill("evenodd");
  }
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.bezierCurveTo(3, 10, 10, 12, 16, 15);
  ctx.bezierCurveTo(50, 31, 68, 41, 98, 16);
  ctx.bezierCurveTo(126, -4, 151, -3, 158, 5);
  ctx.bezierCurveTo(168, 18, 142, 44, 111, 48);
  ctx.bezierCurveTo(72, 56, 26, 34, 4, 24);
  ctx.bezierCurveTo(0, 22, -3, 18, 0, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Keep the back story and hierarchy, now on a bordered cream badge with
  // flavor artwork visible around every edge. Split exactly at the UV seam.
  const back = canvas(560, h),
    b = back.getContext("2d");
  b.fillStyle = f.cream;
  b.strokeStyle = f.color;
  b.lineWidth = 6;
  b.beginPath();
  b.roundRect(12, 55, 536, 890, 70);
  b.fill();
  b.stroke();
  logo(b, 280, 205, 0.8, "#3b1d13", f.color);
  text(b, "A LITTLE CUP OF HAPPY.", 280, 450, 25, f.dark);
  text(b, "HIGH-PROTEIN", 280, 516, 21, f.dark, 600);
  text(b, "DESSERT YOGURT", 280, 550, 21, f.dark, 600);
  b.fillStyle = f.color;
  b.fillRect(105, 601, 350, 3);
  text(b, f.lines[0].toUpperCase(), 280, 680, 36, f.dark);
  text(b, f.lines[1].toUpperCase(), 280, 726, 36, f.dark);
  text(b, "PACKAGING CONCEPT", 280, 839, 19, f.dark, 500);
  text(b, "BACK ARTWORK TO BE FINALIZED", 280, 872, 15, f.dark, 500);
  ctx.drawImage(back, -280, 0);
  ctx.drawImage(back, w - 280, 0);
  drawMockNutrition(ctx, 1458, 146, 300, 748, f);
  return texture(c);
}

// All values are fictional layout examples, identical for all five flavors.
// The disclosure is part of the texture, so it travels with exported GLB files.
function drawMockNutrition(ctx, x, y, width, height, f) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#fffdf5";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#201b17";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
  const label = (value, py, size = 19, bold = false, right = false) => {
    ctx.font = `${bold ? 800 : 500} ${size}px Arial, sans-serif`;
    ctx.textAlign = right ? "right" : "left";
    ctx.fillStyle = "#201b17";
    ctx.fillText(value, right ? width - 14 : 14, py);
  };
  const rule = (py, thick = 1) => {
    ctx.fillStyle = "#201b17";
    ctx.fillRect(12, py, width - 24, thick);
  };
  ctx.fillStyle = f.color;
  ctx.fillRect(3, 3, width - 6, 39);
  text(ctx, "MOCK • NOT PRODUCT DATA", width / 2, 29, 16, "#201b17", 800);
  label("Nutrition Facts", 86, 35, true);
  rule(100, 2);
  label("1 serving per container", 129, 19);
  label("Serving size", 158, 19, true);
  label("1 cup (170g)", 183, 20, true, true);
  rule(196, 10);
  label("Amount per serving", 233, 17, true);
  label("Calories", 277, 29, true);
  label("180", 277, 42, true, true);
  rule(291, 6);
  label("% Daily Value*", 322, 16, true, true);
  const rows = [
    ["Total Fat 5g", "6%", true],
    ["  Saturated Fat 3g", "15%"],
    ["  Trans Fat 0g", ""],
    ["Cholesterol 15mg", "5%", true],
    ["Sodium 95mg", "4%", true],
    ["Total Carb. 17g", "6%", true],
    ["  Dietary Fiber 1g", "4%"],
    ["  Total Sugars 10g", ""],
    ["  Incl. 4g Added Sugars", "8%"],
    ["Protein 17g", "", true],
  ];
  rows.forEach(([name, value, bold], i) => {
    const py = 351 + i * 28;
    rule(py - 21);
    label(name, py, 17, bold);
    if (value) label(value, py, 17, true, true);
  });
  rule(617, 7);
  label("*Illustrative values only.", 653, 17, true);
  label("Not measured or verified.", 679, 17);
  label("Not for dietary decisions.", 705, 17);
  ctx.restore();
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
    note: "Concept reconstruction from front artwork. Back, lid and base illustrative. Nutrition values are fictional mock data, not measured product information. Geometry uses approximate proportions, not manufacturing dimensions.",
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
