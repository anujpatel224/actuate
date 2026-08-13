const { nativeImage } = require('electron');

// Placeholder tray icon: a keyboard glyph (body outline + key grid + spacebar
// row), rendered in-process at high resolution and supersampled down for
// smooth anti-aliased edges. No binary asset has to ship with the repo.
// Swap for real artwork later via nativeImage.createFromPath() in tray.js.
function keyboardTrayIcon() {
  const SIZE = 64;
  const SUPERSAMPLE = 4;
  const buffer = Buffer.alloc(SIZE * SIZE * 4);

  const body = { x: 6, y: 15, w: 52, h: 36, r: 8 };
  const bodyStroke = 3.2;

  const keys = [];
  const cols = 8;
  const keyW = 3.6, keyH = 3.6, gapX = 1.9, gapY = 2.4;
  const gridW = cols * keyW + (cols - 1) * gapX;
  const startX = body.x + (body.w - gridW) / 2;
  let y = body.y + 6.5;
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < cols; c++) {
      keys.push({ x: startX + c * (keyW + gapX), y, w: keyW, h: keyH, r: 1 });
    }
    y += keyH + gapY;
  }
  const sideW = keyW * 1.3;
  const spaceW = gridW - sideW * 2 - gapX * 2;
  keys.push({ x: startX, y, w: sideW, h: keyH, r: 1 });
  keys.push({ x: startX + sideW + gapX, y, w: spaceW, h: keyH, r: 1 });
  keys.push({ x: startX + sideW + gapX + spaceW + gapX, y, w: sideW, h: keyH, r: 1 });

  function inRoundedRect(px, py, rx, ry, rw, rh, rad) {
    if (px >= rx + rad && px <= rx + rw - rad) return py >= ry && py <= ry + rh;
    if (py >= ry + rad && py <= ry + rh - rad) return px >= rx && px <= rx + rw;
    const cx = Math.min(Math.max(px, rx + rad), rx + rw - rad);
    const cy = Math.min(Math.max(py, ry + rad), ry + rh - rad);
    const dx = px - cx, dy = py - cy;
    return dx * dx + dy * dy <= rad * rad;
  }

  function covered(px, py) {
    const insideOuter = inRoundedRect(px, py, body.x, body.y, body.w, body.h, body.r);
    const insideInner = inRoundedRect(
      px, py,
      body.x + bodyStroke, body.y + bodyStroke,
      body.w - bodyStroke * 2, body.h - bodyStroke * 2,
      Math.max(body.r - bodyStroke, 0)
    );
    if (insideOuter && !insideInner) return true;
    return keys.some((k) => inRoundedRect(px, py, k.x, k.y, k.w, k.h, k.r));
  }

  for (let Y = 0; Y < SIZE; Y++) {
    for (let X = 0; X < SIZE; X++) {
      let hits = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          if (covered(X + (sx + 0.5) / SUPERSAMPLE, Y + (sy + 0.5) / SUPERSAMPLE)) hits++;
        }
      }
      const i = (Y * SIZE + X) * 4;
      buffer[i + 3] = Math.round((hits / (SUPERSAMPLE * SUPERSAMPLE)) * 255);
    }
  }

  // Rendered at 64x64 for clean supersampling, then downsized to actual tray
  // size — feeding the full-res buffer straight into Tray would display it
  // at 64x64 px, far larger than a menu bar/tray icon should be.
  const full = nativeImage.createFromBuffer(buffer, { width: SIZE, height: SIZE });
  const icon = full.resize({ width: 18, height: 18 });
  icon.setTemplateImage(true);
  return icon;
}

module.exports = { keyboardTrayIcon };
