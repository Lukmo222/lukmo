(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= i18n ================= */
  const LANGS = ["sl", "en"];
  const params = new URLSearchParams(location.search);
  let lang =
    (LANGS.includes(params.get("lang")) && params.get("lang")) ||
    localStorage.getItem("lang") ||
    ((navigator.language || "").toLowerCase().startsWith("sl") ? "sl" : "en");

  const t = (key) => (I18N[lang] && I18N[lang][key]) ?? I18N.sl[key] ?? key;

  function applyLang(next, animate) {
    lang = next;
    localStorage.setItem("lang", lang);
    const run = () => {
      document.documentElement.lang = lang;
      document.title = t("meta.title");
      $('meta[name="description"]').setAttribute("content", t("meta.desc"));
      $$("[data-i18n]").forEach((el) => {
        const v = t(el.dataset.i18n);
        if (typeof v === "string") el.innerHTML = v;
      });
      $("#softSkills").innerHTML = t("skills.soft").map((s) => `<li>${s}</li>`).join("");
      $$(".lang-switch button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
      const url = new URL(location);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
      restartTyped();
      document.body.classList.remove("lang-switching");
    };
    if (animate && !reduceMotion) {
      document.body.classList.add("lang-switching");
      setTimeout(run, 180);
    } else run();
  }
  $$(".lang-switch button").forEach((b) =>
    b.addEventListener("click", () => b.dataset.lang !== lang && applyLang(b.dataset.lang, true))
  );

  /* ================= typed text ================= */
  let typedTimer;
  function restartTyped() {
    clearTimeout(typedTimer);
    const el = $("#typed");
    const words = t("hero.typed");
    if (reduceMotion) { el.textContent = words.join(" · "); return; }
    let w = 0, i = 0, del = false;
    const tick = () => {
      const word = words[w];
      i += del ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = del ? 35 : 75;
      if (!del && i === word.length) { del = true; delay = 1600; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; delay = 300; }
      typedTimer = setTimeout(tick, delay);
    };
    tick();
  }

  /* ================= nav ================= */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach((a) => a.addEventListener("click", () => {
    links.classList.remove("open"); burger.setAttribute("aria-expanded", false);
  }));

  // active link on scroll
  const sections = $$("main section[id]");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        $$("a", links).forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ================= reveal + counters ================= */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      $$("[data-count]", e.target).forEach(countUp);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, idx) => {
    el.style.transitionDelay = `${(idx % 4) * 70}ms`;
    revealObs.observe(el);
  });
  function countUp(el) {
    const end = +el.dataset.count, dur = 1200, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    reduceMotion ? (el.textContent = end) : requestAnimationFrame(step);
  }

  /* ================= project filters ================= */
  $$(".filters button").forEach((btn) => btn.addEventListener("click", () => {
    $$(".filters button").forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    $$(".project").forEach((p) => p.classList.toggle("hidden", f !== "all" && !p.dataset.tags.split(" ").includes(f)));
  }));

  /* ================= tilt (chip + skill cards) ================= */
  const fine = matchMedia("(pointer: fine)").matches;
  if (fine && !reduceMotion) {
    const chip = $("#chip");
    addEventListener("mousemove", (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      chip.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg)`;
      const g = $(".cursor-glow");
      g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px";
    }, { passive: true });
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  /* ================= copy email ================= */
  $("#copyEmail").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText("luka.treven5@gmail.com");
      btn.textContent = t("contact.copied");
      setTimeout(() => (btn.textContent = t("contact.copy")), 1800);
    } catch { location.href = "mailto:luka.treven5@gmail.com"; }
  });

  $("#year").textContent = new Date().getFullYear();

  /* ================= PCB trace background ================= */
  const cv = $("#circuit"), ctx = cv.getContext("2d");
  const GRID = 28;
  let W, H, traces = [], pulses = [];
  function buildTraces() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    traces = [];
    const count = Math.round((W * H) / 22000);
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let n = 0; n < count; n++) {
      let x = Math.round((Math.random() * W) / GRID) * GRID, y = Math.round((Math.random() * H) / GRID) * GRID;
      const pts = [[x, y]];
      let d = dirs[Math.floor(Math.random() * 4)];
      const segs = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs; s++) {
        const len = (1 + Math.floor(Math.random() * 4)) * GRID;
        x += d[0] * len; y += d[1] * len; pts.push([x, y]);
        // turn 45° left or right, PCB style
        const i = dirs.indexOf(d), turn = Math.random() < 0.5 ? 4 : -4;
        d = dirs[(((i + turn) % 8) + 8) % 8] || dirs[0];
        if (Math.random() < 0.5) d = dirs[Math.floor(Math.random() * 4)];
      }
      let length = 0;
      for (let k = 1; k < pts.length; k++) length += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      traces.push({ pts, length });
    }
    pulses = traces.filter(() => Math.random() < 0.35).map((tr) => ({ tr, p: Math.random(), v: 0.0015 + Math.random() * 0.003 }));
  }
  function pointAt(tr, p) {
    let dist = p * tr.length;
    for (let k = 1; k < tr.pts.length; k++) {
      const [x0, y0] = tr.pts[k - 1], [x1, y1] = tr.pts[k];
      const L = Math.hypot(x1 - x0, y1 - y0);
      if (dist <= L) return [x0 + ((x1 - x0) * dist) / L, y0 + ((y1 - y0) * dist) / L];
      dist -= L;
    }
    return tr.pts[tr.pts.length - 1];
  }
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(245,158,11,0.10)";
    traces.forEach(({ pts }) => {
      ctx.beginPath(); ctx.moveTo(...pts[0]);
      pts.slice(1).forEach((p) => ctx.lineTo(...p));
      ctx.stroke();
      [pts[0], pts[pts.length - 1]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,158,11,0.18)"; ctx.fill();
      });
    });
  }
  function frame() {
    drawStatic();
    pulses.forEach((pl) => {
      pl.p += pl.v; if (pl.p > 1) pl.p = 0;
      const [x, y] = pointAt(pl.tr, pl.p);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
      g.addColorStop(0, "rgba(34,211,238,0.9)"); g.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    });
    if (!document.hidden) requestAnimationFrame(frame); else running = false;
  }
  let rt, running = false;
  const start = () => { if (!running && !reduceMotion) { running = true; requestAnimationFrame(frame); } };
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { buildTraces(); if (reduceMotion) drawStatic(); }, 200); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  buildTraces();
  reduceMotion ? drawStatic() : start();

  /* ================= init ================= */
  applyLang(lang, false);
})();
