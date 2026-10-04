# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Homepage prototype for Rupa Feeds (aquaculture feed): a scroll-driven 3D story in one continuous pond scene — surface → floating feed → dive → sinking feed → pond bottom → polyculture (fish + shrimp) → brand/CTA. Next.js 15 App Router, React 19, TypeScript (strict), Tailwind 3, three.js via React Three Fiber + drei, GSAP ScrollTrigger.

Only the homepage exists. `/about`, `/products`, `/contact` are linked from the nav but not built.

## Commands

```bash
npm run dev            # http://localhost:3000
npm run build          # production build (SSR-capable)
npm run start
npm run typecheck      # tsc --noEmit — the only automated check
npm run export         # static site in /out (sets STATIC_EXPORT=1, see next.config.mjs)
npm run preview:build  # esbuild single-bundle preview into preview-dist/
```

There is no test runner and no lint script; verify changes with `npm run typecheck` and by looking at the page.

`npm run export` uses POSIX inline env syntax (`STATIC_EXPORT=1 next build`), so on Windows run it from Git Bash, or in PowerShell: `$env:STATIC_EXPORT='1'; npx next build`.

URL flags for QA: `?mode=fallback` (no-WebGL illustrated version), `?mode=3d` (force 3D despite reduced motion), `?quality=low|medium|high`.

## Architecture

### Content and tuning live in config, not components

- `src/config/products.ts` — product names, copy, features, accent colours, packaging texture paths
- `src/config/site.ts` — nav, hero/CTA copy, "Why Rupa" points, footer
- `src/config/story.ts` — beat lengths (`BEATS`, in vh, desktop + mobile), camera keyframes (`CAMERA_KEYS`), world anchors (`WORLD`)
- `src/lib/quality.ts` — every per-device count/resolution used by the 3D scene (fish, pellets, particles, segments, DPR)
- `tailwind.config.ts` — provisional brand palette and fonts

Product copy deliberately makes no invented claims (features only describe where each feed sits in the water). Strings marked `[Client to confirm]` and the footer contact details are placeholders; don't write new product claims.

### Scroll → 3D bridge (no React state on the hot path)

Three plain mutable module-level objects carry all per-frame state. None of them trigger React renders, and that is intentional — don't move this into `useState`/context/a store with subscriptions.

- `story` (`src/lib/storyStore.ts`) — `progress` 0..1 written by GSAP; `ranges` per beat; `version` bumped when ranges are re-measured; `cameraY`, `underwater`, `inView`, `reducedMotion`.
- `feed` (`src/components/3d/feedState.ts`) — pellet pools (typed arrays: `pos`, `alive`, `edible`, `settled`), sinking cloud centre, surface ripple events. Pellet components write, fish/shrimp read targets and mark pellets eaten.
- `pondUniforms` (`src/components/3d/pondMaterial.ts`) — shared shader uniform objects; setting `.value` once per frame updates every patched material.

Flow:

1. `useStoryScroll` creates one ScrollTrigger over the story container that scrubs `story.progress`, plus a per-panel fade timeline for each `[data-panel]`.
2. `measureRanges` reads the `[data-beat]` sections' DOM offsets and converts them to global progress ranges (a beat starts when its section top hits mid-viewport). It bails out unless the number of `[data-beat]` sections equals `BEATS.length`, so adding or removing a beat means updating `BeatId`/`BEATS` in `config/story.ts`, the section in `StoryBeats.tsx`, and `StoryExperience.tsx` together.
3. `CameraController` converts beat-relative keyframes to global progress with `beatGlobal` (rebuilt when `story.version` changes), samples a Catmull-Rom spline, and applies frame-rate-independent damping.
4. Everything else in the scene reads `beatLocal(id)` inside `useFrame` to scrub or switch behaviour.
5. `UnderwaterEnvironment` is the single per-frame writer of `story.underwater`, `pondUniforms.uPondUnder`/`uPondTime`, and `feed.clock`.

Camera keyframes are authored per beat (`at` = 0..1 within the beat), so section heights can be retuned without re-authoring the path.

### Couplings that must be kept in sync by hand

- **Wave height** is implemented twice in `src/lib/pondMath.ts`: `waveHeight()` in TS and `WAVE_GLSL` generated from the same wave table. Floating pellets ride the CPU version while the surface renders the GPU one; change the table `W`, not one side.
- **Sinking pellet depth** (`DEPTH_CURVE` in `SinkingPellets.tsx`) is matched to the `sinking` camera look targets in `CAMERA_KEYS`. Retuning either without the other separates the camera from the feed cloud.
- **`WORLD` anchors** are used by terrain (`terrainHeight` flattens a pad under the feeding tray), the net, pellets, fish school centres and camera keys.
- **Layout is deterministic**: placement uses seeded `mulberry32`, not `Math.random`.

### Scene conventions

- One coordinate system, water surface at y = 0, floor around y = −13; the camera travels through it with no scene switches.
- Materials are `MeshStandardMaterial` patched via `patchPondMaterial` (`onBeforeCompile`), which injects optional vertex deformation, caustics and above-water depth tinting while keeping stock PBR lighting. Prefer patching over writing a new `ShaderMaterial`. The program cache key is derived from the lengths of the injected GLSL strings, so two different patches with identical lengths would collide.
- Fish and shrimp are procedural meshes built with `geometry/MeshBuilder.ts`. The swim shaders require head on +Z and the `aBody` (0 head → 1 tail) and `aPart` vertex attributes; any replacement GLB must provide them (see README for the swap procedure).
- Performance budget: one instanced draw call per fish school / pellet group / plant field, two lights, no shadow maps, no render targets (water reflection/refraction are analytic), fog for depth. Keep new scene content instanced and sized from `QualitySettings`.
- `PondScene` is loaded with `next/dynamic` (`ssr: false`) from `StoryExperience`; a CSS gradient poster shows until `ReadySignal` fires. The render loop stops (`frameloop="never"`) when the story container leaves the viewport.
- Product bags below the story use a separate shared canvas (`ProductShowcaseCanvas`, drei `<View>`).

### 3D vs fallback

`useExperienceMode` picks `"3d"` or `"fallback"`: no WebGL, `prefers-reduced-motion`, `?mode=fallback`, or a WebGL context loss all lead to the illustrated cross-section (`StoryFallback` / `PondDiagram`). All story content is semantic HTML in `StoryBeats.tsx` layered over the pinned canvas, never 3D text, so it must stay meaningful in both modes.

### Preview bundle

`preview/build.mjs` bundles `src/app/page.tsx` with esbuild as a client-only render, aliasing `next/dynamic` to `preview/dynamic-shim.tsx` (React.lazy) and compiling CSS separately with the Tailwind CLI. Components reachable from the homepage therefore need to work without Next-only runtime APIs, or get a shim added there.

## Placeholder assets

`public/brand/` and `public/packaging/` are empty. Until real files are added and referenced (`site.logoSrc`, `packagingTexture` in `config/products.ts`), a typographic wordmark and a canvas-generated bag texture labelled "PLACEHOLDER" (`src/lib/placeholderPackaging.ts`) are rendered.
