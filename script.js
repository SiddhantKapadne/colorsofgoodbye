const PLANET_STEPPER_DATA = [
  {
    id: "mercury",
    name: "Mercury",
    image: "assets/images/Mercury.png",
    alt: "Mercury sunset simulation",
    description: "Sharp contrast with fast darkening skies.",
  },
  {
    id: "venus",
    name: "Venus",
    image: "assets/images/Venus.png",
    alt: "Venus sunset simulation",
    description: "Dense haze softens sunset into warm bands.",
  },
  {
    id: "earth",
    name: "Earth",
    image: "assets/images/Earth.png",
    alt: "Earth sunset simulation",
    description: "Balanced scattering creates familiar orange-red tones.",
  },
  {
    id: "mars",
    name: "Mars",
    image: "assets/images/Mars.png",
    alt: "Mars sunset simulation",
    description: "Dust-rich air gives cooler, muted sunset edges.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    image: "assets/images/Jupiter.png",
    alt: "Jupiter sunset simulation",
    description: "Layered clouds blend amber and smoky hues.",
  },
  {
    id: "saturn",
    name: "Saturn",
    image: "assets/images/Saturn.png",
    alt: "Saturn sunset simulation",
    description: "Pale atmosphere fades light into soft gold.",
  },
  {
    id: "uranus",
    name: "Uranus",
    image: "assets/images/Uranus.png",
    alt: "Uranus sunset simulation",
    description: "Methane tint shifts sunset toward cyan blue.",
  },
  {
    id: "neptune",
    name: "Neptune",
    image: "assets/images/Neptune.png",
    alt: "Neptune sunset simulation",
    description: "Deep blue atmosphere creates dramatic cool dusk.",
  },
  {
    id: "pluto",
    name: "Pluto",
    image: "assets/images/Pluto.png",
    alt: "Pluto sunset simulation",
    description: "Thin air leaves a stark, low-light horizon.",
  },
];

function initHeroSunAutoScroll() {
  const heroSun = document.querySelector(".hero-sun");
  if (!heroSun) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  let didScrollAfterFade = false;
  heroSun.addEventListener("animationend", (event) => {
    if (didScrollAfterFade || event.animationName !== "heroSunFadeShrink") return;
    didScrollAfterFade = true;
    window.scrollTo({ top: 200, behavior: "smooth" });
  });
}

function initBackgroundMusic() {
  const bgMusic = document.getElementById("bgMusic");
  if (!bgMusic) return;

  bgMusic.volume = 0.17;
  bgMusic.loop = true;

  const tryPlay = () => {
    const playAttempt = bgMusic.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {
        // Autoplay can be blocked; retry on first user interaction.
      });
    }
  };

  tryPlay();

  const unlockAudio = () => {
    tryPlay();
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };

  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });
}

function initPlanetScrollStepper() {
  const section = document.getElementById("planetScrollStepper");
  const row = document.getElementById("planetStepperRow");
  const currentImage = document.getElementById("planetStageImageCurrent");
  const previousImage = document.getElementById("planetStageImagePrev");
  const description = document.getElementById("planetStageDescription");
  if (!section || !row || !currentImage || !previousImage || !description) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = mediaQuery.matches;
  let activeIndex = -1;
  let rafId = null;
  let transitionTimer = null;
  let jumpLock = false;

  section.style.height = `${PLANET_STEPPER_DATA.length * 100}vh`;

  PLANET_STEPPER_DATA.forEach((planet, index) => {
    const item = document.createElement("li");
    item.className = "planet-step";
    item.dataset.index = String(index);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "planet-stepper-btn";
    button.textContent = planet.name;
    button.setAttribute("aria-label", `${planet.name}: ${planet.description}`);
    button.addEventListener("click", () => {
      const sectionTop = section.offsetTop;
      const range = section.offsetHeight - window.innerHeight;
      const segmentStart = index / PLANET_STEPPER_DATA.length;
      const targetY = sectionTop + range * segmentStart + 1;

      // Jump directly to the selected segment without stepping through others.
      jumpLock = true;
      setActiveStep(index);
      window.scrollTo({ top: targetY, behavior: "auto" });
      window.setTimeout(() => {
        jumpLock = false;
        syncByScroll();
      }, reduceMotion ? 0 : 40);
    });

    item.appendChild(button);
    row.appendChild(item);
  });

  const stepItems = Array.from(row.querySelectorAll(".planet-step"));

  PLANET_STEPPER_DATA.forEach((planet) => {
    const img = new Image();
    img.src = planet.image;
  });

  function setActiveStep(nextIndex) {
    if (nextIndex === activeIndex) return;

    const prevIndex = activeIndex;
    const nextPlanet = PLANET_STEPPER_DATA[nextIndex];

    stepItems.forEach((item, i) => {
      const isActive = i === nextIndex;
      item.classList.toggle("is-active", isActive);
      const button = item.querySelector("button");
      if (!button) return;
      if (isActive) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    description.textContent = nextPlanet.description;
    currentImage.alt = nextPlanet.alt;

    if (prevIndex < 0 || reduceMotion) {
      if (transitionTimer) window.clearTimeout(transitionTimer);
      previousImage.className = "planet-stage-image is-hidden";
      previousImage.setAttribute("aria-hidden", "true");
      currentImage.src = nextPlanet.image;
      currentImage.className = prevIndex < 0 ? "planet-stage-image" : "planet-stage-image is-fade-only";
      transitionTimer = window.setTimeout(() => {
        currentImage.className = "planet-stage-image";
      }, 230);
      activeIndex = nextIndex;
      return;
    }

    if (transitionTimer) window.clearTimeout(transitionTimer);
    previousImage.src = currentImage.src;
    previousImage.className = "planet-stage-image is-leaving";
    previousImage.setAttribute("aria-hidden", "true");
    currentImage.src = nextPlanet.image;
    currentImage.className = "planet-stage-image is-entering";
    transitionTimer = window.setTimeout(() => {
      previousImage.className = "planet-stage-image is-hidden";
      currentImage.className = "planet-stage-image";
    }, 470);

    activeIndex = nextIndex;
  }

  function syncByScroll() {
    const rect = section.getBoundingClientRect();
    const scrollRange = rect.height - window.innerHeight;
    const progress = scrollRange <= 0 ? 0 : clamp(-rect.top / scrollRange, 0, 1);
    const nextIndex = clamp(
      Math.floor(progress * PLANET_STEPPER_DATA.length),
      0,
      PLANET_STEPPER_DATA.length - 1
    );
    setActiveStep(nextIndex);
  }

  function onScroll() {
    if (jumpLock) return;
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      syncByScroll();
    });
  }

  mediaQuery.addEventListener("change", (event) => {
    reduceMotion = event.matches;
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  syncByScroll();
}

initPlanetScrollStepper();
initHeroSunAutoScroll();
initBackgroundMusic();

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
