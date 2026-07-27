/* =============================================================
   VITRA — script.js
   Handles: loading screen, navbar state, mobile menu, language
   menu, circuit-trace canvas background, scroll reveals, custom
   cursor, service-card cursor glow, animated stat counters.
   ============================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initVitraLanguage();
  initLoader();
  initNavbar();
  initMobileMenu();
  initLangMenu();
  initCircuitCanvas();
  initReveal();
  initCursor();
  initCardGlow();
  initCounters();
});

/* ---------- Loading screen ---------- */
function initLoader() {
  const loader = document.getElementById("vitra-loader");
  if (!loader) return;
  const hide = () => loader.classList.add("is-hidden");
  window.addEventListener("load", () => setTimeout(hide, 500));
  setTimeout(hide, 2200);
}

/* ---------- Navbar scroll state ---------- */
function initNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  const scrim = document.querySelector(".menu-scrim");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.classList.remove("is-active");
    menu.classList.remove("is-open");
    scrim && scrim.classList.remove("is-open");
    document.body.style.overflow = "";
  };
  const open = () => {
    toggle.classList.add("is-active");
    menu.classList.add("is-open");
    scrim && scrim.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  toggle.addEventListener("click", () => {
    toggle.classList.contains("is-active") ? close() : open();
  });
  scrim && scrim.addEventListener("click", close);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------- Language dropdown ---------- */
function initLangMenu() {
  const switches = document.querySelectorAll(".lang-switch");
  switches.forEach((sw) => {
    const trigger = sw.querySelector(".lang-trigger");
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !sw.classList.contains("is-open");
      switches.forEach((s) => s.classList.remove("is-open"));
      if (willOpen) sw.classList.add("is-open");
    });
    sw.querySelectorAll(".lang-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        applyVitraLanguage(opt.getAttribute("data-lang"));
        sw.classList.remove("is-open");
      });
    });
  });
  document.addEventListener("click", () => {
    switches.forEach((s) => s.classList.remove("is-open"));
  });
}

/* ---------- Circuit trace canvas ---------- */
function initCircuitCanvas() {
  const canvas = document.getElementById("circuit-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height, nodes, pulses;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildGrid() {
    width = canvas.width = canvas.offsetWidth * devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    const cols = Math.max(6, Math.floor(cw / 130));
    const rows = Math.max(4, Math.floor(ch / 130));
    nodes = [];

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const jitter = 26;
        nodes.push({
          x: (i / cols) * cw + (Math.random() - 0.5) * jitter,
          y: (j / rows) * ch + (Math.random() - 0.5) * jitter,
          col: i,
          row: j,
        });
      }
    }

    pulses = [];
    const pulseCount = Math.min(10, Math.floor((cols * rows) / 6));
    for (let i = 0; i < pulseCount; i++) {
      pulses.push(createPulse());
    }
  }

  function findNode(col, row) {
    return nodes.find((n) => n.col === col && n.row === row);
  }

  function createPulse() {
    const start = nodes[Math.floor(Math.random() * nodes.length)];
    const dirs = [
      { c: 1, r: 0 }, { c: -1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: -1 },
    ];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const end = findNode(start.col + dir.c, start.row + dir.r) || start;
    return { start, end, t: 0, speed: 0.006 + Math.random() * 0.01 };
  }

  function draw() {
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    ctx.clearRect(0, 0, cw, ch);

    ctx.strokeStyle = "rgba(88, 166, 255, 0.08)";
    ctx.lineWidth = 1;
    nodes.forEach((n) => {
      const right = findNode(n.col + 1, n.row);
      const down = findNode(n.col, n.row + 1);
      if (right) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      if (down) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(down.x, down.y);
        ctx.stroke();
      }
    });

    ctx.fillStyle = "rgba(88, 166, 255, 0.18)";
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    pulses.forEach((p, idx) => {
      p.t += p.speed;
      if (p.t >= 1) {
        pulses[idx] = createPulse();
        return;
      }
      const x = p.start.x + (p.end.x - p.start.x) * p.t;
      const y = p.start.y + (p.end.y - p.start.y) * p.t;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 10);
      grad.addColorStop(0, "rgba(88, 166, 255, 0.95)");
      grad.addColorStop(1, "rgba(88, 166, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  buildGrid();
  draw();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      buildGrid();
      if (reduceMotion) draw();
    }, 200);
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Custom cursor (desktop / fine pointer only) ---------- */
function initCursor() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover) return;

  const cursor = document.createElement("div");
  cursor.className = "vitra-cursor";
  const dot = document.createElement("div");
  dot.className = "vitra-cursor-dot";
  document.body.append(cursor, dot);

  let cx = 0, cy = 0, dx = 0, dy = 0;
  window.addEventListener("mousemove", (e) => {
    dx = e.clientX; dy = e.clientY;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
  });

  function loop() {
    cx += (dx - cx) * 0.18;
    cy += (dy - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll("a, button, .service-card, .discipline-card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  });
}

/* ---------- Service card cursor-follow glow ---------- */
function initCardGlow() {
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length === 0) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const duration = 1400;
        const startTime = performance.now();
        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => io.observe(el));
                            }
