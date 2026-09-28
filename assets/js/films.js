// Film stock profiles.
// Each film is tagged on four measurable dimensions (brightness, contrast,
// white balance, saturation). The matcher scores a photo's measured light
// against these tags. `lut` points to a real 3D LUT in /assets/luts.

const D = ["dark", "mid", "bright"];
const ALL_WB = ["warm", "neutral", "cool"];
const ALL_SAT = ["low", "mid", "high"];

// [id, cat, zh name, en name, night, bright, contrast, warm, sat, tone, zh strength, en strength]
const RAW = [
  // Colour negative
  ["portra400", "color", "柯达 Portra 400", "Kodak Portra 400", false, ["mid","bright"], ["low","mid"], ["warm","neutral"], ["low","mid"], "warm",
    "最经典的人像负片，奶油般的暖肤色，低对比、层次细腻", "the classic portrait negative — creamy warm skin, low contrast, fine tonal detail"],
  ["portra800", "color", "柯达 Portra 800", "Kodak Portra 800", false, ["dark","mid"], ["low","mid"], ["warm","neutral"], ["low","mid"], "warm",
    "高速负片、暗光首选，暖调里保住肤色细节", "a fast negative for low light that keeps skin detail inside a warm palette"],
  ["portra160", "color", "柯达 Portra 160", "Kodak Portra 160", false, ["mid","bright"], ["low"], ["warm"], ["low","mid"], "warm",
    "最细腻的低速负片，奶油质感，适合精细人像", "the finest-grained Portra, soft and creamy for careful portraits"],
  ["portra160vc", "color", "柯达 Portra 160 VC", "Kodak Portra 160 VC", false, ["mid","bright"], ["mid"], ["warm"], ["mid","high"], "warm",
    "Portra 的高饱和版，肤色更红润鲜亮", "the vivid-colour Portra — rosier, brighter skin tones"],
  ["ektar100", "color", "柯达 Ektar 100", "Kodak Ektar 100", false, ["mid","bright"], ["mid","high"], ["neutral"], ["mid","high"], "neutral",
    "超高饱和与清晰度，明亮场景色彩格外浓郁", "very high saturation and sharpness; bright scenes turn rich and dense"],
  ["fuji400h", "color", "富士 Pro 400H", "Fujifilm Pro 400H", false, ["mid","bright"], ["low"], ["neutral","cool"], ["low","mid"], "cool",
    "低对比、高光柔和褪色，日系清新的代表", "low contrast with soft, faded highlights — the airy Japanese look"],
  ["fuji160c", "color", "富士 Pro 160C", "Fujifilm Pro 160C", false, ["mid","bright"], ["low"], ["neutral","cool"], ["low"], "cool",
    "极柔和的冷调粉彩，适合柔光人像", "gentle cool pastels with softened highlights, lovely in diffuse light"],
  ["superia200", "color", "富士 Superia 200", "Fujifilm Superia 200", false, D, ["mid"], ["neutral"], ["mid"], "neutral",
    "日常万能负片，色彩均衡通透，随手拍都好看", "the everyday all-rounder — balanced, clean colour that flatters snapshots"],
  ["superiaReala", "color", "富士 Superia Reala 100", "Fujifilm Superia Reala 100", false, ["mid","bright"], ["mid"], ["neutral"], ["mid"], "neutral",
    "色彩还原最准确，自然通透，风景人像都合适", "the most accurate colour of the bunch, natural for landscapes and people"],
  ["superia800", "color", "富士 Superia X-tra 800", "Fujifilm Superia X-TRA 800", false, ["dark","mid"], ["mid","high"], ["neutral","cool"], ["mid"], "cool",
    "高速负片，弱光日常也不失色彩", "a fast consumer film that keeps colour alive in dim everyday light"],
  ["agfaVista200", "color", "爱克发 Vista 200", "Agfa Vista 200", false, ["mid","bright"], ["mid","high"], ["neutral","warm"], ["mid","high"], "neutral",
    "Agfa 标志性的高饱和，色彩鲜活跳跃，适合旅拍街拍", "Agfa's signature punchy colour, lively for travel and street"],
  // Colour slide
  ["provia100f", "color", "富士 Provia 100F", "Fujifilm Provia 100F", false, D, ["mid"], ["neutral"], ["mid"], "neutral",
    "中性还原、发色干净，几乎百搭的标准片", "neutral, clean rendering — the reference slide film that suits almost anything"],
  ["provia400x", "color", "富士 Provia 400X", "Fujifilm Provia 400X", false, D, ["mid"], ["neutral","cool"], ["mid"], "neutral",
    "高速正片，细腻通透，纪实与人像兼顾", "a fast slide film, fine and clear for documentary and portraits"],
  ["velvia50", "color", "富士 Velvia 50", "Fujifilm Velvia 50", false, ["mid","bright"], ["mid","high"], ["neutral","cool"], ["mid","high"], "neutral",
    "极高饱和与对比，晴天风光最出彩", "extreme saturation and contrast — landscapes on a sunny day sing"],
  ["velvia100", "color", "富士 Velvia 100", "Fujifilm Velvia 100", false, ["mid","bright"], ["mid","high"], ["neutral"], ["mid","high"], "neutral",
    "稍温和的 Velvia，饱和依然很高，风景必备", "a slightly gentler Velvia that is still highly saturated"],
  ["astia100f", "color", "富士 Astia 100F", "Fujifilm Astia 100F", false, ["mid","bright"], ["low","mid"], ["warm","neutral"], ["low","mid"], "warm",
    "柔和低对比、肤色细腻，人像首选", "soft, low-contrast slide film with delicate skin tones"],
  ["kodachrome25", "color", "柯达 Kodachrome 25", "Kodak Kodachrome 25", false, ["mid","bright"], ["mid","high"], ["warm"], ["mid"], "warm",
    "最细腻的 Kodachrome，暖调精致", "the finest Kodachrome — refined, warm and timeless"],
  ["kodachrome64", "color", "柯达 Kodachrome 64", "Kodak Kodachrome 64", false, D, ["mid","high"], ["warm","neutral"], ["mid","high"], "warm",
    "暖调浓郁、红色扎实，经典纪实色", "rich warmth and solid reds — the classic documentary palette"],
  ["ektachrome100vs", "color", "柯达 Ektachrome 100VS", "Kodak Ektachrome 100VS", false, ["mid","bright"], ["mid","high"], ["cool","neutral"], ["mid","high"], "cool",
    "鲜艳偏冷又通透，蓝天绿植很跳", "vivid and cool — blue skies and foliage really pop"],
  ["eliteChrome200", "color", "柯达 Elite Chrome 200", "Kodak Elite Chrome 200", false, ["mid","bright"], ["mid"], ["neutral"], ["mid","high"], "neutral",
    "色彩鲜艳均衡，兼顾多种场景", "bright, balanced colour that covers many situations"],
  ["lomoXPro", "color", "Lomo X-Pro Slide 200", "Lomo X-Pro Slide 200", false, D, ["mid","high"], ["cool"], ["high"], "cool",
    "交叉冲洗带来戏剧化的色彩偏移，潮流实验风", "cross-processed colour shifts with a bold, experimental feel"],
  ["superia200xpro", "color", "富士 Superia 200 交叉冲洗", "Fujifilm Superia 200 X-Pro", false, ["mid","bright"], ["mid","high"], ["cool","neutral"], ["mid","high"], "cool",
    "交叉冲洗的青绿偏色，实验氛围强", "a cross-processed teal-green cast with an experimental mood"],
  // Fujifilm digital simulations
  ["xtransProvia", "fujisim", "富士 Provia（数字）", "Fujifilm Provia (digital)", false, D, ["mid"], ["neutral"], ["mid"], "neutral",
    "数字 Provia 标准直出，最真实的富士发色", "the standard in-camera Provia — Fujifilm colour at its most faithful"],
  ["xtransVelvia", "fujisim", "富士 Velvia（数字）", "Fujifilm Velvia (digital)", false, ["mid","bright"], ["mid","high"], ["neutral","cool"], ["mid","high"], "neutral",
    "数字 Velvia 饱和度大幅提升，风景神器", "digital Velvia with a big saturation boost, made for landscapes"],
  ["classicchrome", "fujisim", "富士 Classic Chrome", "Fujifilm Classic Chrome", false, ["dark","mid"], ["low","mid","high"], ["cool","neutral"], ["low","mid"], "cool",
    "低饱和的高级灰，阴天与街拍纪实绝配", "muted, sophisticated greys — perfect for overcast days and street work"],
  ["proneghi", "fujisim", "富士 Pro Neg Hi", "Fujifilm Pro Neg Hi", false, ["mid","bright"], ["mid"], ["warm","neutral"], ["mid"], "warm",
    "人像负片模拟，对比略足，棚拍肤色好", "a portrait negative sim with a touch more contrast, great for studio skin"],
  ["pronegstd", "fujisim", "富士 Pro Neg Std", "Fujifilm Pro Neg Std", false, D, ["low","mid"], ["warm","neutral"], ["low","mid"], "warm",
    "标准人像负片，柔和耐看", "the standard portrait negative — soft and easy on the eye"],
  ["xtransSepia", "fujisim", "富士 Sepia（数字）", "Fujifilm Sepia (digital)", false, D, ["low","mid"], ["warm"], ["low","mid"], "warm",
    "暖褐色调的怀旧感，复古范儿", "a warm brown sepia with a nostalgic, vintage feel"],
  // Black & white
  ["trix400", "bw", "柯达 Tri-X 400", "Kodak Tri-X 400", false, D, ["mid","high"], ALL_WB, ALL_SAT, "bw",
    "经典黑白，颗粒分明，硬光转黑白很带劲", "classic black-and-white with distinct grain; hard light looks superb"],
  ["tmax400", "bw", "柯达 T-Max 400", "Kodak T-Max 400", false, D, ["mid","high"], ALL_WB, ALL_SAT, "bw",
    "万能黑白，层次丰富，街拍人像皆宜", "a versatile black-and-white with rich tones for street and portraits"],
  ["acros100", "bw", "富士 Neopan Acros 100", "Fujifilm Neopan Acros 100", false, D, ["mid","high"], ALL_WB, ALL_SAT, "bw",
    "细腻黑白，层次丰富，暗部尤其干净", "fine-grained monochrome with especially clean shadows"],
  ["hp5", "bw", "Ilford HP5 Plus 400", "Ilford HP5 Plus 400", false, ["dark","mid"], ["mid","high"], ALL_WB, ALL_SAT, "bw",
    "百搭经典黑白，街拍纪实味浓", "the go-anywhere classic with a strong documentary flavour"],
  ["deltaFine100", "bw", "Ilford Delta 100", "Ilford Delta 100", false, ["mid","bright"], ["mid"], ALL_WB, ALL_SAT, "bw",
    "颗粒最细的黑白，柔和层次适合精细人像", "the finest monochrome grain, with soft gradation for detailed portraits"],
  ["delta3200", "bw", "Ilford Delta 3200", "Ilford Delta 3200", true, ["dark","mid"], ["high"], ALL_WB, ALL_SAT, "bw",
    "高感黑白，颗粒粗犷，弱光戏剧感强", "ultra-fast monochrome — gritty grain and drama in low light"],
  ["agfaApx100", "bw", "爱克发 APX 100", "Agfa APX 100", false, ["mid","bright"], ["mid"], ALL_WB, ALL_SAT, "bw",
    "欧洲经典黑白，银盐质感醇厚", "a classic European monochrome with a rich silver look"],
  // Instant
  ["polaroid669", "instant", "宝丽来 669", "Polaroid 669", false, ["mid","bright"], ["low"], ["warm","neutral"], ["low","mid"], "warm",
    "褪色的一次成像，柔光下复古梦幻", "faded instant film that turns soft light dreamy and retro"],
  ["polaroid690", "instant", "宝丽来 690", "Polaroid 690", false, ["mid","bright"], ["low","mid"], ["warm","neutral"], ["low","mid"], "warm",
    "暖调一次成像，层次比 669 稍丰富", "warm instant film with a little more depth than 669"],
  ["polaroid665", "instant", "宝丽来 665（黑白）", "Polaroid 665 (B&W)", false, ["mid","bright"], ["low","mid"], ALL_WB, ALL_SAT, "bw",
    "黑白一次成像，阴影柔和，复古温润", "black-and-white instant film with soft, warm-feeling shadows"],
  ["polaroidPx680", "instant", "宝丽来 PX-680", "Polaroid PX-680", false, ["mid","bright"], ["low","mid"], ["warm"], ["low","mid"], "warm",
    "现代宝丽来彩色，褪色复古的派对感", "modern Polaroid colour — faded, retro, party-ready"],
  ["fp100c", "instant", "富士 FP-100C", "Fujifilm FP-100C", false, ["mid","bright"], ["low","mid"], ["neutral","cool"], ["low","mid"], "neutral",
    "一次成像的柔和发色，清淡有味道", "gentle peel-apart instant colour, light and characterful"],
  // Cinema print
  ["kodak2383", "cine", "柯达 2383 电影正片", "Kodak 2383 print film", false, ["dark","mid"], ["mid","high"], ALL_WB, ["mid","high"], "neutral",
    "电影正片的青橙发色，画面立刻有电影感", "the teal-and-orange print look that makes any frame feel cinematic"],
  ["fuji3510", "cine", "富士 3510 电影正片", "Fujifilm 3510 print film", false, D, ["mid","high"], ["neutral","cool"], ["mid","high"], "neutral",
    "富士电影正片的绿调偏移，独特的胶片电影感", "Fujifilm's print stock with a green shift and a distinct filmic mood"],
];

export const FILMS = RAW.map(([id, cat, zh, en, night, bright, contrast, warm, sat, tone, sZh, sEn]) => ({
  id, cat, name: { zh, en }, night, bright, contrast, warm, sat, tone, strength: { zh: sZh, en: sEn },
}));

export const CATEGORIES = ["color", "fujisim", "bw", "instant", "cine"];
