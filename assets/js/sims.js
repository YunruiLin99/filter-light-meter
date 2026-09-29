// 富士胶片模拟目录 + 光线类型。
// lut：有开源 LUT 可以预览的模拟；approx = 用同名胶片的 LUT 近似（非机身模拟本身）。
// good / ok：适合 / 可用的光线类型。

export const LIGHTS = [
  { key: "sunny", zh: "晴天日光", en: "Direct sun", k: 5500, range: [5200, 5800] },
  { key: "overcast", zh: "阴天", en: "Overcast", k: 6500, range: [6000, 7500] },
  { key: "shade", zh: "阴影处 / 蓝调", en: "Shade / blue hour", k: 7500, range: [7000, 9000] },
  { key: "golden", zh: "黄金时刻", en: "Golden hour", k: 4000, range: [3500, 4500] },
  { key: "indoor_warm", zh: "室内暖光", en: "Warm indoor light", k: 3000, range: [2700, 3300] },
  { key: "indoor_cool", zh: "室内白光", en: "Cool indoor light", k: 4300, range: [4000, 5000] },
  { key: "night", zh: "夜景 / 弱光", en: "Night / low light", k: 3200, range: [2700, 4000] },
];
export const lightOf = (key) => LIGHTS.find((l) => l.key === key);

// 根据测光结果猜光线类型。手机拍照时会自动白平衡，色温估算只能作参考，
// 所以界面上总是让用户确认或修改。
export function guessLight(r) {
  if (r.night) return "night";
  if (r.kelvin < 3900) return r.bright === "bright" && r.contrast !== "low" ? "golden" : "indoor_warm";
  if (r.kelvin < 4800) return r.bright === "dark" ? "indoor_warm" : r.contrast === "high" ? "golden" : "indoor_cool";
  if (r.kelvin > 6800) return r.contrast === "low" ? "overcast" : "shade";
  if (r.contrast === "low") return "overcast";
  if (r.bright === "dark") return "indoor_cool";
  return "sunny";
}

export const SIMS = [
  { id: "provia", name: "PROVIA / Standard", lut: "xtransProvia",
    zh: "标准色彩，还原准确、百搭", en: "Faithful, balanced colour that suits almost anything",
    good: ["sunny", "overcast", "indoor_cool"], ok: ["shade", "golden", "indoor_warm", "night"] },
  { id: "velvia", name: "Velvia / Vivid", lut: "xtransVelvia",
    zh: "高饱和、高对比，风景和晴天最出彩", en: "Saturated and punchy — landscapes in good light",
    good: ["sunny", "golden"], ok: ["overcast", "shade"], poor: ["indoor_warm", "night"],
    poorWhy: { zh: "会把橙黄色推得很浓，肤色容易发橙", en: "pushes the warmth into heavy orange, and skin can turn orange" } },
  { id: "astia", name: "ASTIA / Soft", lut: "astia100f", approx: true,
    zh: "柔和的影调、明亮的色彩，适合人像", en: "Soft tones with bright colour, lovely for portraits",
    good: ["sunny", "overcast", "indoor_cool"], ok: ["golden", "shade"] },
  { id: "classic_chrome", name: "Classic Chrome", lut: "classicchrome",
    zh: "低饱和、硬朗的纪实感，阴天和街拍的代表", en: "Muted, documentary colour — the overcast and street classic",
    good: ["overcast", "shade", "sunny"], ok: ["indoor_cool", "night"], poor: ["indoor_warm"],
    poorWhy: { zh: "容易偏暗偏闷，画面发脏", en: "can look muddy and dull" } },
  { id: "pro_neg_hi", name: "PRO Neg. Hi", lut: "proneghi",
    zh: "人像负片，肤色自然、对比略高", en: "Portrait negative with natural skin and a touch more contrast",
    good: ["indoor_cool", "indoor_warm", "overcast", "sunny"], ok: ["golden"] },
  { id: "pro_neg_std", name: "PRO Neg. Std", lut: "pronegstd",
    zh: "最柔和的人像负片，适合平光和影棚", en: "The softest portrait negative, for flat light and studio",
    good: ["overcast", "indoor_cool"], ok: ["shade", "indoor_warm"], poor: ["sunny"],
    poorWhy: { zh: "会显得平淡、缺少层次", en: "looks flat and lifeless" } },
  { id: "acros", name: "ACROS", lut: "acros100", approx: true, mono: true,
    zh: "细腻的黑白，层次丰富，硬光和夜景都好看", en: "Fine-grained monochrome with rich tones, great in hard light and at night",
    good: ["sunny", "night", "shade", "indoor_warm"], ok: ["overcast", "golden", "indoor_cool"] },
  // 以下没有可用的开源 LUT，不做预览，只在推荐文字和体检里出现
  { id: "classic_neg", name: "Classic Neg.", zh: "硬朗的影调、偏青的暗部，复古的日常感", en: "Hard tonality and cyan shadows — nostalgic everyday snaps",
    good: ["overcast", "sunny", "night"], ok: ["shade", "indoor_cool"], poor: ["indoor_warm"],
    poorWhy: { zh: "偏色会和暖光叠加，容易发黄发绿", en: "its colour shifts stack with the warm cast, turning yellow-green" } },
  { id: "nostalgic_neg", name: "Nostalgic Neg.", zh: "琥珀色高光、浓郁暗部，黄金时刻的氛围", en: "Amber highlights and rich shadows — golden-hour mood",
    good: ["golden", "sunny"], ok: ["overcast", "indoor_warm"] },
  { id: "eterna", name: "ETERNA / Cinema", zh: "低饱和、柔和的电影感，适合低反差场景", en: "Low-saturation cinematic look for low-contrast scenes",
    good: ["overcast", "shade", "indoor_cool"], ok: ["night", "golden"], poor: ["sunny"],
    poorWhy: { zh: "会显得发灰、缺少力度", en: "looks washed out" } },
  { id: "reala_ace", name: "REALA ACE", zh: "真实自然的色彩，影调略硬，适合记录", en: "Natural, faithful colour with slightly harder tones",
    good: ["sunny", "overcast", "indoor_cool"], ok: ["shade", "golden", "indoor_warm"] },
];
export const simOf = (id) => SIMS.find((s) => s.id === id);

// 按光线类型 + 测光结果给有预览的模拟打分
export function rankSims(lightKey, r, count = 3) {
  return SIMS.filter((s) => s.lut)
    .map((s) => {
      let score = 60;
      if (s.good.includes(lightKey)) score += 25;
      else if (s.ok?.includes(lightKey)) score += 8;
      if (s.poor?.includes(lightKey)) score -= 30;
      if (r) {
        if (s.id === "velvia" && r.sat === "high") score -= 6;
        if (s.id === "classic_chrome" && r.sat === "high") score += 4;
        if ((s.id === "pro_neg_std" || s.id === "astia") && r.contrast === "high") score -= 5;
        if (s.id === "acros" && r.contrast === "high") score += 4;
        if (s.mono) score -= 12; // 彩色优先，黑白作为备选
      }
      return { sim: s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

// 没有预览、但值得一提的模拟（部分较新机型才有）
export function extraSims(lightKey) {
  return SIMS.filter((s) => !s.lut && s.good.includes(lightKey));
}
