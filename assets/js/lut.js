// 3D LUT engine: parse Adobe/Resolve .cube files and apply them per pixel
// with trilinear interpolation. LUTs are fetched lazily — only the films
// that actually get recommended are ever downloaded.

const cache = new Map();

export function parseCube(text) {
  let size = 0;
  const values = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line[0] === "#") continue;
    if (line.startsWith("LUT_3D_SIZE")) { size = parseInt(line.split(/\s+/)[1], 10); continue; }
    if (/^[A-Za-z]/.test(line)) continue; // TITLE, DOMAIN_MIN, …
    const p = line.split(/\s+/).map(Number);
    if (p.length >= 3 && p.every((x) => !Number.isNaN(x))) values.push(p[0], p[1], p[2]);
  }
  if (!size || values.length !== size * size * size * 3) {
    throw new Error(`Malformed .cube (size ${size}, ${values.length / 3} entries)`);
  }
  return { size, data: Float32Array.from(values) };
}

export function loadLUT(id) {
  if (!cache.has(id)) {
    const p = fetch(`assets/luts/${id}.cube`)
      .then((r) => { if (!r.ok) throw new Error(`LUT ${id}: HTTP ${r.status}`); return r.text(); })
      .then(parseCube);
    p.catch(() => cache.delete(id)); // allow retry after a failed request
    cache.set(id, p);
  }
  return cache.get(id);
}

// Returns a new ImageData; the source is left untouched.
export function applyLUT(src, lut) {
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  const N = lut.size, max = N - 1, N2 = N * N, L = lut.data, s = src.data, o = out.data;
  for (let i = 0; i < s.length; i += 4) {
    const fr = (s[i] / 255) * max, fg = (s[i + 1] / 255) * max, fb = (s[i + 2] / 255) * max;
    const r0 = fr | 0, g0 = fg | 0, b0 = fb | 0;
    const r1 = r0 < max ? r0 + 1 : max, g1 = g0 < max ? g0 + 1 : max, b1 = b0 < max ? b0 + 1 : max;
    const dr = fr - r0, dg = fg - g0, db = fb - b0;
    // .cube order: red changes fastest, then green, then blue
    const i000 = (r0 + g0 * N + b0 * N2) * 3, i100 = (r1 + g0 * N + b0 * N2) * 3;
    const i010 = (r0 + g1 * N + b0 * N2) * 3, i110 = (r1 + g1 * N + b0 * N2) * 3;
    const i001 = (r0 + g0 * N + b1 * N2) * 3, i101 = (r1 + g0 * N + b1 * N2) * 3;
    const i011 = (r0 + g1 * N + b1 * N2) * 3, i111 = (r1 + g1 * N + b1 * N2) * 3;
    for (let c = 0; c < 3; c++) {
      const x00 = L[i000 + c] + (L[i100 + c] - L[i000 + c]) * dr;
      const x10 = L[i010 + c] + (L[i110 + c] - L[i010 + c]) * dr;
      const x01 = L[i001 + c] + (L[i101 + c] - L[i001 + c]) * dr;
      const x11 = L[i011 + c] + (L[i111 + c] - L[i011 + c]) * dr;
      const y0 = x00 + (x10 - x00) * dg, y1 = x01 + (x11 - x01) * dg;
      o[i + c] = (y0 + (y1 - y0) * db) * 255;
    }
  }
  return out;
}

export function toCanvas(imageData) {
  const cv = document.createElement("canvas");
  cv.width = imageData.width;
  cv.height = imageData.height;
  cv.getContext("2d").putImageData(imageData, 0, 0);
  return cv;
}

// Centre-crop an image element to a w×h ImageData.
export function cropToImageData(img, w, h) {
  const target = w / h, srcRatio = img.naturalWidth / img.naturalHeight;
  let sw = img.naturalWidth, sh = img.naturalHeight;
  if (srcRatio > target) sw = sh * target; else sh = sw / target;
  const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}
