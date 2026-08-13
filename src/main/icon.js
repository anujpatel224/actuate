const { nativeImage } = require('electron');

// Placeholder tray icon: a simple keyboard glyph, generated in-process so no
// binary asset has to ship with the repo. Swap for real artwork later via
// nativeImage.createFromPath() in tray.js.
function keyboardTrayIcon() {
  const size = 32;
  const buffer = Buffer.alloc(size * size * 4);

  const set = (x, y, alpha) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buffer[i] = 0;
    buffer[i + 1] = 0;
    buffer[i + 2] = 0;
    buffer[i + 3] = alpha;
  };

  const left = 3, right = 28, top = 9, bottom = 23;
  for (let x = left; x <= right; x++) {
    set(x, top, 255);
    set(x, bottom, 255);
  }
  for (let y = top; y <= bottom; y++) {
    set(left, y, 255);
    set(right, y, 255);
  }

  for (let ky = top + 4; ky <= bottom - 4; ky += 4) {
    for (let kx = left + 4; kx <= right - 4; kx += 4) {
      set(kx, ky, 200);
    }
  }

  const image = nativeImage.createFromBuffer(buffer, { width: size, height: size });
  image.setTemplateImage(true);
  return image;
}

module.exports = { keyboardTrayIcon };
