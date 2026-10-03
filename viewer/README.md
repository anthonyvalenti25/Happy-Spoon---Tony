# Happy Spoon 3D studio

Open `/viewer/` from any static server serving the repository root. No build step,
external CDN, account, or runtime package installation is needed. Three.js 0.180.0
and its MIT license are included in `vendor/`.

```sh
python3 -m http.server 8130 --bind 127.0.0.1
```

Visit http://127.0.0.1:8130/viewer/.

Drag or swipe to orbit the entire container; scroll or pinch to zoom. The Front,
Back, Nutrition, Lid, and Base buttons provide inspection views. Lift the lid to
inspect the interior. Keyboard users can focus the canvas and use the arrow keys, plus/minus,
and Home. Auto spin is opt-in. Each flavor also has a downloadable, self-contained
GLB in `assets/<flavor>/`, including embedded textures and a separately named lid mesh.

## Artwork and geometry

`model.js` builds the tapered cup, rolled lip, foil lid and pull tab, internal wall,
yogurt surface, and recessed base. The front texture is reprojected from the
repository's original flavor images in `assets/<flavor>/`. The original front photography
limits texture sharpness and contains baked-in lighting. Back, lid, base, and
interior are concept reconstructions, not verified production artwork. Dimensions
are approximate proportions, not manufacturing measurements. The nutrition panel
uses fictional values solely to demonstrate the packaging layout. Its mock-data disclosure is embedded in the texture and exported GLBs.
It must not be used as real product nutrition information. The original back
copy is preserved inside a cream badge, with opaque flavor artwork continuing
around both sides and a continuous colored base ribbon.

Flavor colors and crop calibration are in `model.js`. `studio.js` manages the
viewer and input controls; `studio.css` handles the responsive layout.

## Validation and model exports

Development scripts use Playwright with Chromium. Install it outside the site:

```sh
npm install --prefix /tmp/happy-spoon-tools playwright
/tmp/happy-spoon-tools/node_modules/.bin/playwright install chromium
```

With the server running, execute:

```sh
NODE_PATH=/tmp/happy-spoon-tools/node_modules node viewer/tools/check-viewer.cjs
NODE_PATH=/tmp/happy-spoon-tools/node_modules node viewer/tools/export-models.cjs
```

`VIEWER_URL` optionally sets another server URL; `CHROMIUM_EXECUTABLE` optionally
selects an installed Chromium binary. Re-export all GLBs after changing model
geometry or textures. The checker verifies five distinct rendered flavors, GLB
structure and embedded images, camera views, lid movement, zoom, mouse rotation,
keyboard rotation, auto spin, mobile layout and touch selection, and the WebGL
fallback. Screenshots are written to `/tmp/`.
