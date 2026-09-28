<div align="center">

# Film Light Meter · 光线读数

**读懂你的光，选对你的片。**
一个在浏览器里读取照片光线、推荐最契合胶片质感、并用真实 3D LUT 实时预览的小工具。

*Read the light. Pick the film.*

[**▶ 在线体验**](https://yunruilin99.github.io/filter-light-meter/) · [English](#english)

![Film Light Meter 首屏：同一张照片经过四款胶片 LUT 的实时渲染](docs/hero.jpg)

</div>

## 要解决的问题

手机和相机里有几十款胶片模拟，挑选时往往只能一个个试。这个工具把顺序反过来：**先读懂照片本身的光**，再推荐最合适的几款胶片，并说明理由。

## 功能

- **光线读数**：基于照片的真实像素，估算色温（2800–8000K）、明暗、对比和饱和度
- **胶片匹配**：覆盖彩色负片、正片、富士数字模拟、黑白、一次成像和电影正片共 42 款，加权打分后推荐前四名，并附推荐理由
- **真实 LUT 预览**：用每款胶片的 `.cube` 3D LUT 逐像素渲染，按住预览图即可与原图对比
- **实时调整**：排除某些胶片类别或手动指定场景，推荐结果立即刷新
- **隐私友好**：所有计算都在浏览器本地完成，照片不会上传
- **示例照片**：没有合适的照片时，点一下示例就能看到效果
- **中英双语**：默认中文，可一键切换英文

![推荐结果：色温读数与四款胶片在照片上的真实渲染效果](docs/results.jpg)

## 实现原理

```
照片 ──► 测光 ──► 匹配 ──► 渲染
         120px     42 款     .cube 3D LUT
         采样      胶片档案   三线性插值
```

1. **测光**（`assets/js/analyze.js`）：把照片缩到 120px 后逐像素统计。用红蓝通道比估算色温，用亮度 P5–P95 百分位差衡量对比，再用平均饱和度和绿色像素占比辅助判断场景（人像、风景、夜景或日常）。
2. **匹配**（`assets/js/analyze.js`、`assets/js/films.js`）：每款胶片都标注了适合的明暗、对比、色温和饱和区间，加权打分后排序。色温和明暗权重最高；夜景专用的高感胶片在日光场景下会被降权。
3. **渲染**（`assets/js/lut.js`）：只按需加载被推荐胶片的 LUT，并做缓存；在 `<canvas>` 上把每个像素通过 9×9×9 的 LUT 做三线性插值映射。

## 技术栈

原生 JavaScript（ES Modules）· Canvas 2D · 3D LUT（`.cube`）· HTML / CSS · 通过 GitHub Actions 部署到 GitHub Pages。不依赖任何框架，也不需要构建步骤。

```
index.html
assets/
  css/style.css
  js/app.js        界面、状态与渲染
  js/analyze.js    测光与胶片打分
  js/lut.js        .cube 解析与三线性插值 LUT 引擎
  js/films.js      42 款胶片档案（中英）
  js/i18n.js       界面文案与推荐理由生成（中 / 英）
  luts/*.cube      胶片 LUT
  samples/*.jpg    示例照片
```

本地运行（LUT 通过网络请求加载，需要起一个本地服务）：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 我的角色

这个项目由我独立完成：

- **产品**：定义问题，确定「按光匹配」的思路和功能范围
- **设计**：交互流程，以及暗色胶片风格的视觉语言
- **开发**：前端实现、测光算法、打分模型和 LUT 渲染引擎
- **AI 辅助开发**：借助 AI 编码工具提升效率，由我把控方向、做算法取舍并审校最终代码

## 下一步

- 用 WebGL 渲染全尺寸图片，并支持导出
- 通过服务端代理接入大模型，生成个性化推荐文案（API key 不暴露在浏览器中）
- 读取 EXIF（白平衡、ISO）来提升测光精度

## 致谢

- 胶片 LUT 源自开源的 [G'MIC](https://gmic.eu/) 胶片模拟合集
- 示例照片来自 [scikit-image](https://scikit-image.org/docs/stable/api/skimage.data.html)：*Eileen Collins*（NASA，公有领域）、*Coffee*（Rachel Michetti，CC0）、*Chelsea the cat*（Stefan van der Walt，CC0）、*DSCOVR launch*（SpaceX，公有领域）

---

## English

**[▶ Live demo](https://yunruilin99.github.io/filter-light-meter/?lang=en)** (English UI)

Photo apps and cameras offer dozens of film simulations, and choosing one usually means clicking through them all. Film Light Meter reverses that: it reads the light in your photo first, then recommends the few films that suit it and explains why.

- **Light reading:** estimates colour temperature (2800–8000K), brightness, contrast and saturation from the photo's pixels.
- **Film matching:** scores 42 film stocks and returns the top four with a reason for each.
- **Real LUT previews:** every pick is rendered through its `.cube` 3D LUT with trilinear interpolation. Press and hold to compare with the original.
- **Private:** everything runs in the browser, and photos are never uploaded.

**Stack:** vanilla JavaScript (ES modules), Canvas 2D and 3D LUTs, deployed to GitHub Pages via GitHub Actions. No frameworks and no build step.

**My role:** I built it end to end, covering product definition, interaction and visual design, front-end and algorithm implementation. I used AI-assisted coding, and I set the direction and reviewed everything that shipped.
