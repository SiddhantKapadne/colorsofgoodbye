function initPlanetStepper() {
  const stepper = document.querySelector(".planet-stepper-hybrid .planet-stepper");
  if (!stepper) return;

  const steps = Array.from(stepper.querySelectorAll(".planet-step"));
  const links = Array.from(stepper.querySelectorAll(".planet-step-link"));
  const panes = Array.from(document.querySelectorAll(".planet-stepper-hybrid .planet-pane"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!steps.length || !panes.length) return;
  let activePlanet = "";
  let scrollTicking = false;

  function setActiveByPlanet(planet) {
    if (!planet || activePlanet === planet) return;
    activePlanet = planet;
    steps.forEach((step) => {
      const isActive = step.dataset.planet === planet;
      step.classList.toggle("active", isActive);
      if (isActive) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href");
      const target = href ? document.querySelector(href) : null;
      if (!target) return;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      setActiveByPlanet(target.dataset.planet || "");
    });
  });

  function syncActiveStepOnScroll() {
    const focusY = window.innerHeight * 0.45;
    let closestPane = null;
    let minDistance = Number.POSITIVE_INFINITY;

    panes.forEach((pane) => {
      const rect = pane.getBoundingClientRect();
      const paneCenter = rect.top + rect.height / 2;
      const distance = Math.abs(paneCenter - focusY);
      if (distance < minDistance) {
        minDistance = distance;
        closestPane = pane;
      }
    });

    if (closestPane?.dataset.planet) {
      setActiveByPlanet(closestPane.dataset.planet);
    }
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      syncActiveStepOnScroll();
      scrollTicking = false;
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const planet = visible.target.dataset.planet;
      if (planet) setActiveByPlanet(planet);
    },
    {
      root: null,
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0.2, 0.45, 0.7, 1],
    }
  );

  panes.forEach((pane) => observer.observe(pane));
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", syncActiveStepOnScroll);
  setActiveByPlanet(panes[0].dataset.planet || "Mercury");
  syncActiveStepOnScroll();
}

initPlanetStepper();

/* --- Planetary color palette: build grid + copy hex --- */
const PALETTE_ROWS = [
  {
    name: "Mercury",
    colors: [
      "#FFFFFF",
      "#FFEFE0",
      "#FFD4A8",
      "#FF9F5C",
      "#FF6B35",
      "#E04D2E",
      "#C41E1E",
      "#8B1A1A",
      "#3D0A0A",
      "#000000",
    ],
  },
  {
    name: "Venus",
    colors: [
      "#FFF4B1",
      "#FFE68A",
      "#FFD966",
      "#F0B462",
      "#E8943C",
      "#D4782A",
      "#B86A2C",
      "#8B5324",
      "#4A3115",
      "#2B1B0F",
    ],
  },
  {
    name: "Earth",
    colors: [
      "#FFF8DC",
      "#FFEFC4",
      "#FFD89B",
      "#FFB366",
      "#FF8C42",
      "#E85D3C",
      "#B82218",
      "#7A120E",
      "#4A0A0A",
      "#3B0A0A",
    ],
  },
  {
    name: "Mars",
    colors: [
      "#FFF1D0",
      "#FFE4A0",
      "#FFD080",
      "#C9A66B",
      "#8FD8FF",
      "#7BC8F6",
      "#9EC9FF",
      "#6CA6CD",
      "#2E5A8A",
      "#1E3A5F",
    ],
  },
  {
    name: "Jupiter",
    colors: [
      "#FFF8E7",
      "#F5E6D3",
      "#E8D4BC",
      "#D4B896",
      "#B8956A",
      "#9A7449",
      "#705332",
      "#4A351F",
      "#2A1E12",
      "#1C0F05",
    ],
  },
  {
    name: "Saturn",
    colors: [
      "#FFFEF5",
      "#FFEDC2",
      "#E8D4A8",
      "#D4BC94",
      "#80C4DE",
      "#87AFC7",
      "#5A8AAA",
      "#4A708B",
      "#2E4155",
      "#1C2A3A",
    ],
  },
  {
    name: "Uranus",
    colors: [
      "#F0FFFF",
      "#D9F7FF",
      "#B8ECFF",
      "#8FD8FF",
      "#5CC4F5",
      "#3AA8E0",
      "#2680C4",
      "#1A5688",
      "#0F3460",
      "#0A1A33",
    ],
  },
  {
    name: "Neptune",
    colors: [
      "#F0FFFF",
      "#B8E0FF",
      "#5CB0FF",
      "#1E90FF",
      "#1578DB",
      "#0047AB",
      "#003366",
      "#001F3D",
      "#000C1F",
      "#000814",
    ],
  },
  {
    name: "Pluto",
    colors: [
      "#FFFFFF",
      "#E8E8E8",
      "#DCDCDC",
      "#B0B0B0",
      "#909090",
      "#808080",
      "#606060",
      "#404040",
      "#1C1C1C",
      "#000000",
    ],
  },
];

function hexToRgb(hex) {
  const n = hex.replace("#", "").trim();
  const v = parseInt(n, 16);
  if (Number.isNaN(v)) return { r: 0, g: 0, b: 0 };
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function initColorPalette() {
  const grid = document.getElementById("paletteGrid");
  const toast = document.getElementById("copyToast");
  if (!grid) return;

  let toastTimer;
  let copiedCell;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2000);
  }

  PALETTE_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "palette-row";

    const label = document.createElement("div");
    label.className = "palette-planet-name";
    label.textContent = row.name;

    const cells = document.createElement("div");
    cells.className = "palette-cells";

    row.colors.forEach((rawHex) => {
      const hex = rawHex.toUpperCase();
      const { r, g, b } = hexToRgb(hex);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "palette-cell";
      btn.dataset.hex = hex;
      btn.setAttribute("aria-label", `Copy color ${hex}`);

      const hexEl = document.createElement("span");
      hexEl.className = "palette-hex";
      hexEl.textContent = hex;

      const mid = document.createElement("div");
      mid.className = "palette-mid";

      const sw = document.createElement("span");
      sw.className = "palette-swatch";
      sw.style.backgroundColor = hex;

      const rgbEl = document.createElement("span");
      rgbEl.className = "palette-rgb";
      rgbEl.innerHTML = `R ${r}<br>G ${g}<br>B ${b}`;

      const tag = document.createElement("span");
      tag.className = "palette-copied-tag";
      tag.textContent = "Copied";

      mid.appendChild(sw);
      mid.appendChild(rgbEl);

      btn.appendChild(hexEl);
      btn.appendChild(mid);
      btn.appendChild(tag);

      btn.addEventListener("click", async () => {
        const ok = await copyText(hex);
        if (copiedCell && copiedCell !== btn) copiedCell.classList.remove("is-copied");
        copiedCell = btn;
        if (ok) {
          btn.classList.add("is-copied");
          showToast(`Copied ${hex}`);
        } else {
          showToast("Could not copy — try again");
        }
      });

      cells.appendChild(btn);
    });

    rowEl.appendChild(label);
    rowEl.appendChild(cells);
    grid.appendChild(rowEl);
  });
}

initColorPalette();
