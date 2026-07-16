/* ==========================================================================
   FORGE FITNESS — SCRIPT.JS
   Table of contents:
   1. Utility helpers
   2. Loading screen
   3. Theme (day/night session) toggle
   4. Header scroll state + mobile navigation + active link highlight
   5. Toast notification system
   6. Rep counter widget
   7. One-rep max estimator widget
   8. Gear color randomizer widget
   9. Workout checklist (dynamic list) widget
   10. Generic carousel factory (used by hero, gallery, testimonials)
   11. Hero background image slider
   12. Gallery slider + lightbox preview
   13. Before/after comparison slider (drag + keyboard)
   14. Testimonial slider
   15. Animated counters (Intersection Observer)
   16. Scroll reveal animations (Intersection Observer)
   17. FAQ accordion
   18. Trial booking form validation
   19. Back to top button
   ========================================================================== */

"use strict";

/* -------------------------------------------------------------------------
   1. UTILITY HELPERS
   -------------------------------------------------------------------------- */
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* -------------------------------------------------------------------------
   2. LOADING SCREEN
   -------------------------------------------------------------------------- */
function initLoader() {
  const loader = qs("#loader");
  if (!loader) return;
  const hideLoader = () => loader.classList.add("is-hidden");
  window.addEventListener("load", () => setTimeout(hideLoader, 500));
  setTimeout(hideLoader, 3000); // safety net so the loader never blocks the page
}

/* -------------------------------------------------------------------------
   3. THEME TOGGLE (day / night session mode)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const toggleBtn = qs("#themeToggle");
  const STORAGE_KEY = "forgeFitness.theme";

  const applyTheme = (theme) => {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      toggleBtn.setAttribute("aria-pressed", "true");
      toggleBtn.setAttribute("aria-label", "Switch to night session mode");
    } else {
      root.removeAttribute("data-theme");
      toggleBtn.setAttribute("aria-pressed", "false");
      toggleBtn.setAttribute("aria-label", "Switch to day session mode");
    }
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  const systemPrefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;
  applyTheme(saved || (systemPrefersLight ? "light" : "dark"));

  toggleBtn.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    const nextTheme = isLight ? "dark" : "light";
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    showToast({
      title: `${nextTheme === "light" ? "Day" : "Night"} session mode enabled`,
      message: "Your preference has been saved.",
      type: "success",
    });
  });
}

/* -------------------------------------------------------------------------
   4. HEADER SCROLL STATE + MOBILE NAV + ACTIVE LINK HIGHLIGHT
   -------------------------------------------------------------------------- */
function initHeaderAndNav() {
  const header = qs("#siteHeader");
  const menuToggle = qs("#menuToggle");
  const nav = qs("#primaryNav");
  const navLinks = qsa("[data-nav-link]");
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) =>
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${id}`,
          ),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

/* -------------------------------------------------------------------------
   5. TOAST NOTIFICATION SYSTEM
   -------------------------------------------------------------------------- */
const TOAST_ICONS = { success: "✓", error: "!", warning: "⚠", info: "i" };

function showToast({ title, message = "", type = "info", duration = 4000 }) {
  const container = qs("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span class="toast__icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span class="toast__body">
      <span class="toast__title">${title}</span>
      ${message ? `<span class="toast__msg">${message}</span>` : ""}
    </span>
    <button class="toast__close" type="button" aria-label="Dismiss notification">✕</button>
  `;

  const remove = () => {
    toast.classList.add("is-leaving");
    toast.addEventListener("animationend", () => toast.remove(), {
      once: true,
    });
  };

  toast.querySelector(".toast__close").addEventListener("click", remove);
  container.appendChild(toast);
  setTimeout(remove, duration);
}

function initToastDemo() {
  const heroToastBtn = qs("#heroToastBtn");
  if (!heroToastBtn) return;
  heroToastBtn.addEventListener("click", () => {
    showToast({
      title: "Today's schedule",
      message:
        "6am Strength · 12pm Conditioning · 6pm Boxing · 7:30pm Open Floor",
      type: "info",
    });
  });
}

/* -------------------------------------------------------------------------
   6. REP COUNTER WIDGET
   -------------------------------------------------------------------------- */
function initClickCounter() {
  const valueEl = qs("#countValue");
  if (!valueEl) return;
  let count = 0;
  const render = () => {
    valueEl.textContent = count;
  };
  qs("#countPlus").addEventListener("click", () => {
    count += 1;
    render();
  });
  qs("#countMinus").addEventListener("click", () => {
    count = Math.max(0, count - 1);
    render();
  });
  qs("#countReset").addEventListener("click", () => {
    count = 0;
    render();
  });
}

/* -------------------------------------------------------------------------
   7. ONE-REP MAX ESTIMATOR WIDGET
   Uses the Epley formula (1RM = weight * (1 + reps / 30)).
   -------------------------------------------------------------------------- */
function initOneRepMaxCalculator() {
  const weightInput = qs("#oneRmWeight");
  const repsInput = qs("#oneRmReps");
  const output = qs("#oneRmOutput");
  const chips = qsa("[data-lift]");
  if (!weightInput) return;

  let activeLift = "Squat";

  const render = () => {
    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value, 10);
    if (!weight || !reps || weight <= 0 || reps <= 0) {
      output.textContent = "Your estimated 1RM appears here.";
      return;
    }
    const estimated1RM = weight * (1 + reps / 30);
    output.textContent = `Estimated ${activeLift} 1RM: ${estimated1RM.toFixed(1)} kg`;
  };

  weightInput.addEventListener("input", render);
  repsInput.addEventListener("input", render);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeLift = chip.dataset.lift;
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      render();
    });
  });
  chips[0].classList.add("is-active");
}

/* -------------------------------------------------------------------------
   8. GEAR COLOR RANDOMIZER WIDGET
   -------------------------------------------------------------------------- */
function initColorRandomizer() {
  const button = qs("#randomizeColor");
  const preview = qs("#swatchPreview");
  const codeLabel = qs("#swatchCode");
  if (!button) return;

  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x) =>
      Math.round(255 * x)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  };

  button.addEventListener("click", () => {
    const hue = Math.floor(Math.random() * 360);
    const hex = hslToHex(hue, 75, 55);
    preview.style.background = hex;
    codeLabel.textContent = hex.toUpperCase();
  });
}

/* -------------------------------------------------------------------------
   9. WORKOUT CHECKLIST WIDGET (dynamic list rendering)
   -------------------------------------------------------------------------- */
function initTaskList() {
  const form = qs("#taskForm");
  const input = qs("#taskInput");
  const list = qs("#taskList");
  if (!form) return;

  let tasks = [];
  let nextId = 1;

  const render = () => {
    list.innerHTML = "";
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item${task.done ? " is-done" : ""}`;
      li.innerHTML = `
        <input type="checkbox" id="task-${task.id}" ${task.done ? "checked" : ""} />
        <label class="task-item__label" for="task-${task.id}">${task.text}</label>
        <button class="task-item__remove" type="button" aria-label="Remove exercise">✕</button>
      `;
      li.querySelector("input").addEventListener("change", () => {
        task.done = !task.done;
        render();
      });
      li.querySelector(".task-item__remove").addEventListener("click", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        render();
      });
      list.appendChild(li);
    });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ id: nextId++, text, done: false });
    input.value = "";
    render();
  });

  tasks = [
    { id: nextId++, text: "Back squat, 5x5", done: true },
    { id: nextId++, text: "Bench press, 3x8", done: false },
    { id: nextId++, text: "10 min row, easy pace", done: false },
  ];
  render();
}

/* -------------------------------------------------------------------------
   10. GENERIC CAROUSEL FACTORY
   A single reusable engine for any "track of slides + dots + arrows"
   carousel. Hero, gallery and testimonials all instantiate one of these
   instead of each having their own hand-rolled slider logic.

   Options:
   - track:      the element whose children are the slides (for translateX
                  carousels) — omit and pass `slides` + `activeClass` for
                  opacity-crossfade carousels like the hero.
   - slides:      array/NodeList of slide elements
   - dotsContainer: element to render dot buttons into
   - prevBtn/nextBtn: optional arrow buttons
   - mode: "translate" (slide horizontally) or "fade" (crossfade, hero style)
   - autoplay: ms interval, or 0 to disable
   -------------------------------------------------------------------------- */
function createCarousel({
  track,
  slides,
  dotsContainer,
  prevBtn,
  nextBtn,
  mode = "translate",
  autoplay = 0,
}) {
  const slideEls = slides || Array.from(track.children);
  const count = slideEls.length;
  if (!count) return null;

  let index = 0;
  let timer = null;

  const renderDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    slideEls.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  };
  renderDots();

  const update = () => {
    if (mode === "translate" && track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    } else {
      slideEls.forEach((slide, i) =>
        slide.classList.toggle("is-active", i === index),
      );
    }
    if (dotsContainer) {
      qsa("button", dotsContainer).forEach((dot, i) =>
        dot.classList.toggle("is-active", i === index),
      );
    }
  };

  const goTo = (newIndex) => {
    index = (newIndex + count) % count;
    update();
    resetAutoplay();
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const resetAutoplay = () => {
    if (!autoplay) return;
    clearInterval(timer);
    timer = setInterval(next, autoplay);
  };

  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  update();
  resetAutoplay();

  return { next, prev, goTo };
}

/* -------------------------------------------------------------------------
   11. HERO BACKGROUND IMAGE SLIDER
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slides = qsa(".hero-slide");
  if (!slides.length) return;
  createCarousel({
    slides,
    dotsContainer: qs("#heroDots"),
    prevBtn: qs("#heroPrev"),
    nextBtn: qs("#heroNext"),
    mode: "fade",
    autoplay: 6000,
  });
}

/* -------------------------------------------------------------------------
   12. GALLERY SLIDER + LIGHTBOX PREVIEW
   -------------------------------------------------------------------------- */
function initGallerySlider() {
  const track = qs("#galleryTrack");
  const slides = qsa(".media-slider__slide", track || document);
  if (!track || !slides.length) return;

  createCarousel({
    track,
    slides,
    dotsContainer: qs("#galleryDots"),
    prevBtn: qs("#galleryPrev"),
    nextBtn: qs("#galleryNext"),
    mode: "translate",
    autoplay: 5000,
  });

  // Clicking a slide opens the full-size lightbox preview
  const lightbox = qs("#lightbox");
  const image = qs("#lightboxImage");
  const caption = qs("#lightboxCaption");
  const closeBtn = qs("#lightboxClose");
  const prevBtn = qs("#lightboxPrev");
  const nextBtn = qs("#lightboxNext");
  if (!lightbox) return;

  let currentIndex = 0;
  let lastFocusedEl = null;

  const openLightbox = (i) => {
    currentIndex = i;
    const item = slides[currentIndex];
    image.src = item.dataset.full;
    image.alt = item.dataset.caption || "";
    caption.textContent = item.dataset.caption || "";
    lastFocusedEl = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  };
  const showRelative = (offset) => {
    currentIndex = (currentIndex + offset + slides.length) % slides.length;
    openLightbox(currentIndex);
  };

  slides.forEach((slide, i) =>
    slide.addEventListener("click", () => openLightbox(i)),
  );
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => showRelative(-1));
  nextBtn.addEventListener("click", () => showRelative(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showRelative(1);
    if (e.key === "ArrowLeft") showRelative(-1);
  });
}

/* -------------------------------------------------------------------------
   13. BEFORE/AFTER COMPARISON SLIDER
   Driven by a native <input type="range"> for accessibility (keyboard +
   screen reader support come for free), styled to look like a drag handle.
   The handle position and the "before" image clip-path both track the
   range's value.
   -------------------------------------------------------------------------- */
function initCompareSlider() {
  const range = qs("#compareRange");
  const handle = qs("#compareHandle");
  const beforeWrap = qs("#compareBeforeWrap");
  if (!range || !handle || !beforeWrap) return;

  const update = () => {
    const value = Number(range.value);
    handle.style.left = `${value}%`;
    beforeWrap.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  };

  range.addEventListener("input", update);
  update();
}

/* -------------------------------------------------------------------------
   14. TESTIMONIAL SLIDER
   -------------------------------------------------------------------------- */
function initTestimonialSlider() {
  const track = qs("#testimonialTrack");
  const slides = qsa(".testimonial-slide", track || document);
  if (!track || !slides.length) return;

  createCarousel({
    track,
    slides,
    dotsContainer: qs("#testimonialDots"),
    prevBtn: qs("#testimonialPrev"),
    nextBtn: qs("#testimonialNext"),
    mode: "translate",
    autoplay: 7000,
  });
}

/* -------------------------------------------------------------------------
   15. ANIMATED COUNTERS
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counters = qsa("[data-counter]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(eased * target)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((counter) => observer.observe(counter));
}

/* -------------------------------------------------------------------------
   16. SCROLL REVEAL ANIMATIONS
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = qsa(".reveal");
  if (!revealEls.length) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  revealEls.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   17. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initAccordion() {
  const triggers = qsa(".accordion__trigger");
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = document.getElementById(
        trigger.getAttribute("aria-controls"),
      );
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      triggers.forEach((otherTrigger) => {
        if (otherTrigger === trigger) return;
        otherTrigger.setAttribute("aria-expanded", "false");
        document.getElementById(
          otherTrigger.getAttribute("aria-controls"),
        ).hidden = true;
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
}

/* -------------------------------------------------------------------------
   18. TRIAL BOOKING FORM VALIDATION
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = qs("#contactForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      showToast({
        title: "Please check your details",
        message: "Fill in every field with a valid email address.",
        type: "error",
      });
      return;
    }

    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {
      const response = await fetch("http://localhost:3000/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showToast({
          title: "Success",
          message: "Your booking has been saved.",
          type: "success",
        });

        form.reset();
        loadBookings();
      } else {
        showToast({
          title: "Error",
          message: result.message,
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);

      showToast({
        title: "Server Error",
        message: "Could not connect to the backend.",
        type: "error",
      });
    }
  });
}

/* -------------------------------------------------------------------------
   19. BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const button = qs("#backToTop");
  if (!button) return;

  window.addEventListener(
    "scroll",
    () => button.classList.toggle("is-visible", window.scrollY > 480),
    { passive: true },
  );

  button.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

// ===================== LOAD BOOKINGS FROM DATABASE =====================
async function loadBookings() {
  try {
    const response = await fetch("http://localhost:3000/bookings");
    const bookings = await response.json();

    const tbody = document.querySelector("#bookingTable tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    bookings.forEach((booking) => {
      tbody.innerHTML += `
        <tr>
          <td>${booking.id}</td>
          <td>${booking.name}</td>
          <td>${booking.email}</td>
          <td>${booking.message}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading bookings:", error);
  }
}
/* -------------------------------------------------------------------------
   INIT — run everything once the DOM is ready
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  qs("#year").textContent = new Date().getFullYear();

  initLoader();
  initThemeToggle();
  initHeaderAndNav();
  initToastDemo();
  initClickCounter();
  initOneRepMaxCalculator();
  initColorRandomizer();
  initTaskList();
  initHeroSlider();
  initGallerySlider();
  initCompareSlider();
  initTestimonialSlider();
  initAnimatedCounters();
  initScrollReveal();
  initAccordion();
  initContactForm();
  initBackToTop();

  loadBookings();
});
