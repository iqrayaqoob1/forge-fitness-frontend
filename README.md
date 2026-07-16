# Forge Fitness — Strength Training Gym Website

> DecodeLabs Frontend Development Project 3

A portfolio-quality gym website — complete with an interactive training floor, live gallery, FAQ, and trial-class booking form — built entirely with **semantic HTML5, modern CSS3 and vanilla JavaScript**. No frameworks, no UI libraries, no build step.

**[Live Demo](#deployment-github-pages)** · **[Features](#features)** · **[Tech Stack](#technologies-used)**

---

## Portfolio Project Description

Forge Fitness is a fictional strength-training gym's marketing site, built to demonstrate real-world frontend skills through content that actually makes sense for the interactions used. Instead of generic placeholder widgets, every interactive feature is grounded in something a real gym member would use: a rep counter for tracking sets, a one-rep-max calculator using the Epley strength formula, a class schedule toast, and a trial-class booking form with live validation.

The project is built to demonstrate:
- Strong fundamentals in HTML, CSS and JavaScript, without relying on frameworks.
- Interface design with intent — an ember/steel "forge" palette and condensed athletic typography chosen to fit a strength gym, not a generic tech dashboard look.
- Accessibility-first thinking: keyboard support, ARIA attributes, visible focus states, and `prefers-reduced-motion` support.
- Clean, well-commented code organized the way a production codebase would be, even without a framework.

---

## Features

**Core interaction patterns**
- 🖱️ Interactive buttons with hover, active and focus states
- 🔀 Toggle functionality (day/night session mode, mobile menu, accordion, checklist items)
- 🧩 DOM manipulation (dynamic workout checklist, live 1RM calculation, gear color swatches)
- 🔄 Dynamic content updates driven by real application state
- 🎧 Event listeners throughout (click, input, submit, keydown, scroll)
- 📱 Fully responsive, mobile-first layout
- ✨ Smooth CSS transitions and scroll-triggered animations

**Professional / stand-out features**
- 🎞️ **Hero background image slider** — auto-rotating full-bleed photos with dot + arrow controls, crossfade transition
- 🖼️ **Gallery slider** — swipeable horizontal photo carousel with dots, arrows, autoplay, and a full-size lightbox on click
- ↔️ **Before/after comparison slider** — drag (or use arrow keys) to reveal the gym floor before and after renovation
- 💬 **Testimonials slider** — auto-rotating member quotes with dot navigation
- 🌗 **Day / Night session mode toggle** — persisted via `localStorage`, respects system preference on first visit
- ❓ **FAQ accordion** — single-open behavior, full ARIA state management
- 🔢 **Animated stat counters** — members trained, coaches, retention rate count up once scrolled into view
- 🎬 **Scroll reveal animations** — sections fade/slide in as the user scrolls
- ⬆️ **Back to top button** — appears after scrolling, smooth-scrolls to the hero
- 🧭 **Active navigation highlight** — nav link updates to match the section in view
- ⏳ **Loading animation** — animated boot screen on initial page load
- 🔔 **Toast notification system** — reusable, auto-dismissing, dismissible by hand
- 📱 **Responsive navigation menu** — animated hamburger menu on small screens

**Bonus gym-specific tools (beyond the assignment minimum)**
- 💪 **Rep counter** — a simple, real-time set tracker
- 🧮 **One-rep max estimator** — calculates estimated 1RM from weight + reps using the Epley formula
- 🎨 **Gear color randomizer** — generates a random hex color live via CSS custom properties
- ✅ **Workout checklist** — add, complete, and remove exercises dynamically

---

## Technologies Used

| Category | Details |
|---|---|
| Markup | Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, dialog-style overlay) |
| Styling | CSS3 — Custom Properties (design tokens), Flexbox, CSS Grid, `clamp()`, `color-mix()`, keyframe animations |
| Scripting | Vanilla JavaScript (ES6+) — no frameworks or libraries |
| Browser APIs | `IntersectionObserver`, `localStorage`, `matchMedia`, `requestAnimationFrame` |
| Fonts | [Oswald](https://fonts.google.com/specimen/Oswald) (condensed display), [Inter](https://fonts.google.com/specimen/Inter) (body), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (stats/labels) via Google Fonts |
| Tooling | None required — plain files, no build step, no `node_modules` |

---

## Folder Structure

```
Project/
│
├── index.html          # Single-page markup — all sections live here
├── css/
│   └── style.css        # Design tokens + all component & layout styles
├── js/
│   └── script.js         # All interactivity, organized into small init*() functions
├── images/               # Reserved for local image assets (gallery currently uses hosted images)
└── README.md            # This file
```

**Why this structure?**
- `css/` and `js/` are separated from markup so each file has a single responsibility and can be cached independently by the browser.
- `script.js` is broken into small, named `init...()` functions — one per feature — each responsible for exactly one part of the UI. This mirrors how you'd split logic into modules in a larger app, without needing a bundler.
- `style.css` opens with a table of contents comment and uses numbered section headers, so any reviewer can jump straight to the relevant block.

---

## How the Code Works (Guided Walkthrough)

### CSS architecture
All theme-able values (`colors`, `spacing`, `radius`, `motion`) are defined once as CSS Custom Properties on `:root`, using a warm charcoal + ember-orange "forge" palette chosen to feel like a strength gym rather than a generic tech product. The `[data-theme="light"]` selector overrides that same variable set for "day session" mode — so JavaScript never has to touch individual elements to re-theme the page, it just toggles one `data-theme` attribute on `<html>`.

### JavaScript architecture
`script.js` follows one pattern throughout: each feature is a small `initX()` function that finds its own DOM elements, attaches its own event listeners, and does nothing if those elements aren't present (so functions are safe to call unconditionally). All functions are called once, at the bottom of the file, inside a single `DOMContentLoaded` listener — this keeps startup order explicit and easy to follow.

Key patterns demonstrated:
- **State + render**: widgets like the rep counter and workout checklist keep a small piece of JS state (a number, an array) and re-render the relevant DOM whenever that state changes — the same mental model used by component frameworks, done by hand.
- **Real formulas, not fake data**: the one-rep max estimator uses the actual Epley formula (`1RM = weight × (1 + reps / 30)`), so the "dynamic content update" requirement is backed by genuine math a lifter could use.
- **Intersection Observer** powers both the scroll-reveal animations and the animated stat counters, replacing manual scroll-position math with the modern, performant browser API built for exactly this.
- **Reusable utilities**: `showToast()` is a single function that every other feature (session toggle, trial form, schedule button) calls to surface feedback, instead of duplicating notification markup everywhere.
- **One carousel engine, three sliders**: rather than writing separate slider logic three times, `createCarousel()` is a single factory function that both the hero (crossfade mode) and the gallery/testimonials (slide mode) call with different options — track element, dots container, arrow buttons, and an optional autoplay interval. This is the same "build one configurable engine" pattern you'd reach for in any real codebase to avoid duplicated logic.
- **Native `<input type="range">` for the before/after slider**: instead of hand-rolling pointer/touch drag logic, the comparison slider is driven by a real range input, so dragging, clicking, and arrow-key nudging all work automatically and are screen-reader accessible for free. JavaScript just listens for its `input` event and translates the value into a `clip-path` on the "before" image layer.

---

## SEO

- **Page title**: `Forge Fitness — Strength Training Gym | Book a Free Trial Class`
- **Meta description**: `Forge Fitness is a strength-training gym built around real coaching and honest results. Explore classes, check your one-rep max, browse the training floor, and book a free trial class today.`
- Open Graph tags included for clean previews when shared on LinkedIn/social platforms.
- Semantic heading hierarchy (`h1` → `h2` → `h3`) throughout for screen readers and search crawlers.

---

## Deployment (GitHub Pages)

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Forge Fitness"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, open your repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Set **Branch** to `main` and folder to `/ (root)`, then click **Save**.
5. Wait a minute for GitHub to build the site, then visit:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```
6. (Optional) Add that live URL to your repository's **About** section and to this README.

No build step, environment variables, or dependencies are required — the site is static and deploys as-is.

---

## GitHub Repository Description (suggested)

> Forge Fitness — a portfolio-quality gym website with 10+ interactive UI components (session-mode toggle, image lightbox, animated stat counters, a real one-rep-max calculator, toasts & more) built with pure HTML5, CSS3 and vanilla JavaScript. No frameworks, fully responsive, fully accessible.

**Suggested topics/tags:** `html5` `css3` `javascript` `vanilla-js` `frontend` `responsive-design` `gym-website` `dom-manipulation` `no-framework` `decodelabs`

---

## Browser Support

Built on widely-supported modern browser features (CSS Custom Properties, Grid, `IntersectionObserver`). Verified in current versions of Chrome, Firefox, Safari and Edge.

## License

Free to use, fork and adapt for learning or portfolio purposes.
