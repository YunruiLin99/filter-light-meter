// 配方体检：拿别人的富士配方，对照眼前的光线，找出会"翻车"的参数。
// 规则来自配方翻车最常见的几类原因：写死的白平衡、DR 与 ISO 的限制、
// 强光 / 阴天 / 暗光下的影调参数，以及胶片模拟本身和光线是否搭配。

import { lightOf, simOf, rankSims } from "./sims.js";

export const WB_PRESETS = { daylight: 5500, shade: 7500, incandescent: 3000 };
// X-Trans IV / V 的基础感光度是 ISO 160：DR200 ≥ 320，DR400 ≥ 640；更早的机型基础 ISO 200，对应 400 / 800
const DR_MIN_ISO = { 200: 320, 400: 640 };

export const DEFAULT_RECIPE = { sim: "classic_chrome", wb: "kelvin", kelvin: 5200, wbR: 2, wbB: -4, dr: "400", highlight: -1, shadow: 1, iso: "auto6400", ec: 0.3, color: 2, cce: "weak", fxBlue: "weak", grain: "weak", sharpness: -1, nr: -3 };

export function checkRecipe(recipe, lightKey, reading, lang = "zh") {
  const L = (zh, en) => (lang === "zh" ? zh : en);
  const light = lightOf(lightKey);
  const lightName = lang === "zh" ? light.zh : light.en.toLowerCase();
  const sim = simOf(recipe.sim);
  const out = [];
  const add = (level, title, detail, fix) => out.push({ level, title, detail, fix });

  const isoFixed = /^\d+$/.test(recipe.iso) ? Number(recipe.iso) : null;
  const isoAutoMax = recipe.iso.startsWith("auto") ? Number(recipe.iso.slice(4)) : null;
  const dark = lightKey === "night" || (reading && (reading.night || reading.bright === "dark"));
  const hard = lightKey === "sunny" || reading?.contrast === "high";
  const flat = (lightKey === "overcast" || lightKey === "shade") || reading?.contrast === "low";
  const h = Number(recipe.highlight), s = Number(recipe.shadow);

  // 1. 白平衡
  if (recipe.wb === "auto") {
    add("ok", L("白平衡：AUTO", "White balance: AUTO"),
      L("会跟着现场光线自动调整，配方里的 R/B 偏移照常生效。", "It adapts to the light, and the recipe's R/B shift still applies."));
  } else {
    const setK = recipe.wb === "kelvin" ? Number(recipe.kelvin) : WB_PRESETS[recipe.wb];
    const diff = setK - light.k;
    if (Math.abs(diff) < 700) {
      add("ok", L(`白平衡：${setK}K`, `White balance: ${setK}K`),
        L(`和现场光线（${lightName}，约 ${light.k}K）接近，颜色不会明显跑偏。`, `Close to the light here (${lightName}, about ${light.k}K), so colours should hold.`));
    } else {
      const warmer = diff > 0;
      const golden = lightKey === "golden" && warmer;
      const level = golden ? "warn" : Math.abs(diff) >= 1500 ? "high" : "warn";
      add(level,
        L(`白平衡写死在 ${setK}K，照片会${warmer ? "偏黄偏橙" : "偏蓝"}`, `White balance fixed at ${setK}K — photos will look ${warmer ? "yellow-orange" : "blue"}`),
        L(`配方作者是在他当时的光线下定的这个值。现在是${lightName}（约 ${light.k}K），相差约 ${Math.abs(diff)}K。${golden ? "如果你想要浓郁的暖色氛围，这可能正是你要的效果。" : ""}`,
          `The author set this for their own light. You're in ${lightName} (about ${light.k}K), roughly ${Math.abs(diff)}K apart.${golden ? " If you want a strong warm mood, this may be exactly what you're after." : ""}`),
        L(`改成 AUTO 白平衡（保留配方的 R/B 偏移），或者把 K 值改成约 ${Math.round(light.k / 100) * 100}K。`, `Switch to AUTO WB (keep the recipe's R/B shift), or set about ${Math.round(light.k / 100) * 100}K.`));
    }
  }

  // 1b. 白平衡偏移：暖色偏移叠加暖光、冷色偏移叠加冷光
  const R = Number(recipe.wbR || 0), B = Number(recipe.wbB || 0);
  const warmLight = lightKey === "golden" || lightKey === "indoor_warm" || lightKey === "night";
  const coolLight = lightKey === "overcast" || lightKey === "shade";
  if (R - B >= 4 && warmLight) {
    add("warn", L(`白平衡偏移 R${R >= 0 ? "+" : ""}${R} / B${B >= 0 ? "+" : ""}${B} 会和暖光叠加`, `WB shift R${R >= 0 ? "+" : ""}${R} / B${B >= 0 ? "+" : ""}${B} stacks with the warm light`),
      L(`这个偏移本身就是往暖色调，${lightName}本来也偏暖，两者叠加后照片会更黄更橙。`, `The shift already pushes warm, and ${lightName} is warm too — together the photo turns more yellow-orange.`),
      L(`把 R/B 偏移减半，比如 R${Math.round(R / 2) >= 0 ? "+" : ""}${Math.round(R / 2)} / B${Math.round(B / 2) >= 0 ? "+" : ""}${Math.round(B / 2)}。`, `Halve the shift, e.g. R${Math.round(R / 2) >= 0 ? "+" : ""}${Math.round(R / 2)} / B${Math.round(B / 2) >= 0 ? "+" : ""}${Math.round(B / 2)}.`));
  } else if (B - R >= 4 && coolLight) {
    add("warn", L(`白平衡偏移 R${R >= 0 ? "+" : ""}${R} / B${B >= 0 ? "+" : ""}${B} 会和冷光叠加`, `WB shift R${R >= 0 ? "+" : ""}${R} / B${B >= 0 ? "+" : ""}${B} stacks with the cool light`),
      L(`这个偏移往冷色调，${lightName}本来也偏冷，照片会明显发蓝。`, `The shift pushes cool, and ${lightName} is cool too — photos will look noticeably blue.`),
      L("把 B 往回调 2–3 格，或给 R 加一点。", "Pull B back 2–3 steps, or add a little R."));
  }

  // 2. 动态范围与 ISO
  if (recipe.dr === "400" || recipe.dr === "200") {
    const need = DR_MIN_ISO[recipe.dr];
    if (isoFixed != null && isoFixed < need) {
      add("high", L(`DR${recipe.dr} 在 ISO ${isoFixed} 下无法生效`, `DR${recipe.dr} can't work at ISO ${isoFixed}`),
        L(`DR${recipe.dr} 需要感光度至少约 ISO ${need}（老机型约 ${need === 640 ? 800 : 400}）。很多配方帖没写这一点，照片就少了预期的高光保护。`,
          `DR${recipe.dr} needs at least about ISO ${need} (older bodies about ${need === 640 ? 800 : 400}). Many recipe posts skip this, so you lose the highlight protection.`),
        L(`把 ISO 改成 Auto，或者固定在 ISO ${need} 以上。`, `Use Auto ISO, or fix ISO at ${need} or above.`));
    } else if (recipe.dr === "400" && lightKey === "sunny") {
      add("warn", L("晴天 + DR400：注意快门速度", "Sun + DR400: watch your shutter speed"),
        L("DR400 让最低 ISO 升到约 640，晴天用大光圈时，机械快门可能快不到足够的速度，照片会过曝。", "DR400 raises the minimum ISO to about 640; wide open in bright sun, the mechanical shutter may not be fast enough."),
        L("缩小光圈、开启电子快门，或改用 DR200。", "Stop down, use the electronic shutter, or drop to DR200."));
    } else {
      add("ok", L(`DR${recipe.dr}：没问题`, `DR${recipe.dr}: fine`),
        L(`当前 ISO 设置满足 DR${recipe.dr} 的要求，高光会得到保护。`, `Your ISO setting allows DR${recipe.dr}, so highlights are protected.`));
    }
  } else if (hard && recipe.dr === "100" && h >= 1) {
    add("high", L("强光 + DR100 + 高光提亮：高光很容易死白", "Hard light + DR100 + raised highlights: highlights will clip"),
      L(`现在光比很大，DR100 没有额外的高光保护，高光 +${h} 还会继续提亮。`, `Contrast is high, DR100 gives no extra headroom, and highlights +${h} brighten them further.`),
      L("改用 DR200 / DR400，或把高光调到 0 以下。", "Use DR200/DR400, or set highlights to 0 or lower."));
  }

  // 3. 暗光
  if (dark) {
    if (isoFixed != null && isoFixed <= 800) {
      add("high", L(`光线很暗，ISO ${isoFixed} 容易糊片`, `Low light: ISO ${isoFixed} risks blur`),
        L("固定低 ISO 会迫使快门变慢，手持很容易拍糊。", "A fixed low ISO forces slow shutter speeds, which blur handheld shots."),
        L("改用 Auto ISO，上限设到 6400。", "Use Auto ISO with a 6400 ceiling."));
    } else if (isoAutoMax && isoAutoMax < 6400) {
      add("warn", L(`Auto ISO 上限 ${isoAutoMax} 偏低`, `Auto ISO ceiling ${isoAutoMax} is low`),
        L("暗光下相机可能会用很慢的快门来凑曝光。", "In the dark the camera may fall back on slow shutter speeds."),
        L("把上限提到 6400。", "Raise the ceiling to 6400."));
    }
    if (s >= 2) {
      add("warn", L(`暗光下阴影 +${s} 会放大噪点`, `Shadows +${s} will amplify noise in low light`),
        L("ISO 升高后暗部本来就有噪点，阴影再加深会让它更显眼。", "High ISO already adds shadow noise; deepening shadows makes it more visible."),
        L("阴影调到 +1 或 0。", "Set shadows to +1 or 0."));
    }
  }

  // 4. 强光 / 平光下的影调
  if (hard && !(recipe.dr === "100" && h >= 1)) {
    if (h >= 2) add("warn", L(`强光下高光 +${h} 容易死白`, `Highlights +${h} will clip in hard light`),
      L("晴天光比已经很大，再提亮高光会丢掉天空和亮部的细节。", "Contrast is already high; brighter highlights lose sky and skin detail."),
      L("高光调到 0 或 -1，并配合 DR200 / DR400。", "Set highlights to 0 or -1 with DR200/DR400."));
    if (s >= 2) add("warn", L(`强光下阴影 +${s} 容易死黑`, `Shadows +${s} will crush in hard light`),
      L("阴影部分会变成一片黑，看不到细节。", "Shadow areas will go solid black."),
      L("阴影调到 +1 或 0。", "Set shadows to +1 or 0."));
  }
  if (flat && h <= -1 && s <= -1) {
    add("warn", L("阴天 + 高光阴影都调低：照片会发灰", "Flat light + lowered highlights and shadows: photos go grey"),
      L("阴天本来反差就低，再降低高光和阴影，画面会发闷发灰。", "Overcast light is already low-contrast; lowering both makes it murky."),
      L("阴影 +1、高光 0，让画面更通透。", "Try shadows +1 and highlights 0 for more snap."));
  }

  // 4b. 曝光补偿
  const ec = Number(recipe.ec || 0);
  const ecTxt = `${ec > 0 ? "+" : ""}${ec}`;
  if (ec >= 0.7 && hard && recipe.dr !== "400") {
    add(recipe.dr === "100" && ec >= 1 ? "high" : "warn", L(`强光下曝光补偿 ${ecTxt}，高光容易过曝`, `Exposure ${ecTxt} in hard light will clip highlights`),
      L("很多配方为了「日系通透」会加曝光，但晴天光比大，天空和亮部很容易变成一片白。", "Many recipes add exposure for an airy look, but in bright sun the sky and highlights turn to white."),
      L("曝光补偿改为 0 ~ +0.3，或者改用 DR400。", "Use 0 to +0.3, or switch to DR400."));
  } else if (ec <= -0.7 && dark) {
    add("warn", L(`暗光下曝光补偿 ${ecTxt}，暗部会很脏`, `Exposure ${ecTxt} in low light makes shadows muddy`),
      L("本来就暗，再减曝光，暗部细节和噪点都会变差。", "It's already dark; pulling exposure down worsens shadow detail and noise."),
      L("曝光补偿改为 0。", "Set exposure compensation to 0."));
  }

  // 4c. 色彩
  const color = Number(recipe.color || 0);
  if (color >= 3 && sim.id === "velvia") {
    add("warn", L(`Velvia + 色彩 +${color}：容易溢色`, `Velvia + Color +${color}: colours will clip`),
      L("Velvia 本身饱和度就很高，再加色彩，红色和绿色会失去层次。", "Velvia is already saturated; more Color makes reds and greens lose detail."),
      L("色彩调到 0 ~ +1。", "Set Color to 0 to +1."));
  } else if (color >= 2 && (lightKey === "golden" || lightKey === "indoor_warm")) {
    add("warn", L(`暖光下色彩 +${color}，肤色容易发橙`, `Color +${color} in warm light turns skin orange`),
      L(`${lightName}本来就偏暖，饱和度再提高，肤色和暖色会变得很浓。`, `${lightName} is already warm; more saturation makes skin and warm tones heavy.`),
      L("拍人像时色彩调到 0 ~ +1。", "For portraits, set Color to 0 to +1."));
  }

  // 4d. 降噪与颗粒（暗光高 ISO）
  const nr = Number(recipe.nr || 0);
  if (dark && nr <= -3) {
    add("warn", L(`暗光下高 ISO 降噪 ${nr}，噪点会很明显`, `Noise reduction ${nr} at high ISO in the dark shows a lot of noise`),
      L(`配方把降噪调低，是为了保留细节和「胶片颗粒感」，但暗光下 ISO 会升到几千，噪点会远比作者样片明显${recipe.grain === "strong" ? "，再加上强颗粒效果会更粗糙" : ""}。`,
        `Recipes lower NR to keep detail and a film-like texture, but in the dark ISO climbs into the thousands and noise shows far more than in the author's samples${recipe.grain === "strong" ? ", and strong grain adds to it" : ""}.`),
      L("暗光下把降噪调到 -1 或 -2；喜欢颗粒感的话可以保留。", "Set NR to -1 or -2 in low light — or keep it if you like the grit."));
  }

  // 4e. 彩色 FX 蓝色
  if (recipe.fxBlue === "strong" && lightKey === "sunny") {
    add("ok", L("彩色 FX 蓝色：强", "Color Chrome FX Blue: strong"),
      L("晴天的蓝天会被压得更深更浓，这种光线下效果最明显。", "Clear blue skies get deeper and richer — this is the light where it shows most."));
  }

  // 5. 胶片模拟与光线
  if (sim.poor?.includes(lightKey)) {
    const alt = rankSims(lightKey, reading, 1)[0].sim;
    add("warn", L(`${sim.name} 不太适合${lightName}`, `${sim.name} doesn't suit ${lightName}`),
      L(`在这种光线下，${sim.name} ${sim.poorWhy.zh}。`, `In this light, ${sim.name} ${sim.poorWhy.en}.`),
      L(`可以试试 ${alt.name}：${alt.zh}。`, `Try ${alt.name}: ${alt.en.toLowerCase()}.`));
  } else if (sim.good.includes(lightKey)) {
    add("ok", L(`${sim.name} 很适合${lightName}`, `${sim.name} suits ${lightName}`), sim[lang] + L("。", "."));
  } else {
    add("ok", L(`${sim.name} 在${lightName}下可以用`, `${sim.name} works in ${lightName}`), sim[lang] + L("。", "."));
  }

  const order = { high: 0, warn: 1, ok: 2 };
  out.sort((a, b) => order[a.level] - order[b.level]);
  return {
    items: out,
    high: out.filter((x) => x.level === "high").length,
    warn: out.filter((x) => x.level === "warn").length,
  };
}
