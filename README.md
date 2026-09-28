<div align="center">

# Film Light Meter · 光线读数

**Read the light. Pick the film.**
An in-browser tool that measures the light in a photo and recommends matching film looks, rendered with real 3D LUTs.

**读懂你的光，选对你的片。** 一个在浏览器里读取照片光线、推荐最契合胶片质感的小工具。

[**▶ Live demo**](https://yunruilin99.github.io/filter-light-meter/) · [中文说明](#中文说明)

![Film Light Meter: hero section with the same photo rendered through four film LUTs](docs/hero.jpg)

</div>

## The problem

Photo apps and cameras offer dozens of film simulations, and choosing one usually means clicking through them all. Film Light Meter reverses that: it **reads the light in your photo first**, then recommends the few films that suit it and explains why.

## Features

- **Light reading.** Estimates colour temperature (2800–8000K), brightness, contrast and saturation from the photo's actual pixels.
- **Film matching.** Scores 42 film stocks (colour negative, slide, Fujifilm simulations, B&W, instant and cinema print) and returns the top four with a short reason for each.
- **Real LUT previews.** Each recommendation is rendered with that film's `.cube` 3D LUT, pixel by pixel. Press and hold a preview to compare it with the original.
- **Interactive refinement.** Exclude film categories or override the detected scene, and the results update instantly.
- **Private by design.** Everything runs locally in the browser. Photos are never uploaded.
- **Bilingual.** Switch between 中文 and English at any time.

![Results: light reading with colour-temperature gauge, and four recommended films rendered on the photo](docs/results.jpg)

## How it works

```
photo ──► measure ──► match ──► render
          120px        42 film    .cube 3D LUT
          sample       profiles   trilinear interpolation
```

1. **Measure** (`assets/js/analyze.js`). The photo is downsampled to 120px. The red/blue balance gives a colour-temperature estimate, the P5–P95 luminance spread gives contrast, and mean saturation plus the share of green-dominant pixels hint at the scene (portrait, landscape, night or everyday).
2. **Match** (`assets/js/analyze.js`, `assets/js/films.js`). Every film is tagged with the brightness, contrast, white-balance and saturation ranges it suits. A weighted score ranks them: white balance and brightness count most, and night-only stocks are penalised in daylight.
3. **Render** (`assets/js/lut.js`). Only the recommended films' LUTs are fetched (lazy-loaded and cached). Each pixel is mapped through the 9×9×9 LUT with trilinear interpolation on a `<canvas>`.

## Tech

Vanilla JavaScript (ES modules) · Canvas 2D · 3D LUTs (`.cube`) · HTML/CSS · deployed to GitHub Pages with GitHub Actions. No frameworks and no build step.

```
index.html
assets/
  css/style.css
  js/app.js        UI, state, rendering
  js/analyze.js    light measurement and film scoring
  js/lut.js        .cube parser and trilinear LUT engine
  js/films.js      42 film profiles (bilingual)
  js/i18n.js       UI copy and generated explanations (zh / en)
  luts/*.cube      film LUTs
  samples/*.jpg    sample photos
```

Run locally (a local server is needed because the LUTs are fetched):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## My role

I built this project end to end:

- **Product:** defined the problem and scoped the "match by light" approach
- **Design:** interaction flow and the dark, film-inspired visual language
- **Engineering:** front-end, the light-measurement heuristics, the scoring model and the LUT renderer
- **AI-assisted development:** used AI coding tools to move faster, while setting the direction, making the algorithmic trade-offs and reviewing everything that shipped

## Next steps

- WebGL rendering at full resolution, with export
- LLM-written recommendations through a server-side proxy (API keys never reach the browser)
- Read EXIF data (white balance, ISO) to sharpen the reading

## Credits

- Film LUTs from the open-source [G'MIC](https://gmic.eu/) film emulation collection.
- Sample photos from [scikit-image](https://scikit-image.org/docs/stable/api/skimage.data.html): *Eileen Collins* (NASA, public domain), *Coffee* (Rachel Michetti, CC0), *Chelsea the cat* (Stefan van der Walt, CC0), *DSCOVR launch* (SpaceX, public domain).

---

## 中文说明

**[▶ 在线体验](https://yunruilin99.github.io/filter-light-meter/)**

手机和相机里有几十款胶片模拟，挑选时往往只能一个个试。这个工具把顺序反过来：**先读懂照片本身的光**，再推荐最合适的几款胶片，并说明理由。

**功能**

- **光线读数**：基于照片的真实像素，估算色温（2800–8000K）、明暗、对比和饱和度
- **胶片匹配**：覆盖彩色负片、正片、富士数字模拟、黑白、一次成像和电影正片共 42 款，按加权打分推荐前四名，并附推荐理由
- **真实 LUT 预览**：用每款胶片的 `.cube` 3D LUT 逐像素渲染，按住预览图即可与原图对比
- **实时调整**：排除某些胶片类别或手动指定场景，推荐结果立即刷新
- **隐私友好**：所有计算都在浏览器本地完成，照片不会上传
- **中英双语**：可随时切换

**实现原理**

1. **测光**：把照片缩到 120px 后逐像素统计，用红蓝通道比估算色温，用亮度 P5–P95 百分位差衡量对比，用平均饱和度和绿色像素占比辅助判断场景
2. **匹配**：每款胶片都标注了适合的明暗、对比、色温和饱和区间，加权打分后排序
3. **渲染**：只按需加载被推荐胶片的 LUT，在 Canvas 上做三线性插值

**我的角色**：独立完成产品构思与需求定义、交互与视觉设计、前端开发与算法实现。开发过程中借助 AI 辅助编码，由我把控方向、做算法取舍并审校最终代码。
