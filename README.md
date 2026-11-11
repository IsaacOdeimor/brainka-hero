# Brainka hero, rebuilt in code

A code recreation of the Brainka hero section and its "agents rebuild the page" animation, from the original design by Sameer.

Built with React, TypeScript and Vite. There's no animation library: the motion runs on a small custom engine.

Live: https://brainka-hero.pages.dev

## Run it

```bash
npm install
npm run dev
```

| Key | Action |
| --- | --- |
| `R` | Replay |
| `1` / `2` / `0` | Speed: 1× / 2× / 0.5× (slow-mo for recording) |

## Structure

```
src/
├─ App.tsx                  frame layers: under / page / logo tile / overlay / rulers
├─ components/
│  ├─ Page.tsx              the finished hero (nav + two-column hero)
│  ├─ Nav.tsx               logo, links, "Get Started", mobile menu
│  ├─ HeroCopy.tsx          eyebrow, headline, subtitle, buttons
│  ├─ Orbit.tsx             orbit lines (SVG)
│  ├─ AppTiles.tsx          the 7 app tiles
│  ├─ Logo.tsx, icons.tsx   SVG logo mark, arrow, play icon
│  └─ Text.tsx              text layer that keeps its copy in data-text for typing
├─ animation/
│  ├─ clock.ts              virtual clock: every wait/tween runs on it (speed + cancel)
│  ├─ agents.ts             cursor agents + spring-physics swarm flight
│  ├─ primitives.ts         drawBox, typeText, drag, redLine, swapIcon
│  ├─ rulers.ts             top/left rulers
│  ├─ timeline.ts           the full sequence: 10 agents in parallel tracks
│  └─ useRebuild.ts         runs it on mount, handles replay + keys
└─ styles/                  global, hero, overlay
```

## Responsive

Real CSS layout (grid + flex, `clamp()` type), no scaled artboard:

| Width | Layout |
| --- | --- |
| > 1100px | two columns, full nav |
| 960–1100px | tighter columns and buttons |
| < 960px | nav collapses into a menu |
| < 900px | hero stacks: copy on top, visual below |
| < 520px | buttons go full width |

The visual (orbit, head, tiles) has its own 690×798 coordinate space and scales as one unit with container query units.

## How the animation works

Each piece of the hero is a **layer** (`.L`). The page mounts finished, then every layer is hidden at once. Ten agents then bring the layers back in parallel, each as its own `async` track. They draw boxes with live `w × h` badges, type the copy, drag elements into place, measure spacing, and swap icons.

Nothing is hardcoded to one screen size: every target is measured from the live layout, so the same choreography runs on desktop, tablet and phone. If the window is resized mid-animation, the run stops and the finished hero is shown.

All timing goes through one virtual clock (`clock.ts`). That's why speed changes affect everything mid-animation, and why Replay cancels a run cleanly.

## Assets

`src/assets/head.png` and the app icons were taken from the design video. For a crisp production build, swap in the original image and SVG app logos.
