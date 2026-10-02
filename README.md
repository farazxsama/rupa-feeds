# Rupa Feeds — Homepage prototype

A scroll-driven 3D storytelling homepage: **pond surface → floating feed → dive → sinking feed → pond bottom → polyculture (fish + shrimp) → brand / CTA**, in one continuous scene.

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 3 · three.js · React Three Fiber · drei · GSAP ScrollTrigger.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm run export         # fully static site in /out
npm run preview:build  # single-bundle preview (preview-dist/) used for the shareable link
```

Useful URL flags: `?mode=fallback` (no-WebGL version), `?mode=3d` (force 3D even with reduced motion), `?quality=low|medium|high`.

## Where to edit things

| What | File |
| --- | --- |
| Product names, copy, features, packaging image paths | `src/config/products.ts` |
| Nav, hero copy, CTA text, "Why Rupa" points, footer | `src/config/site.ts` |
| Section lengths (scroll pacing) + camera keyframes + world layout | `src/config/story.ts` |
| Colours / fonts (provisional brand tokens) | `tailwind.config.ts` |
| Device quality budgets (fish, particles, plants…) | `src/lib/quality.ts` |

No product claims were invented — the feature bullets describe only where each feed sits in the water. Replace with client-approved copy.

## Replacing placeholder assets

- **Packaging:** put the bag front artwork (≈1024×1408) in `public/packaging/` and set `packagingTexture` for the product in `config/products.ts`. `ProductBag.tsx` accepts `texture`, `position`, `rotation`, `scale` (plus optional `backTexture`). Until then a clearly-marked "PLACEHOLDER" texture is generated.
- **Logo:** put it at `public/brand/logo.svg` and set `site.logoSrc`.
- **Fish / shrimp models:** currently procedural meshes (no download, ~1–1.4k tris). To use Draco GLBs, load with `useGLTF(url, true)` and return the geometry from `useFishGeometry()` (`Fish.tsx`) / swap `createShrimpGeometry()` (`Shrimp.tsx`). Keep head on +Z and add an `aBody` attribute (0 head → 1 tail) so the GPU swim shader keeps working. Run `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp` on new assets.

## Architecture

```
src/
  app/                 layout + page (page.tsx only composes sections)
  config/              products.ts · site.ts · story.ts  ← all content + timing
  lib/                 storyStore (scroll → 3D bridge), quality tiers, pond math (waves/terrain), placeholder packaging
  hooks/               useStoryScroll (GSAP ScrollTrigger), useExperienceMode (3D vs fallback)
  components/
    3d/                PondScene, CameraController, WaterSurface, UnderwaterEnvironment, Lighting,
                       FishSchool/Fish, Shrimp, FloatingPellets, SinkingPellets, PolyculturePellets,
                       SurfaceRipples, FeedingNet, AquaticPlants, PondFloor, PondBanks, ProductBag,
                       ProductShowcaseCanvas, pondMaterial (shared caustics/water-tint shader patch)
    sections/          StoryExperience (+ StoryBeats: Hero, Floating, Dive, Sinking, Polyculture, Brand),
                       ProductOverview, WhyRupa, FinalCTA, Footer
    ui/                Navbar, ProductInfo, ProductCard, BrandLogo, PondDiagram, StoryOverlays
```

**Scroll → story:** one ScrollTrigger scrubs `story.progress` (0–1) on a plain mutable object, so scroll never triggers React renders. Section DOM positions are measured into beat ranges; camera keyframes are authored per beat and sampled on a Catmull-Rom spline with frame-rate-independent damping (no jumps). Pellet descent is scrubbed from the same beat progress the camera follows, so the camera and the sinking feed always move together. Fish/shrimp behaviour is time-based steering that switches targets by beat.

**Performance:** the 3D bundle is code-split and loaded after first paint; one draw call per fish school / pellet group / plant field (instancing); two lights, no shadow maps; no render targets (water reflection/refraction are analytic in one shader); fog-based depth; quality tiers by device (`lib/quality.ts`) plus drei `PerformanceMonitor` lowering DPR on slow frames; the render loop stops once the story scrolls out of view; product bags share one canvas via drei `<View>` and mount only near the viewport.

**Accessibility:** all story content is semantic HTML (headings, lists, links), not 3D text. No WebGL or `prefers-reduced-motion: reduce` → an illustrated cross-section tells the same three-zone story (reduced-motion users can opt into 3D). Skip link, keyboard-accessible nav/menu, visible focus rings, WebGL context-loss falls back automatically.

## Known prototype limits

- Fish, shrimp, packaging and logo are placeholders (see above).
- Other pages (About, Products, product detail, Contact) are linked but not built yet.
- Tested in headless Chromium (software WebGL) at 1440×900 and 390×844; please check on real target phones before launch.
