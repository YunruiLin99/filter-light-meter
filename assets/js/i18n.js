// Bilingual copy (中文 / English). Static strings are bound through
// data-i18n attributes; dynamic sentences are built by the functions below.

export const STRINGS = {
  zh: {
    "meta.title": "Film Light Meter · 读懂光线，匹配胶片",
    "nav.try": "试用", "nav.how": "原理", "nav.about": "关于",
    "hero.eyebrow": "作品集项目 · 浏览器端胶片匹配工具",
    "hero.title1": "读懂你的光，", "hero.title2": "选对你的片。",
    "hero.lede": "上传一张照片，它会在浏览器里测量色温、明暗与对比，从 42 款真实胶片 LUT 中推荐最契合的几款，并用逐像素渲染即时预览。把「一个个滤镜翻着试」变成「按光匹配」。",
    "hero.cta": "立即试用", "hero.code": "查看源码",
    "hero.stat1": "款真实胶片 LUT", "hero.stat2": "本地运行，照片不上传", "hero.stat3": "依赖 · 原生 JavaScript",
    "hero.strip": "同一张照片 · 四种胶片 · 实时渲染",
    "try.label": "试一试", "try.title": "上传照片，或选一张示例",
    "drop.title": "上传一张照片", "drop.hint": "点击选择 · 或拖到这里 · JPG / PNG",
    "samples.label": "没有照片？试试示例：",
    "sample.coffee": "室内暖光", "sample.cat": "窗边柔光", "sample.portrait": "人像", "sample.launch": "黄昏户外",
    "loaded.title": "照片已就位", "loaded.desc": "光线已读取，推荐见下方。调整胶片类别或场景，结果会实时刷新。",
    "btn.reset": "换一张",
    "filter.cats": "胶片类别 · 点击排除", "filter.scene": "场景 · 影响推荐理由的角度",
    "cat.color": "彩色胶片", "cat.fujisim": "富士数字", "cat.bw": "黑白", "cat.instant": "一次成像", "cat.cine": "电影正片",
    "scene.auto": "自动", "scene.portrait": "人像", "scene.landscape": "风景", "scene.night": "夜景", "scene.daily": "日常",
    "status.reading": "正在读取光线…",
    "err.prefix": "读取失败。", "err.notImage": "这看起来不是图片文件，换一张 JPG 或 PNG 试试。",
    "err.load": "这张图片没能正常加载，换一张试试。", "err.process": "处理时出错了：",
    "err.lut": "胶片数据加载失败，请检查网络后重试。",
    "res.reading": "光线读数", "res.matches": "推荐胶片 · 真实 LUT 渲染",
    "gauge.warm": "暖 · 2800K", "gauge.label": "色温", "gauge.cool": "8000K · 冷",
    "cell.scene": "场景", "cell.light": "光线", "cell.bright": "明度", "cell.contrast": "对比",
    "card.rank": "推荐", "card.match": "契合", "card.why": "为什么适合：", "card.hold": "按住看原图",
    "card.original": "原图",
    "how.label": "工作原理", "how.title": "三步：测光 → 匹配 → 渲染",
    "how.lede": "所有计算都在浏览器里完成，没有服务器、没有上传，也不依赖任何框架。",
    "how.1.t": "测光", "how.1.d": "把照片缩到 120px 后逐像素统计：用红蓝通道比估算色温（2800–8000K），用亮度 P5–P95 百分位差衡量对比，用平均饱和度和绿色像素占比辅助判断场景。",
    "how.2.t": "匹配", "how.2.d": "42 款胶片各自标注了适合的明暗、对比、色温和饱和区间。加权打分后取前四名；可以按类别排除胶片，或手动指定场景来改变推荐理由。",
    "how.3.t": "渲染", "how.3.d": "按需加载推荐胶片的 .cube 3D LUT，在 Canvas 上对每个像素做三线性插值，所以看到的就是这款胶片真实的色彩映射，而不是近似滤镜。",
    "about.label": "关于项目", "about.title": "为什么做这个",
    "about.p1": "用手机或相机拍照的人，常常面对几十款胶片模拟，只能一个个试。我想把这件事反过来：先读懂照片本身的光，再让工具告诉你哪几款最合适，并解释为什么。",
    "about.p2": "这个项目从问题定义到上线都由我独立完成，开发过程中使用 AI 辅助编码，我负责方向、算法取舍和最终把关。",
    "about.role": "我的角色",
    "role.1": "产品构思与需求定义", "role.2": "交互与视觉设计", "role.3": "前端开发与算法实现", "role.4": "借助 AI 辅助开发并审校",
    "about.stack": "技术栈", "about.next": "下一步",
    "next.1": "用 WebGL 渲染全尺寸图片并支持导出", "next.2": "通过服务端代理接入大模型，生成个性化推荐文案",
    "next.3": "读取 EXIF（白平衡、ISO）来提升测光精度",
    "foot.credits": "胶片 LUT 源自开源的 G'MIC 胶片模拟合集；示例照片来自 scikit-image（公有领域 / CC0）。色温、明暗与对比均为基于像素的估算值。",
    "foot.by": "设计与开发：",
  },
  en: {
    "meta.title": "Film Light Meter · Read the light, match the film",
    "nav.try": "Try it", "nav.how": "How it works", "nav.about": "About",
    "hero.eyebrow": "Portfolio project · In-browser film matching",
    "hero.title1": "Read the light.", "hero.title2": "Pick the film.",
    "hero.lede": "Drop in a photo and the page measures its colour temperature, brightness and contrast right in your browser, then recommends the best matches from 42 real film LUTs, rendered pixel by pixel. Choosing a film look becomes a match, not trial and error.",
    "hero.cta": "Try it now", "hero.code": "View source",
    "hero.stat1": "real film LUTs", "hero.stat2": "runs locally — photos never leave your device", "hero.stat3": "dependencies · vanilla JavaScript",
    "hero.strip": "One photo · four films · rendered live",
    "try.label": "Try it", "try.title": "Upload a photo or pick a sample",
    "drop.title": "Upload a photo", "drop.hint": "Click to choose · or drag it here · JPG / PNG",
    "samples.label": "No photo handy? Try a sample:",
    "sample.coffee": "Warm interior", "sample.cat": "Window light", "sample.portrait": "Portrait", "sample.launch": "Dusk outdoors",
    "loaded.title": "Photo ready", "loaded.desc": "Light measured — matches are below. Change categories or the scene and they update instantly.",
    "btn.reset": "Change photo",
    "filter.cats": "Film categories · tap to exclude", "filter.scene": "Scene · shapes the reasoning",
    "cat.color": "Colour film", "cat.fujisim": "Fujifilm sims", "cat.bw": "B&W", "cat.instant": "Instant", "cat.cine": "Cinema print",
    "scene.auto": "Auto", "scene.portrait": "Portrait", "scene.landscape": "Landscape", "scene.night": "Night", "scene.daily": "Everyday",
    "status.reading": "Reading the light…",
    "err.prefix": "Couldn't read that.", "err.notImage": "That doesn't look like an image — try a JPG or PNG.",
    "err.load": "The image failed to load — try another one.", "err.process": "Something went wrong: ",
    "err.lut": "Film data failed to load. Check your connection and try again.",
    "res.reading": "Light reading", "res.matches": "Best matches · real LUT renders",
    "gauge.warm": "Warm · 2800K", "gauge.label": "Colour temp", "gauge.cool": "8000K · Cool",
    "cell.scene": "Scene", "cell.light": "Light", "cell.bright": "Brightness", "cell.contrast": "Contrast",
    "card.rank": "Pick", "card.match": "Match", "card.why": "Why it fits: ", "card.hold": "Hold for original",
    "card.original": "Original",
    "how.label": "How it works", "how.title": "Measure → Match → Render",
    "how.lede": "Everything runs in the browser: no server, no uploads, no framework.",
    "how.1.t": "Measure", "how.1.d": "The photo is downsampled to 120px and read pixel by pixel: the red/blue balance estimates colour temperature (2800–8000K), the P5–P95 luminance spread measures contrast, and mean saturation plus the share of green pixels hint at the scene.",
    "how.2.t": "Match", "how.2.d": "Each of the 42 films is tagged with the brightness, contrast, white-balance and saturation ranges it suits. A weighted score picks the top four; you can exclude categories or override the scene to change the reasoning.",
    "how.3.t": "Render", "how.3.d": "The recommended films' .cube 3D LUTs are loaded on demand and applied to every pixel on a canvas with trilinear interpolation, so what you see is the film's actual colour mapping, not an approximate filter.",
    "about.label": "About", "about.title": "Why I built this",
    "about.p1": "Anyone shooting with a phone or camera faces dozens of film simulations and ends up clicking through them one by one. I wanted to flip that: read the light in the photo first, then have the tool suggest the few films that suit it and explain why.",
    "about.p2": "I took this project from problem definition to launch on my own, using AI-assisted coding along the way. I set the direction, made the algorithmic trade-offs and reviewed everything that shipped.",
    "about.role": "My role",
    "role.1": "Product concept & requirements", "role.2": "Interaction & visual design", "role.3": "Front-end & algorithm implementation", "role.4": "AI-assisted development & review",
    "about.stack": "Stack", "about.next": "Next steps",
    "next.1": "WebGL rendering at full resolution, with export", "next.2": "LLM-written recommendations through a server-side proxy",
    "next.3": "Read EXIF data (white balance, ISO) to sharpen the reading",
    "foot.credits": "Film LUTs from the open-source G'MIC film emulation collection. Sample photos from scikit-image (public domain / CC0). Colour temperature, brightness and contrast are pixel-based estimates.",
    "foot.by": "Designed & built by ",
  },
};

const pick = (lang, zh, en) => (lang === "zh" ? zh : en);

export function lightingLabel(r, lang) {
  if (r.night) return pick(lang, "夜景 / 弱光", "Night / low light");
  if (r.bright === "bright" && r.contrast === "high") return pick(lang, "明亮硬光", "Bright, hard light");
  if (r.bright === "bright" && r.contrast === "low") return pick(lang, "明亮柔光", "Bright, soft light");
  if (r.warm === "warm" && r.bright !== "dark") return pick(lang, "暖光 / 黄金时刻", "Warm / golden hour");
  if (r.warm === "cool" && r.contrast === "low") return pick(lang, "阴天散射光", "Overcast, diffuse");
  return pick(lang, "自然光", "Natural light");
}

export function brightLabel(r, lang) {
  return { bright: pick(lang, "偏亮", "Bright"), dark: pick(lang, "偏暗", "Dark"), mid: pick(lang, "适中", "Medium") }[r.bright];
}
export function contrastLabel(r, lang) {
  return { high: pick(lang, "高", "High"), low: pick(lang, "低", "Low"), mid: pick(lang, "中", "Medium") }[r.contrast];
}

export function moodTags(r, lang) {
  const m = {
    warm: { warm: ["暖调", "warm"], cool: ["清冷", "cool"], neutral: ["中性", "neutral"] },
    contrast: { high: ["硬朗", "punchy"], low: ["柔和", "soft"], mid: ["均衡", "balanced"] },
    sat: { high: ["浓郁", "rich"], low: ["素净", "muted"], mid: ["自然", "natural"] },
  };
  const i = lang === "zh" ? 0 : 1;
  const light = r.night ? ["夜色", "nocturnal"] : r.bright === "bright" ? ["明亮", "airy"] : r.bright === "dark" ? ["低调", "low-key"] : ["通透", "clear"];
  return [m.warm[r.warm][i], m.contrast[r.contrast][i], m.sat[r.sat][i], light[i]];
}

export function summary(r, lang) {
  if (lang === "zh") {
    const p = r.night ? ["这是一张弱光 / 夜景照片"] : [
      r.warm === "warm" ? "光线偏暖" : r.warm === "cool" ? "光线偏冷" : "色温中性",
      r.contrast === "high" ? "光比偏硬" : r.contrast === "low" ? "影调柔和" : "对比适中",
    ];
    if (!r.night && r.bright !== "mid") p.push(r.bright === "bright" ? "整体偏亮" : "整体偏暗");
    return `${p.join("、")}，色温约 ${r.kelvin}K。`;
  }
  const p = r.night ? ["A low-light / night shot"] : [
    r.warm === "warm" ? "Warm light" : r.warm === "cool" ? "Cool light" : "Neutral white balance",
    r.contrast === "high" ? "hard contrast" : r.contrast === "low" ? "soft tonality" : "moderate contrast",
  ];
  if (!r.night && r.bright !== "mid") p.push(r.bright === "bright" ? "bright overall" : "dark overall");
  return `${p.join(", ")} — about ${r.kelvin}K.`;
}

export function sceneName(key, lang) {
  return STRINGS[lang]["scene." + key];
}

// "Why it fits" = scene framing + a tone-specific reason + the film's own strength.
export function whyText(film, r, sceneKey, manual, lang) {
  const t = film.tone, punchy = film.sat.includes("high");
  const zh = lang === "zh";
  const lead = zh
    ? `${manual ? "这是" : "这张看着像"}${{ portrait: "人像", landscape: "风景", night: "夜景 / 弱光", daily: "日常场景" }[sceneKey]}，${{ portrait: "肤色和氛围最关键", landscape: "色彩层次和通透感最关键", night: "氛围和噪点控制最关键", daily: "耐看不出错最重要" }[sceneKey]}，`
    : `${manual ? "For" : "This reads as"} ${{ portrait: "a portrait", landscape: "a landscape", night: "a night / low-light shot", daily: "an everyday scene" }[sceneKey]}, where ${{ portrait: "skin and mood matter most", landscape: "colour depth and clarity matter most", night: "atmosphere and noise matter most", daily: "a dependable, easy look matters most" }[sceneKey]}; `;

  let fit;
  if (t === "bw") {
    fit = {
      portrait: ["黑白更重情绪与轮廓、弱化肤色瑕疵", "black-and-white puts emotion and shape first and forgives skin"],
      landscape: ["黑白靠光影层次撑起画面，张力很强", "monochrome lets light and shadow carry the frame"],
      night: ["黑白夜景里颗粒反而成了味道", "in a night scene the grain becomes part of the charm"],
      daily: ["黑白让平凡场景多几分故事感", "monochrome gives an ordinary moment a sense of story"],
    }[sceneKey];
  } else if (sceneKey === "portrait") {
    fit = t === "warm" ? ["它的暖调能把肤色拍得红润柔和", "its warmth renders skin rosy and soft"]
      : t === "cool" ? ["它走冷白路线，肤色干净通透", "its cool palette keeps skin clean and clear"]
      : ["它肤色还原自然、不过度讨好", "it renders skin naturally without over-flattering"];
  } else if (sceneKey === "landscape") {
    fit = punchy ? ["它能把天空与绿植压得浓郁通透", "it makes skies and foliage rich and vivid"]
      : t === "warm" ? ["它给画面添一层暖意，黄昏氛围更足", "it adds a warm layer that deepens golden-hour mood"]
      : t === "cool" ? ["它把蓝天与绿意压得清爽通透", "it keeps blues and greens crisp and fresh"]
      : ["它色彩还原扎实、层次不抢戏", "its colour is faithful and the tones stay composed"];
  } else if (sceneKey === "night") {
    fit = t === "warm" ? ["它的暖调能稳住灯光氛围", "its warmth holds on to the glow of artificial light"]
      : t === "cool" ? ["它的冷调强化夜的清冷与霓虹感", "its cool cast heightens the neon chill of the night"]
      : ["它发色稳，夜景不易偏色", "its colour stays stable, avoiding odd casts at night"];
  } else {
    fit = t === "warm" ? ["它暖调耐看，生活气息足", "its warmth feels lived-in and easy to love"]
      : t === "cool" ? ["它干净清爽，通勤日常都合适", "it is clean and fresh, right for everyday scenes"]
      : ["它百搭、不挑场景", "it is versatile and suits almost any scene"];
  }
  return zh ? `${lead}${fit[0]}；${film.strength.zh}。` : `${lead}${fit[1]} — ${film.strength.en}.`;
}
