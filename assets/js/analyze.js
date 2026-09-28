// Light reading: measure a photo's real pixels and bucket the results,
// then score every film profile against that reading.

const SAMPLE_EDGE = 120; // downsample before measuring — fast and noise-tolerant

export function measure(img) {
  const scale = Math.min(1, SAMPLE_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;

  let sumR = 0, sumB = 0, sumSat = 0, green = 0;
  const n = d.length / 4;
  const lums = new Float32Array(n);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    sumR += r; sumB += b;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    sumSat += mx === 0 ? 0 : (mx - mn) / mx;
    if (g === mx && g - Math.max(r, b) > 14) green++;
    lums[j] = 0.299 * r + 0.587 * g + 0.114 * b; // Rec.601 luma
  }
  lums.sort();
  const pct = (p) => lums[Math.round(p * (n - 1))];
  const meanLum = lums.reduce((a, b) => a + b, 0) / n;
  const spread = pct(0.95) - pct(0.05); // robust contrast: P95 − P5
  const avgSat = sumSat / n;

  // Correlated colour temperature estimate from the red/blue balance.
  const ratio = (sumR / n) / (sumB / n + 1);
  const kelvin = Math.max(2800, Math.min(8000, Math.round(5500 - (ratio - 1) * 4500)));

  return {
    kelvin, meanLum, spread, avgSat,
    bright: meanLum < 70 ? "dark" : meanLum < 165 ? "mid" : "bright",
    contrast: spread < 70 ? "low" : spread < 150 ? "mid" : "high",
    warm: kelvin < 4200 ? "warm" : kelvin <= 6200 ? "neutral" : "cool",
    sat: avgSat < 0.18 ? "low" : avgSat <= 0.4 ? "mid" : "high",
    night: meanLum < 55,
    greenery: green / n > 0.22,
  };
}

// Weighted match: white balance and brightness matter most, saturation least.
export function score(film, r) {
  let s = 50;
  if (film.night && r.night) s += 28;
  else if (film.night && !r.night) s -= 22;
  else if (!film.night && r.night) s -= 12;
  s += film.bright.includes(r.bright) ? 12 : -6;
  s += film.contrast.includes(r.contrast) ? 11 : -5;
  s += film.warm.includes(r.warm) ? 13 : -6;
  s += film.sat.includes(r.sat) ? 8 : -3;
  if ((film.tone === "warm" && r.warm === "warm") || (film.tone === "cool" && r.warm === "cool")) s += 4;
  return s;
}

// Map the raw score onto a friendly 60–97 "match" figure.
export const displayScore = (s) => Math.max(60, Math.min(97, Math.round(58 + (s - 50) * 0.7)));

export function autoScene(r) {
  if (r.night) return "night";
  if (r.greenery) return "landscape";
  if (r.warm === "warm") return "portrait";
  return "daily";
}

export function rank(films, reading, enabledCats, count = 4) {
  return films
    .filter((f) => enabledCats.has(f.cat))
    .map((f) => ({ film: f, raw: score(f, reading) }))
    .sort((a, b) => b.raw - a.raw)
    .slice(0, count);
}
