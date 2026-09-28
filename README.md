# Motion DS Starter

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
| `npm run tokens` | `tokens/*.json` → `src/styles/tokens*.css` + `src/lib/motion/tokens.generated.ts` |
| `npm run tokens:check` | Rebuilds tokens and fails if the generated files differ from git (needs a commit) |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run check:hardcoded` | Fails if `src/app` contains arbitrary Tailwind values or raw colors |
| `npm run storybook` | Component workbench on :6006 (theme toggle in the toolbar) |
| `npm run test:stories` | Story tests in a real browser: play functions + axe on every story |
| `npm run test:e2e` | Playwright against a production build on :3100 (axe per route, focus tests, screenshots) |
| `npm run test:visual:update` | Regenerates screenshot baselines **inside the Playwright Docker image**, so they match CI |
| `npm run analyze` | Turbopack bundle analyzer, written to disk for before/after diffs |
| `npm run lhci` | Lighthouse CI: mobile preset, 5 runs, median, with budgets |

## How the layers fit

```
tokens/                     ← DTCG JSON exported from Figma variables (the only place values live)
  primitive.json              raw palette, radii (screens never use these directly)
  semantic.light.json         meaning: bg/text/brand/border/status, aliases primitives
  semantic.dark.json          dark mode: same names, different aliases
  motion.json                 durations, easings, stagger
sd.config.mjs               ← Style Dictionary build (CSS vars with ds- prefix + TS motion tokens)
src/styles/tokens*.css      ← generated, do not edit
src/app/globals.css         ← @theme maps semantic vars to utilities; Tailwind's default palette is removed
src/lib/motion/tokens.ts    ← motion tokens for Motion (+ springs, which DTCG can't express yet)
src/components/ui/          ← primitives; variant names match Figma component properties
src/components/patterns/    ← compositions (CartDrawer, ShopDemo)
src/components/motion/      ← MotionProvider, StaggerList, ScrollProgress
src/app/                    ← screens: compose patterns only (enforced by check:hardcoded)
tests/                      ← Playwright: a11y.spec.ts, visual.spec.ts, routes.ts (routes under test)
.storybook/                 ← preview wraps stories in MotionProvider; a11y violations fail tests
```

**Changing a token:** edit the Figma variable → re-export into `tokens/` → `npm run tokens`. Every component updates. CI's `tokens:check` fails if generated files are stale, so commit the generated output too.

**Adding a color:** add it to both `semantic.light.json` and `semantic.dark.json`, then map it in `@theme` in `globals.css`. Anything not mapped does not exist as a utility: `bg-blue-500` won't compile, `bg-accent` will.

**Adding a component:** put primitives in `src/components/ui/` with `cva` variants named after the Figma component properties (see `button.tsx`), and write a `*.stories.tsx` next to it. Story tests run axe on every story automatically. Screens in `src/app/` should only compose components. If a screen needs a one-off value, add a token or a variant instead.

**Dark mode:** a script in `layout.tsx` sets `data-theme="dark"` before paint when the OS prefers dark. Only the semantic layer changes under `[data-theme="dark"]`; primitives stay the same.

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
2. Replace `tokens/*.json` with the export from your Figma file and run `npm run tokens`.
3. Add routes to `tests/routes.ts` as you build them, then run `npm run test:visual:update` once Docker is running.
4. Build a naive `baseline` branch in week 4 and measure both branches with `npm run lhci` and `npm run analyze`.
