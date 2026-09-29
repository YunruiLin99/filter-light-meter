import { loadLUT, applyLUT, toCanvas, cropToImageData } from "./lut.js";
import { measure } from "./analyze.js";
import { LIGHTS, lightOf, guessLight, SIMS, simOf, rankSims, NEWER_ONLY } from "./sims.js";
import { checkRecipe, DEFAULT_RECIPE } from "./checks.js";
import { STRINGS } from "./i18n.js";

const $ = (s, root = document) => root.querySelector(s);
const HERO = ["xtransProvia", "classicchrome", "proneghi", "xtransVelvia"];
const CARD_W = 480, CARD_H = 360;
const TONES = [-2, -1, 0, 1, 2, 3, 4];

const state = {
  lang: new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh",
  reading: null,     // measure() 的结果
  source: null,      // 预览用的裁剪图
  usingSample: false,
  lightKey: null,
  lightAuto: null,   // 自动判断的光线类型
  checked: false,    // 是否已做过体检（切换光线时自动重算）
  seq: 0,
};
const t = (k) => STRINGS[state.lang][k] ?? k;
const L = (zh, en) => (state.lang === "zh" ? zh : en);

/* ---------- 语言 ---------- */
function applyLang() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("meta.title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll(".lang-toggle [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  renderLightChips();
  renderReadout();
  if (state.lightKey) { renderCards(); if (state.checked) runCheck(); }
}
function setLang(lang) {
  if (lang === state.lang) return;
  state.lang = lang;
  const url = new URL(location.href);
  if (lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
  history.replaceState(null, "", url);
  applyLang();
}

/* ---------- 首屏胶片条 ---------- */
async function renderHeroStrip() {
  const strip = $("#strip");
  try {
    const img = await loadImage("assets/samples/portrait.jpg");
    const src = cropToImageData(img, 360, 450);
    const luts = await Promise.all(HERO.map(loadLUT));
    strip.querySelectorAll(".frame").forEach((frame, i) => {
      const cv = toCanvas(applyLUT(src, luts[i]));
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", frame.textContent.trim());
      frame.prepend(cv);
      frame.classList.add("ready");
    });
  } catch (e) {
    console.warn("Hero strip unavailable:", e);
    strip.classList.add("hidden");
  }
}

/* ---------- 照片与测光 ---------- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(t("err.load")));
    img.src = src;
  });
}

async function usePhoto(src, sampleName = null) {
  try {
    const img = await loadImage(src);
    state.reading = measure(img);
    state.source = cropToImageData(img, CARD_W, CARD_H);
    state.usingSample = false;
    state.lightAuto = guessLight(state.reading);
    state.lightKey = state.lightAuto;
    $("#preview").src = src;
    $("#drop").classList.add("hidden");
    $("#loaded").classList.remove("hidden");
    $("#error").classList.add("hidden");
    document.querySelectorAll("[data-sample]").forEach((b) => b.classList.toggle("active", b.dataset.sample === sampleName));
    renderReadout();
    renderLightChips();
    await showSteps();
    $("#step2").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (e) {
    console.error(e);
    showError(e.message || String(e));
  }
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) { showError(t("err.notImage")); return; }
  const reader = new FileReader();
  reader.onload = () => usePhoto(reader.result);
  reader.onerror = () => showError(t("err.load"));
  reader.readAsDataURL(file);
}

function resetPhoto() {
  state.reading = state.source = null;
  state.lightAuto = null;
  $("#file").value = "";
  $("#loaded").classList.add("hidden");
  $("#drop").classList.remove("hidden");
  document.querySelectorAll("[data-sample]").forEach((b) => b.classList.remove("active"));
  renderLightChips();
  if (state.lightKey) showSteps();
}

function showError(msg) {
  const el = $("#error");
  el.innerHTML = "";
  const b = document.createElement("b");
  b.textContent = t("err.prefix") + " ";
  el.append(b, document.createTextNode(msg));
  el.classList.remove("hidden");
}

function renderReadout() {
  const r = state.reading;
  if (!r) return;
  $("#r-k").textContent = `≈ ${r.kelvin}K`;
  $("#r-bright").textContent = { bright: L("偏亮", "Bright"), mid: L("适中", "Medium"), dark: L("偏暗", "Dark") }[r.bright];
  $("#r-contrast").textContent = { high: L("高", "High"), mid: L("中", "Medium"), low: L("低", "Low") }[r.contrast];
}

/* ---------- 光线类型 ---------- */
function renderLightChips() {
  const box = $("#light-chips");
  box.setAttribute("aria-label", t("light.label"));
  box.innerHTML = "";
  LIGHTS.forEach((l) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-pressed", String(l.key === state.lightKey));
    b.textContent = l[state.lang];
    if (l.key === state.lightAuto) {
      const tag = document.createElement("span");
      tag.className = "auto-tag mono";
      tag.textContent = t("light.auto");
      b.append(tag);
    }
    b.onclick = () => { state.lightKey = l.key; renderLightChips(); showSteps(); };
    box.append(b);
  });
}

async function showSteps() {
  if (!state.source) {
    // 没有照片也能用：先用示例照片预览
    const img = await loadImage("assets/samples/portrait.jpg");
    state.source = cropToImageData(img, CARD_W, CARD_H);
    state.usingSample = true;
  }
  $("#step2").classList.remove("hidden");
  $("#step3").classList.remove("hidden");
  $("#s2-sample").classList.toggle("hidden", !state.usingSample);
  await renderCards();
  if (state.checked) runCheck();
}

/* ---------- 推荐的胶片模拟 ---------- */
async function renderCards() {
  const seq = ++state.seq;
  const light = lightOf(state.lightKey);
  const ranked = rankSims(state.lightKey, state.reading, 3);
  let luts;
  try {
    luts = await Promise.all(ranked.map((x) => loadLUT(x.sim.lut)));
  } catch (e) {
    console.error(e);
    showError(t("err.lut"));
    return;
  }
  if (seq !== state.seq) return;
  const cards = $("#cards");
  cards.innerHTML = "";
  const original = toCanvas(state.source);
  ranked.forEach(({ sim }, i) => {
    const fit = sim.good.includes(state.lightKey) ? L(`很适合${light.zh}`, `suits ${light.en.toLowerCase()}`)
      : L(`在${light.zh}下可以用`, `works in ${light.en.toLowerCase()}`);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="shot" tabindex="0" role="button">
        <span class="shot-tag mono"></span>
        <span class="shot-hint mono"></span>
      </div>
      <div class="card-body">
        <div class="card-head"><span class="rank mono"></span><span class="score mono"></span></div>
        <h3 class="fname"></h3>
        <p class="reason"><b></b><span></span></p>
      </div>`;
    const shot = $(".shot", card);
    const filmCv = toCanvas(applyLUT(state.source, luts[i]));
    filmCv.className = "film";
    const origCv = original.cloneNode();
    origCv.getContext("2d").drawImage(original, 0, 0);
    origCv.className = "orig";
    shot.prepend(filmCv, origCv);
    shot.setAttribute("aria-label", `${sim.name} — ${t("card.hold")}`);
    const tagText = t(`card.${sim.preview}`);
    $(".shot-tag", card).textContent = tagText;
    $(".shot-hint", card).textContent = t("card.hold");
    $(".rank", card).textContent = `${t("card.pick")} ${String(i + 1).padStart(2, "0")}`;
    $(".score", card).textContent = fit;
    $(".fname", card).textContent = sim.name;
    $(".reason b", card).remove();
    $(".reason span", card).textContent = sim[state.lang] + L("。", ".");
    if (NEWER_ONLY.includes(sim.id)) {
      const n = document.createElement("p");
      n.className = "newer mono";
      n.textContent = t("card.newer");
      $(".card-body", card).append(n);
    }
    bindCompare(shot, tagText);
    cards.append(card);
  });
  const hasSelf = ranked.some(({ sim }) => sim.preview !== "gmic");
  $("#extra").classList.toggle("hidden", !hasSelf);
  $("#extra").textContent = t("preview.note");
}

function bindCompare(shot, tagText) {
  const tag = shot.querySelector(".shot-tag");
  const on = () => { shot.classList.add("comparing"); tag.textContent = L("原图", "Original"); };
  const off = () => { shot.classList.remove("comparing"); tag.textContent = tagText; };
  shot.addEventListener("pointerdown", (e) => { e.preventDefault(); on(); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => shot.addEventListener(ev, off));
  shot.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); on(); } });
  shot.addEventListener("keyup", off);
  shot.addEventListener("blur", off);
  shot.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* ---------- 配方体检 ---------- */
function buildForm() {
  const simSel = $("#f-sim");
  simSel.innerHTML = SIMS.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  const tone = (v) => `<option value="${v}">${v > 0 ? "+" : ""}${v}</option>`;
  $("#f-hl").innerHTML = TONES.map(tone).join("");
  $("#f-sh").innerHTML = TONES.map(tone).join("");
  const shift = (v) => `<option value="${v}">${v > 0 ? "+" : ""}${v}</option>`;
  const SH = Array.from({ length: 19 }, (_, i) => i - 9);
  $("#f-wbr").innerHTML = SH.map(shift).join("");
  $("#f-wbb").innerHTML = SH.map(shift).join("");
  $("#f-wbr").value = "0";
  $("#f-wbb").value = "0";
  $("#f-hl").value = "0";
  $("#f-sh").value = "0";
  $("#f-wb").value = "auto";
  $("#f-iso").value = "auto6400";
  syncKelvin();
}
function syncKelvin() {
  $("#kelvin-field").classList.toggle("hidden", $("#f-wb").value !== "kelvin");
}
function readRecipe() {
  return {
    sim: $("#f-sim").value,
    wb: $("#f-wb").value,
    kelvin: Number($("#f-kelvin").value) || 5500,
    dr: $("#f-dr").value,
    highlight: Number($("#f-hl").value),
    shadow: Number($("#f-sh").value),
    iso: $("#f-iso").value,
    wbR: Number($("#f-wbr").value),
    wbB: Number($("#f-wbb").value),
  };
}
function fillRecipe(r) {
  $("#f-sim").value = r.sim;
  $("#f-wb").value = r.wb;
  $("#f-kelvin").value = r.kelvin;
  $("#f-dr").value = r.dr;
  $("#f-hl").value = String(r.highlight);
  $("#f-sh").value = String(r.shadow);
  $("#f-iso").value = r.iso;
  $("#f-wbr").value = String(r.wbR ?? 0);
  $("#f-wbb").value = String(r.wbB ?? 0);
  syncKelvin();
}

const ICON = { high: "✕", warn: "!", ok: "✓" };
function runCheck() {
  const box = $("#result");
  box.classList.remove("hidden");
  if (!state.lightKey) {
    box.innerHTML = `<p class="warn-line"></p>`;
    box.firstChild.textContent = t("res.needLight");
    return;
  }
  state.checked = true;
  const res = checkRecipe(readRecipe(), state.lightKey, state.reading, state.lang);
  const light = lightOf(state.lightKey);
  const summary = res.high || res.warn
    ? [res.high ? `<b class="c-high">${res.high}</b> ${t("res.high")}` : "", res.warn ? `<b class="c-warn">${res.warn}</b> ${t("res.warn")}` : ""].filter(Boolean).join(L("，", ", "))
    : t("res.clean");
  box.innerHTML = `
    <div class="res-head">
      <h4>${t("res.title")} · ${light[state.lang]} · ${simOf(readRecipe().sim).name}</h4>
      <p>${summary}</p>
    </div>
    <ul class="res-list"></ul>`;
  const ul = $(".res-list", box);
  res.items.forEach((it) => {
    const li = document.createElement("li");
    li.className = `res-item ${it.level}`;
    li.innerHTML = `
      <span class="lvl"><i aria-hidden="true">${ICON[it.level]}</i><span></span></span>
      <div class="res-main"><h5></h5><p class="res-detail"></p></div>`;
    $(".lvl span", li).textContent = t(`lvl.${it.level}`);
    $("h5", li).textContent = it.title;
    $(".res-detail", li).textContent = it.detail;
    if (it.fix) {
      const p = document.createElement("p");
      p.className = "res-fix";
      const b = document.createElement("b");
      b.textContent = t("res.fix");
      p.append(b, document.createTextNode(it.fix));
      $(".res-main", li).append(p);
    }
    ul.append(li);
  });
}

/* ---------- 初始化 ---------- */
function init() {
  const drop = $("#drop"), file = $("#file");
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); handleFile(e.dataTransfer.files[0]); });
  file.addEventListener("change", (e) => handleFile(e.target.files[0]));
  $("#reset").addEventListener("click", resetPhoto);
  document.querySelectorAll("[data-sample]").forEach((b) => {
    b.addEventListener("click", () => usePhoto(`assets/samples/${b.dataset.sample}.jpg`, b.dataset.sample));
  });
  document.querySelectorAll(".lang-toggle [data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  buildForm();
  $("#f-wb").addEventListener("change", syncKelvin);
  $("#recipe").addEventListener("submit", (e) => { e.preventDefault(); runCheck(); });
  $("#example").addEventListener("click", () => { fillRecipe(DEFAULT_RECIPE); runCheck(); });
  applyLang();
  renderHeroStrip();
}

init();
