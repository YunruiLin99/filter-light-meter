import { FILMS, CATEGORIES } from "./films.js";
import { loadLUT, applyLUT, toCanvas, cropToImageData } from "./lut.js";
import { measure, rank, displayScore, autoScene } from "./analyze.js";
import * as T from "./i18n.js";

const $ = (s, root = document) => root.querySelector(s);
const SCENES = [null, "portrait", "landscape", "night", "daily"];
const HERO_FILMS = ["portra400", "kodak2383", "polaroid669", "trix400"];
const CARD_W = 480, CARD_H = 360;

const state = {
  lang: initialLang(),
  img: null,          // HTMLImageElement of the current photo
  reading: null,      // result of measure()
  source: null,       // centre-cropped ImageData used for card previews
  enabled: new Set(CATEGORIES),
  sceneOverride: null,
  seq: 0,             // guards against out-of-order async renders
};

function initialLang() {
  const q = new URLSearchParams(location.search).get("lang");
  return q === "en" ? "en" : "zh"; // 默认中文，?lang=en 切换英文
}
const t = (key) => T.STRINGS[state.lang][key] ?? key;

/* ---------- language ---------- */
function applyLang() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("meta.title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll(".lang-toggle [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  document.querySelectorAll("[data-film-label]").forEach((el) => {
    const f = FILMS.find((x) => x.id === el.dataset.filmLabel);
    if (f) el.textContent = f.name[state.lang];
  });
  buildChips();
  if (state.reading) renderResults();
}
function setLang(lang) {
  if (lang === state.lang) return;
  state.lang = lang;
  const url = new URL(location.href);
  if (lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
  history.replaceState(null, "", url);
  applyLang();
}

/* ---------- hero film strip ---------- */
async function renderHeroStrip() {
  const strip = $("#strip");
  try {
    const img = await loadImage("assets/samples/portrait.jpg");
    const src = cropToImageData(img, 360, 450);
    const luts = await Promise.all(HERO_FILMS.map(loadLUT));
    strip.querySelectorAll(".frame").forEach((frame, i) => {
      const cv = toCanvas(applyLUT(src, luts[i]));
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", FILMS.find((f) => f.id === HERO_FILMS[i]).name.en);
      frame.prepend(cv);
      frame.classList.add("ready");
    });
  } catch (e) {
    console.warn("Hero strip unavailable:", e);
    strip.classList.add("hidden");
  }
}

/* ---------- loading photos ---------- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(t("err.load")));
    img.src = src;
  });
}

async function usePhoto(src) {
  try {
    const img = await loadImage(src);
    state.img = img;
    state.reading = measure(img);
    state.source = cropToImageData(img, CARD_W, CARD_H);
    $("#preview").src = src;
    $("#drop").classList.add("hidden");
    $("#loaded").classList.remove("hidden");
    await renderResults();
    $("#results").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (e) {
    console.error(e);
    showError(e.message || String(e));
  }
}

function markSample(name) {
  document.querySelectorAll("[data-sample]").forEach((b) => b.classList.toggle("active", b.dataset.sample === name));
}

function handleFile(file) {
  markSample(null);
  if (!file || !file.type.startsWith("image/")) { showError(t("err.notImage")); return; }
  const reader = new FileReader();
  reader.onload = () => usePhoto(reader.result);
  reader.onerror = () => showError(t("err.load"));
  reader.readAsDataURL(file);
}

function resetAll() {
  state.img = state.reading = state.source = null;
  state.seq++;
  $("#file").value = "";
  markSample(null);
  $("#loaded").classList.add("hidden");
  $("#drop").classList.remove("hidden");
  $("#results").classList.add("hidden");
  $("#error").classList.add("hidden");
  $("#drop").focus();
}

function showError(msg) {
  const el = $("#error");
  el.innerHTML = "";
  const b = document.createElement("b");
  b.textContent = t("err.prefix") + " ";
  el.append(b, document.createTextNode(msg));
  el.classList.remove("hidden");
  $("#results").classList.add("hidden");
}

/* ---------- chips ---------- */
function buildChips() {
  const cats = $("#catchips");
  cats.innerHTML = "";
  CATEGORIES.forEach((key) => {
    const on = state.enabled.has(key);
    const b = chip(t("cat." + key), on);
    b.onclick = () => {
      if (on && state.enabled.size === 1) return; // keep at least one category
      on ? state.enabled.delete(key) : state.enabled.add(key);
      buildChips();
      if (state.reading) renderResults();
    };
    cats.append(b);
  });

  const scenes = $("#scenechips");
  scenes.innerHTML = "";
  SCENES.forEach((key) => {
    const b = chip(t("scene." + (key ?? "auto")), state.sceneOverride === key);
    b.onclick = () => { state.sceneOverride = key; buildChips(); if (state.reading) renderResults(); };
    scenes.append(b);
  });
}
function chip(label, on) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip" + (on ? "" : " off");
  b.textContent = label;
  b.setAttribute("aria-pressed", String(on));
  return b;
}

/* ---------- results ---------- */
async function renderResults() {
  const seq = ++state.seq;
  const r = state.reading, lang = state.lang;
  const scene = state.sceneOverride ?? autoScene(r);

  $("#error").classList.add("hidden");
  $("#results").classList.remove("hidden");
  $("#r-summary").textContent = T.summary(r, lang);
  $("#r-scene").textContent = T.sceneName(scene, lang);
  $("#r-light").textContent = T.lightingLabel(r, lang);
  $("#r-bright").textContent = T.brightLabel(r, lang);
  $("#r-contrast").textContent = T.contrastLabel(r, lang);
  const pct = ((r.kelvin - 2800) / (8000 - 2800)) * 100;
  const needle = $("#needle");
  needle.style.left = `calc(${pct}% - 1px)`;
  needle.dataset.k = `${r.kelvin}K`;
  needle.style.setProperty("--tx", pct < 8 ? "-2px" : pct > 92 ? "calc(-100% + 2px)" : "-50%");
  const tags = $("#r-tags");
  tags.innerHTML = "";
  T.moodTags(r, lang).forEach((x) => {
    const s = document.createElement("span");
    s.className = "tag";
    s.textContent = "# " + x;
    tags.append(s);
  });

  const ranked = rank(FILMS, r, state.enabled);
  const cards = $("#cards");
  cards.setAttribute("aria-busy", "true");
  let luts;
  try {
    luts = await Promise.all(ranked.map((x) => loadLUT(x.film.id)));
  } catch (e) {
    console.error(e);
    if (seq === state.seq) showError(t("err.lut"));
    return;
  }
  if (seq !== state.seq) return; // a newer render has started

  const original = toCanvas(state.source);
  cards.innerHTML = "";
  ranked.forEach(({ film, raw }, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="shot" tabindex="0" role="button">
        <span class="shot-tag mono"></span>
        <span class="shot-hint mono"></span>
      </div>
      <div class="card-body">
        <div class="card-head">
          <span class="rank mono"></span>
          <span class="score mono"></span>
        </div>
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
    shot.setAttribute("aria-label", `${film.name[lang]} — ${t("card.hold")}`);
    $(".shot-tag", card).textContent = "LUT";
    $(".shot-hint", card).textContent = t("card.hold");
    $(".rank", card).textContent = `${t("card.rank")} ${String(i + 1).padStart(2, "0")}`;
    $(".score", card).textContent = `${t("card.match")} ${displayScore(raw)}`;
    $(".fname", card).textContent = film.name[lang];
    $(".reason b", card).textContent = t("card.why");
    $(".reason span", card).textContent = T.whyText(film, r, scene, state.sceneOverride !== null, lang);
    bindCompare(shot);
    cards.append(card);
  });
  cards.setAttribute("aria-busy", "false");
}

// Press and hold (mouse, touch, or Space/Enter) to see the unprocessed photo.
function bindCompare(shot) {
  const tag = shot.querySelector(".shot-tag");
  const on = () => { shot.classList.add("comparing"); tag.textContent = t("card.original"); };
  const off = () => { shot.classList.remove("comparing"); tag.textContent = "LUT"; };
  shot.addEventListener("pointerdown", (e) => { e.preventDefault(); on(); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => shot.addEventListener(ev, off));
  shot.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); on(); } });
  shot.addEventListener("keyup", off);
  shot.addEventListener("blur", off);
  shot.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* ---------- wiring ---------- */
function init() {
  const drop = $("#drop"), file = $("#file");
  drop.addEventListener("click", () => file.click());
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); handleFile(e.dataTransfer.files[0]); });
  file.addEventListener("change", (e) => handleFile(e.target.files[0]));
  $("#reset").addEventListener("click", resetAll);

  document.querySelectorAll("[data-sample]").forEach((b) => {
    b.addEventListener("click", () => {
      markSample(b.dataset.sample);
      usePhoto(`assets/samples/${b.dataset.sample}.jpg`);
    });
  });
  document.querySelectorAll(".lang-toggle [data-lang]").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });

  applyLang();
  renderHeroStrip();
}

init();
