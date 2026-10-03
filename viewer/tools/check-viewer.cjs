// Run with Playwright installed: node viewer/tools/check-viewer.cjs
// Start the repository's static server first; VIEWER_URL can override localhost.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const url = process.env.VIEWER_URL || "http://127.0.0.1:8130/viewer/";
const ids = [
  "chocolate-fudge",
  "cookies-and-cream",
  "salted-caramel",
  "mint-chip",
  "cookie-dough",
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
      : {}),
    args: ["--use-angle=swiftshader"],
  });
  const errors = [];
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(url);
    await page.waitForSelector('[data-ready="chocolate-fudge"]');
    const frame = async () => {
      await page.waitForTimeout(250);
      return page.locator("canvas").evaluate((canvas) => canvas.toDataURL());
    };
    const fronts = new Set();
    for (const id of ids) {
      await page.locator(`[data-flavor="${id}"]`).click();
      await page.waitForSelector(`[data-ready="${id}"]`);
      fronts.add(await frame());
      assert.equal(
        await page.locator('.flavor-option[aria-pressed="true"]').count(),
        1,
      );
      assert.match(
        await page.locator("#download").getAttribute("href"),
        new RegExp(`${id}.glb$`),
      );
      const response = await page.request.get(
        new URL(`../assets/${id}/${id}.glb`, url).href,
      );
      assert.equal(response.status(), 200);
      const glb = await response.body();
      assert.equal(glb.toString("ascii", 0, 4), "glTF");
      assert.equal(glb.readUInt32LE(4), 2);
      assert.equal(glb.readUInt32LE(8), glb.length);
      const json = JSON.parse(
        glb.subarray(20, 20 + glb.readUInt32LE(12)).toString(),
      );
      assert.ok(json.nodes.some((n) => n.name === "Printed tapered cup"));
      assert.ok(json.nodes.some((n) => n.name === "Recessed base"));
      assert.ok(
        json.nodes.some((n) => n.extras?.note?.includes("fictional mock data")),
        "Downloaded models must retain the mock nutrition disclosure",
      );
      assert.ok(json.nodes.some((n) => n.name === "Removable foil lid"));
      assert.ok(
        json.images.length >= 3 &&
          json.images.every((i) => i.bufferView !== undefined),
      );
      assert.ok(json.meshes.length >= 10);
    }
    assert.equal(fronts.size, 5, "All five flavors should render distinctly");
    const views = new Set();
    for (const view of ["front", "back", "nutrition", "top", "base"]) {
      await page.locator(`[data-view="${view}"]`).click();
      views.add(await frame());
      assert.equal(
        await page
          .locator(`[data-view="${view}"]`)
          .getAttribute("aria-pressed"),
        "true",
      );
    }
    assert.equal(
      views.size,
      5,
      "Camera presets should show different surfaces",
    );
    await page.locator('[data-view="front"]').click();
    const closed = await frame();
    await page.locator("#lid").click();
    await page.waitForTimeout(700);
    assert.notEqual(await frame(), closed, "The lid should lift");
    assert.equal(
      await page.locator("#lid").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#reset").click();
    assert.equal(
      await page.locator("#lid").getAttribute("aria-pressed"),
      "false",
    );
    await page.waitForTimeout(700);
    const initial = await frame();
    await page.locator("#zoom-in").click();
    assert.notEqual(
      await frame(),
      initial,
      "Zoom should change the rendered image",
    );
    await page.locator("#reset").click();
    const beforeDrag = await frame();
    const box = await page.locator("canvas").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 180,
      box.y + box.height / 2 + 30,
      { steps: 15 },
    );
    await page.mouse.up();
    assert.notEqual(await frame(), beforeDrag, "Mouse dragging should rotate");
    await page.locator("#reset").click();
    await page.locator("#viewport").focus();
    const beforeKey = await frame();
    await page.keyboard.press("ArrowRight");
    assert.notEqual(await frame(), beforeKey, "Keyboard arrows should rotate");
    await page.locator("#spin").click();
    assert.equal(
      await page.locator("#spin").getAttribute("aria-pressed"),
      "true",
    );
    const spinFrame = await frame();
    assert.notEqual(await frame(), spinFrame, "Auto spin should animate");
    await page.locator("#spin").click();
    await page.locator("#reset").click();
    await page.screenshot({ path: "/tmp/happy-spoon-verified-desktop.png" });
    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    mobile.on("pageerror", (error) => errors.push(error.message));
    await mobile.goto(url);
    await mobile.waitForSelector('[data-ready="chocolate-fudge"]');
    assert.ok(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Mobile must not overflow horizontally",
    );
    await mobile.locator('[data-flavor="mint-chip"]').tap();
    await mobile.waitForSelector('[data-ready="mint-chip"]');
    await mobile.locator('[data-view="base"]').tap();
    assert.equal(
      await mobile.locator('[data-view="base"]').getAttribute("aria-pressed"),
      "true",
    );
    await mobile.locator('[data-view="nutrition"]').tap();
    assert.equal(await mobile.locator('[data-view="nutrition"]').getAttribute("aria-pressed"), "true");
    await mobile.locator("#reset").tap();
    await mobile.evaluate(() => scrollTo(0, 0));
    await mobile.waitForTimeout(400);
    await mobile.screenshot({
      path: "/tmp/happy-spoon-verified-mobile.png",
      fullPage: true,
    });
    const fallback = await browser.newPage();
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return type.includes("webgl")
          ? null
          : original.call(this, type, ...args);
      };
    });
    await fallback.goto(url);
    await fallback.waitForFunction(() =>
      document.querySelector("#loading").textContent.includes("needs WebGL"),
    );
    assert.equal(await fallback.locator("#spin").isDisabled(), true);
    await fallback.locator('[data-flavor="cookie-dough"]').click();
    assert.match(
      await fallback.locator("#download").getAttribute("href"),
      /cookie-dough/,
    );
    assert.deepEqual(errors, [], "No application errors or missing assets");
    console.log(
      "PASS: five distinct flavors and embedded GLB models; five camera views; lid; reset; zoom; drag; keyboard; auto spin; mobile layout/touch selection; reduced motion; WebGL fallback.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
