// Start a static server at the repository root before running this script.
const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
      : {}),
    args: ["--use-angle=swiftshader"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(process.env.VIEWER_URL || "http://127.0.0.1:8130/viewer/");
    await page.waitForSelector("[data-ready]");
    const ids = await page.evaluate(async () =>
      (await import("./model.js")).flavors.map((f) => f.id),
    );
    const output = path.resolve(__dirname, "../models");
    await fs.mkdir(output, { recursive: true });
    for (const id of ids) {
      const base64 = await page.evaluate(async (id) => {
        const { flavors, createContainer } = await import("./model.js");
        const { GLTFExporter } = await import("./vendor/GLTFExporter.js");
        const { group } = await createContainer(
          flavors.find((f) => f.id === id),
        );
        const copy = group.clone(true);
        copy.getObjectByName("Removable foil lid").position.y = 1.058;
        copy.getObjectByName("Removable foil lid").rotation.z = 0;
        const data = await new GLTFExporter().parseAsync(copy, {
          binary: true,
        });
        const bytes = new Uint8Array(data);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192)
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        return btoa(binary);
      }, id);
      await fs.writeFile(
        path.join(output, `${id}.glb`),
        Buffer.from(base64, "base64"),
      );
      console.log(`Exported ${id}.glb`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
