// 解析从小红书、配方网站复制来的配方文字，例如：
//   胶片模拟:CLASSIC CHROME(cc)
//   色调曲线:H-2,S-2
//   白平衡:Auto自动,R+1,B-1
// 兼容中英文字段名、全角符号，以及"高光-2 / 阴影-1""+0.3~+0.7"这类写法。

const SIM_PATTERNS = [
  ["eterna_bb", /eterna\s*(bleach|b\.?b)|漂白/i],
  ["eterna", /eterna|影院/i],
  ["classic_neg", /classic\s*neg|经典负片|\bcn\b/i],
  ["classic_chrome", /classic\s*chrome|经典正片|\bcc\b/i],
  ["nostalgic_neg", /nostalgic|怀旧负片|\bnn\b/i],
  ["reala_ace", /reala|\bace\b/i],
  ["pro_neg_hi", /neg\.?\s*hi|负片\s*高|\bnh\b/i],
  ["pro_neg_std", /neg\.?\s*std|负片\s*标准|\bns\b/i],
  ["velvia", /velvia|鲜艳|vivid/i],
  ["astia", /astia|柔和|soft/i],
  ["acros", /acros/i],
  ["sepia", /sepia|棕褐/i],
  ["monochrome", /mono|黑白|单色/i],
  ["provia", /provia|标准|standard/i],
];

const EC_STEPS = [-2, -1.7, -1.3, -1, -0.7, -0.3, 0, 0.3, 0.7, 1, 1.3, 1.7, 2];

function normalize(text) {
  return text
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角 → 半角
    .replace(/[：]/g, ":").replace(/[，、]/g, ",").replace(/[／]/g, "/").replace(/[－—–−]/g, "-").replace(/[＋]/g, "+")
    .replace(/　/g, " ");
}
const num = (s) => {
  const m = s && s.match(/[+-]?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const level = (v) => (/强|strong|high/i.test(v) ? "strong" : /弱|中|weak|low|medium/i.test(v) ? "weak" : /关|off|无|none/i.test(v) ? "off" : null);
function shift(s, out) {
  const r = s.match(/\bR\s*([+-]?\d+)/i) || s.match(/([+-]?\d+)\s*red/i) || s.match(/红\s*([+-]?\d+)/);
  const b = s.match(/\bB\s*([+-]?\d+)/i) || s.match(/([+-]?\d+)\s*blue/i) || s.match(/蓝\s*([+-]?\d+)/);
  if (r) out.wbR = clamp(Number(r[1]), -9, 9);
  if (b) out.wbB = clamp(Number(b[1]), -9, 9);
  return Boolean(r || b);
}
function tone(s, out) {
  const h = s.match(/(?:H|高光|highlight)\s*:?\s*([+-]?\d+(\.\d+)?)/i);
  const sh = s.match(/(?:S|阴影|shadow)\s*:?\s*([+-]?\d+(\.\d+)?)/i);
  if (h) out.highlight = clamp(Math.round(Number(h[1])), -2, 4);
  if (sh) out.shadow = clamp(Math.round(Number(sh[1])), -2, 4);
  return Boolean(h || sh);
}

export function parseRecipe(text) {
  const out = {};
  const found = [], missed = [];
  const lines = normalize(text).split(/\n|;|；/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey.trim();
    const val = rest.join(":").trim() || line;
    let ok = false;
    if (/胶片模拟|film\s*sim|模拟/i.test(key)) {
      const hit = SIM_PATTERNS.find(([, re]) => re.test(val));
      if (hit) { out.sim = hit[0]; ok = true; }
    } else if (/白平衡偏移|wb\s*shift|偏移/i.test(key)) {
      ok = shift(val, out);
    } else if (/白平衡|white\s*balance|^wb/i.test(key)) {
      if (/auto|自动/i.test(val)) out.wb = "auto";
      else if (/\d{4}/.test(val)) { out.wb = "kelvin"; out.kelvin = clamp(Number(val.match(/\d{4,5}/)[0]), 2500, 10000); }
      else if (/日光|晴|daylight|fine/i.test(val)) out.wb = "daylight";
      else if (/阴影|阴天|shade/i.test(val)) out.wb = "shade";
      else if (/白炽|钨|incandescent/i.test(val)) out.wb = "incandescent";
      shift(val, out);
      ok = Boolean(out.wb);
    } else if (/动态范围|dynamic|^dr/i.test(key)) {
      if (/auto|自动/i.test(val)) out.dr = "auto";
      else { const n = num(val); if ([100, 200, 400].includes(n)) out.dr = String(n); }
      ok = Boolean(out.dr);
    } else if (/色调曲线|tone\s*curve|曲线/i.test(key)) {
      ok = tone(val, out);
    } else if (/^(高光|highlight)/i.test(key)) {
      const n = num(val); if (n != null) { out.highlight = clamp(Math.round(n), -2, 4); ok = true; }
    } else if (/^(阴影|shadow)/i.test(key)) {
      const n = num(val); if (n != null) { out.shadow = clamp(Math.round(n), -2, 4); ok = true; }
    } else if (/彩色\s*fx|fx\s*蓝|fx\s*blue/i.test(key)) {
      const l = level(val); if (l) { out.fxBlue = l; ok = true; }
    } else if (/色彩效果|color\s*chrome\s*effect|cce/i.test(key)) {
      const l = level(val); if (l) { out.cce = l; ok = true; }
    } else if (/颗粒|grain/i.test(key)) {
      const l = level(val); if (l) { out.grain = l; ok = true; }
    } else if (/降噪|noise|^nr/i.test(key)) {
      const n = num(val); if (n != null) { out.nr = clamp(Math.round(n), -4, 4); ok = true; }
    } else if (/锐度|sharp/i.test(key)) {
      const n = num(val); if (n != null) { out.sharpness = clamp(Math.round(n), -4, 4); ok = true; }
    } else if (/^(色彩|颜色|color|colour)$/i.test(key) || /^(色彩|color)\b/i.test(key)) {
      const n = num(val); if (n != null) { out.color = clamp(Math.round(n), -4, 4); ok = true; }
    } else if (/曝光补偿|曝光|exposure|^ev/i.test(key)) {
      const ns = (val.match(/[+-]?\d+(\.\d+)?(\/\d)?/g) || []).map((x) => (x.includes("/") ? Number(x.split("/")[0]) / Number(x.split("/")[1]) : Number(x)));
      if (ns.length) {
        const v = ns.reduce((a, b) => a + b, 0) / ns.length; // "+0.3~+0.7" 取中间值
        out.ec = EC_STEPS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
        ok = true;
      }
    } else if (/^iso/i.test(key) || /感光度/.test(key)) {
      if (/auto|自动/i.test(val)) { const n = num(val); out.iso = n >= 12800 ? "auto12800" : n && n <= 3200 ? "auto3200" : "auto6400"; ok = true; }
      else { const n = num(val); if (n) { out.iso = String([160, 200, 320, 400, 640, 800, 1600, 3200].reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a))); ok = true; } }
    }
    (ok ? found : missed).push(key || line);
  }
  return { recipe: out, found, missed };
}

export const EC_OPTIONS = EC_STEPS;
