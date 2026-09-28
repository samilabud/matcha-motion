# Matcha — Motion DS Starter

Matcha by BRIX Templates (Figma Community), rebuilt as a design system.

Figma variables → Style Dictionary → Tailwind v4 tokens → a component layer with no per-screen values, plus Motion set up for performance and accessibility from day one.

Stack: Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · Motion 13 (`motion/react`) · Radix primitives · cva · Style Dictionary 5 · Storybook 10 · Playwright + axe · Lighthouse CI.

> **Next.js 16 differs from older versions.** Before changing framework code, check the bundled docs in `node_modules/next/dist/docs/` (see `AGENTS.md`).

## Quick start

Requirements: Node 22+ (CI uses 22), npm. Docker only if you want to regenerate screenshot baselines.

```bash
npm install
npm run dev          # builds tokens, then serves http://localhost:3000
npm run storybook    # component workbench on http://localhost:6006
```

Playwright browsers are needed for story tests and e2e: `npx playwright install chromium`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Rebuilds tokens, starts the dev server |
| `npm run build` / `npm start` | Production build (rebuilds tokens first) / serve it |
| `npm run tokens` | Figma exports in `tokens/figma/` + `tokens/motion.json` → `src/styles/tokens.css` + `src/lib/motion/tokens.generated.ts` |
| `npm run tokens:check` | Rebuilds tokens and fails if the generated files differ from git (needs a commit) |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run check:hardcoded` | Fails if `src/app` contains arbitrary Tailwind values or raw colors |
| `npm run storybook` | Component workbench on :6006 |
| `npm run test:stories` | Story tests in a real browser: play functions + axe on every story |
| `npm run test:e2e` | Playwright against a production build on :3100 (axe per route, focus tests, screenshots) |
| `npm run test:visual:update` | Regenerates screenshot baselines **inside the Playwright Docker image**, so they match CI |
| `npm run analyze` | Turbopack bundle analyzer, written to disk for before/after diffs |
| `npm run lhci` | Lighthouse CI: mobile preset, 5 runs, median, with budgets |

## How the layers fit

```
tokens/figma/core.tokens.json      ← Figma "Core" collection (primitives), native Figma export
tokens/figma/semantic.tokens.json  ← Figma "Semantic" collection: bg/text/action/border/overlay → Core
tokens/motion.json                 ← durations, easings, stagger (Figma has no motion variables)
sd.config.mjs                      ← renames Figma names to a code scale, restores aliases, builds CSS + TS
src/styles/tokens.css              ← generated: --ds-* custom properties
src/app/globals.css                ← @theme maps Semantic colors, BR radii, font sizes; default palette removed
src/lib/fonts.ts                   ← Inter + DM Serif Display via next/font (shared with Storybook)
src/components/ui/                 ← primitives; variant names match Figma component properties
src/components/patterns/           ← compositions (CartDrawer, ShopDemo)
src/components/motion/             ← MotionProvider, StaggerList, ScrollProgress
src/app/                           ← screens: compose patterns only (enforced by check:hardcoded)
```

**Changing a token:** edit the variable in Figma → export the collection (right-click → Export) into `tokens/figma/` with the same file name → `npm run tokens`. CI's `tokens:check` fails if generated files are stale.

**Adding a color:** add it to the Figma Semantic collection pointing at a Core variable, re-export, then map it in `@theme` in `globals.css`. Anything not mapped does not exist as a utility.

**Decisions made on top of the source design (case-study material):**
- `action/on-primary` is dark green, not white: white on `#06B791` is 2.56:1 and fails WCAG AA; dark green is 4.68:1.
- `text/muted` uses Neutrals 700, not 600: Neutrals 600 on white is 3.73:1.
- Focus rings use `text/primary`: teal on white fails the 3:1 non-text contrast minimum.
- Social media and logo colors from Core are left out of the build.

## Motion decisions already made

- `LazyMotion` with async `domMax` + `strict`: use `import * as m from "motion/react-m"`; `<motion.div>` throws.
- `MotionConfig reducedMotion="user"`: transforms and layout animations turn off for reduced-motion users; opacity stays.
- The hero (LCP element) is static. Only content below it animates.
- Staggers are capped (`cap`, default 8) and triggered once in view.
- Durations and easings come from `motion.json` via `@/lib/motion/tokens`; springs (`spring.snappy`, `spring.gentle`) and `exit` (about 70% of the entrance) live in `tokens.ts`.
- Add-to-cart updates state before animating (protects INP) and announces through an `aria-live` region.
- `CartDrawer`: Radix owns focus trap, Esc and focus return; Motion owns enter/exit and drag-to-dismiss. The trigger **must** go through the `trigger` prop (rendered inside `Dialog.Trigger`), or focus falls to `<body>` on close. The Storybook `FocusManagement` story and the Playwright test both cover this.
- Story tests set `MotionGlobalConfig.skipAnimations = true` so axe and screenshots see end states, not mid-fade frames.
- Page transitions: React's `<ViewTransition>` works in the App Router without config (see `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). Prefer it over AnimatePresence route-exit hacks.

## CI

`.github/workflows/ci.yml` runs on every PR and on pushes to `main`:

| Job | Steps |
|---|---|
| `checks` | `tokens:check` → lint → typecheck → `check:hardcoded` → story tests |
| `playwright` | Full Playwright suite inside `mcr.microsoft.com/playwright:v1.63.0-noble` (same image as `test:visual:update`) |
| `lighthouse` | Production build + `lhci autorun` |

Lighthouse budgets (`lighthouserc.json`, median of 5 mobile runs): LCP ≤ 2.5s and CLS ≤ 0.05 are errors, TBT ≤ 200ms is a warning, and the accessibility score must be 100.

## First steps

1. `git add -A && git commit -m "Starter"`. The CI `tokens:check` step compares against git, so it needs a commit.
2. ~~Replace the placeholder tokens with your Figma export~~ Done: Matcha Core + Semantic are in `tokens/figma/`.
3. Add routes to `tests/routes.ts` as you build them, then run `npm run test:visual:update` once Docker is running.
4. Build a naive `baseline` branch in week 4 and measure both branches with `npm run lhci` and `npm run analyze`.
