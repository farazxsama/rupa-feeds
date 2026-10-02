"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story, measureRanges } from "@/lib/storyStore";

/**
 * GSAP SCROLL ARCHITECTURE
 * ------------------------------------------------------------------
 * One ScrollTrigger spans the whole story container and scrubs
 * `story.progress` 0 → 1. `scrub: 1.1` adds ~1s of easing so wheel / trackpad
 * input turns into smooth camera motion (no jumps on fast flicks).
 *
 * Each beat's HTML panel gets its own scrubbed fade-in / hold / fade-out
 * timeline tied to its section, so text and 3D stay in lock-step whichever
 * direction the user scrolls.
 */
export function useStoryScroll(containerRef: RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    story.reducedMotion = reducedMotion;

    const measure = () => measureRanges(el);
    ScrollTrigger.addEventListener("refresh", measure);

    const ctx = gsap.context(() => {
      gsap.to(story, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: reducedMotion ? true : 1.1,
          invalidateOnRefresh: true,
        },
      });

      const travel = reducedMotion ? 0 : 36;
      el.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
        const section = panel.closest<HTMLElement>("[data-beat]");
        if (!section) return;
        const isHero = section.dataset.beat === "hero";
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: isHero ? "top top" : "top 65%",
            end: "bottom 35%",
            scrub: reducedMotion ? true : 0.6,
          },
        });
        if (isHero) {
          tl.to(panel, { duration: 0.45 });
        } else {
          tl.fromTo(panel, { autoAlpha: 0, y: travel }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" });
          tl.to(panel, { duration: 0.5 });
        }
        tl.to(panel, { autoAlpha: 0, y: -travel, duration: 0.2, ease: "power2.in" });
      });
    }, el);

    measure();
    ScrollTrigger.refresh();
    // Fonts / late layout shifts change section offsets → re-measure.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(onLoad).catch(() => {});

    return () => {
      window.removeEventListener("load", onLoad);
      ScrollTrigger.removeEventListener("refresh", measure);
      ctx.revert();
    };
  }, [containerRef, reducedMotion]);
}
