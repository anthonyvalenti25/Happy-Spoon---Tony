import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { flavors, createContainer } from "./model.js";

const $ = (s) => document.querySelector(s),
  viewport = $("#viewport"),
  loading = $("#loading");
let renderer,
  controls,
  current,
  request = 0,
  open = false,
  spin = false,
  frame = 0,
  last = 0;
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function fail(message) {
  loading.textContent = message;
  viewport.style.display = "none";
  document
    .querySelectorAll(".zoom-tools button,.view-buttons button,#spin,#lid")
    .forEach((b) => (b.disabled = true));
}
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewport.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.085;
  controls.enablePan = false;
  controls.minDistance = 3.3;
  controls.maxDistance = 10;
  controls.minPolarAngle = 0.001;
  controls.maxPolarAngle = Math.PI - 0.001;
  controls.autoRotateSpeed = 0.7;
  controls.target.set(0, 0.1, 0);
  camera.position.set(0, 1.55, 6.4);
  controls.update();
} catch (error) {
  fail(
    "The 3D viewer needs WebGL. Try an up-to-date browser with graphics acceleration enabled.",
  );
  console.error(error);
}
function view(name) {
  if (!controls) return;
  stopSpin();
  controls.reset();
  controls.target.set(0, 0.1, 0);
  const positions = {
    front: [0, 1.55, 6.4],
    back: [0, 1.2, -6.4],
    nutrition: [6.15, 0.9, -1.77],
    top: [0, 6.6, 0.001],
    base: [0, -6.5, 0.001],
  };
  camera.position.set(...positions[name]);
  controls.update();
  document
    .querySelectorAll("[data-view]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.view === name)),
    );
}
function stopSpin() {
  spin = false;
  if (controls) controls.autoRotate = false;
  $("#spin").setAttribute("aria-pressed", "false");
}
function zoom(factor) {
  if (!controls) return;
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(
    THREE.MathUtils.clamp(
      offset.length() * factor,
      controls.minDistance,
      controls.maxDistance,
    ),
  );
  camera.position.copy(controls.target).add(offset);
  controls.update();
}
async function select(f) {
  const ticket = ++request;
  document.documentElement.style.setProperty("--accent", f.color);
  document.documentElement.style.setProperty("--tint", f.tint);
  $("#flavor-name").replaceChildren(
    ...f.lines.flatMap((line, i) =>
      i
        ? [
            document.createTextNode(" "),
            document.createElement("br"),
            document.createTextNode(line),
          ]
        : [document.createTextNode(line)],
    ),
  );
  $("#flavor-description").textContent = f.description;
  $("#background-word").textContent = f.word;
  $("#stage-number").textContent = `0${flavors.indexOf(f) + 1} / 05`;
  $("#download").href = `../assets/${f.id}.glb`;
  viewport.setAttribute(
    "aria-label",
    `${f.name} 3D container. Drag to rotate, scroll to zoom. Arrow keys rotate; plus and minus zoom.`,
  );
  document
    .querySelectorAll(".flavor-option")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.flavor === f.id)),
    );
  history.replaceState(null, "", `#${f.id}`);
  if (!renderer) return;
  loading.textContent = "Preparing your spoonful…";
  try {
    const model = await createContainer(f);
    if (ticket !== request) return;
    if (current) scene.remove(current.group);
    current = model;
    scene.add(current.group);
    current.lid.position.y = open ? 1.83 : 1.058;
    loading.textContent = "";
    viewport.dataset.ready = f.id;
  } catch (error) {
    if (ticket === request)
      loading.textContent =
        "This flavor could not load. Select it again to retry.";
    console.error(error);
  }
}
flavors.forEach((f) => {
  const b = document.createElement("button");
  b.className = "flavor-option";
  b.dataset.flavor = f.id;
  b.setAttribute("aria-pressed", "false");
  const sw = document.createElement("span");
  sw.className = "swatch";
  sw.style.setProperty("--sw", f.color);
  const label = document.createElement("span");
  label.textContent = f.name;
  const check = document.createElement("span");
  check.className = "check";
  check.textContent = "✓";
  check.setAttribute("aria-hidden", "true");
  b.append(sw, label, check);
  b.addEventListener("click", () => select(f));
  $("#flavors").append(b);
});
if (renderer) {
  scene.add(new THREE.HemisphereLight("#fff9ed", "#c1ab94", 2.1));
  const key = new THREE.DirectionalLight("#fff6e7", 3.1);
  key.position.set(3, 5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = 0.025;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#dde9ff", 1.2);
  fill.position.set(-4, 2, 1);
  scene.add(fill);
  const rim = new THREE.DirectionalLight("#ffffff", 2.2);
  rim.position.set(0, 3, -4);
  scene.add(rim);
  // Floating contact shadow has no opaque floor, so the base stays inspectable.
  const sc = document.createElement("canvas");
  sc.width = sc.height = 256;
  const ctx = sc.getContext("2d"),
    gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 122);
  gradient.addColorStop(0, "rgba(57,36,19,.23)");
  gradient.addColorStop(0.55, "rgba(57,36,19,.10)");
  gradient.addColorStop(1, "rgba(57,36,19,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.3, 4.3),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(sc),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.1;
  scene.add(shadow);
  new ResizeObserver(() => {
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }).observe(viewport);
  controls.addEventListener("start", () => {
    stopSpin();
    document
      .querySelectorAll("[data-view]")
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
  });
  function animate(time) {
    frame = requestAnimationFrame(animate);
    const delta = Math.min((time - last) / 1000, 0.05);
    last = time;
    if (current) {
      const target = open ? 1.83 : 1.058;
      current.lid.position.y = reduce
        ? target
        : THREE.MathUtils.damp(current.lid.position.y, target, 8, delta);
      current.lid.rotation.z = reduce
        ? open
          ? -0.11
          : 0
        : THREE.MathUtils.damp(
            current.lid.rotation.z,
            open ? -0.11 : 0,
            8,
            delta,
          );
    }
    shadow.visible = camera.position.y > -0.5;
    controls.update(delta);
    renderer.render(scene, camera);
  }
  frame = requestAnimationFrame(animate);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  });
}
document
  .querySelectorAll("[data-view]")
  .forEach((b) => b.addEventListener("click", () => view(b.dataset.view)));
$("#zoom-in").addEventListener("click", () => zoom(0.85));
$("#zoom-out").addEventListener("click", () => zoom(1.18));
$("#reset").addEventListener("click", () => {
  open = false;
  $("#lid").setAttribute("aria-pressed", "false");
  $("#lid span").textContent = "Lift the lid";
  view("front");
});
$("#spin").addEventListener("click", () => {
  spin = !spin;
  if (controls) controls.autoRotate = spin;
  $("#spin").setAttribute("aria-pressed", String(spin));
});
$("#lid").addEventListener("click", () => {
  open = !open;
  $("#lid").setAttribute("aria-pressed", String(open));
  $("#lid span").textContent = open ? "Close the lid" : "Lift the lid";
});
viewport.addEventListener("keydown", (e) => {
  if (!controls) return;
  const arrows = {
    ArrowLeft: [-0.18, 0],
    ArrowRight: [0.18, 0],
    ArrowUp: [0, -0.18],
    ArrowDown: [0, 0.18],
  };
  if (arrows[e.key]) {
    e.preventDefault();
    stopSpin();
    const s = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(controls.target),
    );
    s.theta += arrows[e.key][0];
    s.phi = THREE.MathUtils.clamp(
      s.phi + arrows[e.key][1],
      0.001,
      Math.PI - 0.001,
    );
    camera.position.setFromSpherical(s).add(controls.target);
    controls.update();
  } else if (["+", "=", "-", "Home"].includes(e.key)) {
    e.preventDefault();
    if (e.key === "Home") view("front");
    else zoom(e.key === "-" ? 1.18 : 0.85);
  }
});
select(flavors.find((f) => f.id === location.hash.slice(1)) || flavors[0]);
