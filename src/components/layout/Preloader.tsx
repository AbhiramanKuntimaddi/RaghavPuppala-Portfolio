"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { JetIcon } from "@/components/ui/Jet";
import { gsap } from "@/lib/gsap";
import { PRELOADED_KEY } from "@/lib/preloader";

// Shown once per browser session, before the page: "runway lights". A marigold panel with
// a large counter and a row of runway threshold bars that light up in ink as the page
// actually loads (fonts, the hero portrait, the window's load event). At 100 the jet
// crosses just above the runway, then the panel lifts away and the hero's intro plays as
// it's revealed.
//
// It's in the server HTML, so it covers the page from the first paint. The page's own
// GSAP intros are held (the global timeline is paused) until the panel opens, so nothing
// plays unseen behind it. Its own motion uses the Web Animations API, outside GSAP.
// Skipped entirely with reduced motion and on later page loads in the same session (CSS
// hides it before paint; see the head script in layout.tsx). If scripts never run, CSS
// removes it after a few seconds.
const MIN_MS = 1200; // never just a flicker
const MAX_MS = 4000; // never stuck on a slow connection
const BARS = 14;

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useLayoutEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el || !html.classList.contains("motion") || html.classList.contains("returning")) {
      setGone(true);
      return;
    }

    // Runs before the sections' own effects (it's earlier in the tree), so their intros
    // start out held.
    gsap.globalTimeline.pause();
    html.style.overflow = "hidden";

    const bars = [...el.querySelectorAll<HTMLElement>("[data-bar]")];
    const count = el.querySelector<HTMLElement>("[data-count]")!;
    const start = performance.now();

    // What "loaded" means here: the web fonts, the hero portrait decoded, and the page.
    let settled = 0;
    const waits: Promise<unknown>[] = [
      document.fonts.ready,
      (() => {
        const img = document.querySelector<HTMLImageElement>("#top img");
        return img ? img.decode().catch(() => undefined) : Promise.resolve();
      })(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => window.addEventListener("load", resolve, { once: true })),
    ];
    waits.forEach((w) => void w.then(() => settled++));

    let shown = 0;
    let frame = 0;
    let done = false;
    const tick = (now: number) => {
      const elapsed = now - start;
      const loaded = settled / waits.length;
      // A slow trickle keeps it moving while waiting; it only reaches 100 once everything
      // has loaded and the minimum time has passed (or the maximum has).
      const ready = (loaded === 1 && elapsed >= MIN_MS) || elapsed >= MAX_MS;
      const target = ready ? 1 : Math.min(0.92, Math.max(loaded * 0.92, elapsed / MAX_MS));
      shown += (target - shown) * 0.08;
      if (ready && 1 - shown < 0.004) shown = 1;

      count.textContent = String(Math.round(shown * 100)).padStart(2, "0");
      // Each bar lights once progress passes its place on the runway.
      bars.forEach((bar, i) => bar.toggleAttribute("data-lit", shown >= (i + 1) / BARS));

      if (shown === 1 && !done) {
        done = true;
        void open();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const open = async () => {
      // The jet crosses the screen just above the runway…
      const jet = el.querySelector<HTMLElement>("[data-jet]")!;
      const runway = el.querySelector<HTMLElement>("[data-runway]")!.getBoundingClientRect();
      jet.style.top = `${runway.top - jet.offsetHeight * 0.85}px`;
      const across = window.innerWidth + jet.offsetWidth * 2;
      await jet.animate([{ transform: "translateX(0)" }, { transform: `translateX(${across}px)` }], {
        duration: 750,
        easing: "cubic-bezier(.5,0,.5,1)",
        fill: "forwards",
      }).finished;
      // …then the panel lifts away, and the page's intros start as it goes.
      html.style.overflow = "";
      gsap.globalTimeline.resume();
      await el.animate([{ transform: "none" }, { transform: "translateY(-102%)" }], {
        duration: 1000,
        easing: "cubic-bezier(.7,0,.3,1)",
        fill: "forwards",
      }).finished;
      try {
        sessionStorage.setItem(PRELOADED_KEY, "1");
      } catch {}
      setGone(true);
    };

    return () => {
      cancelAnimationFrame(frame);
      html.style.overflow = "";
      gsap.globalTimeline.resume();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      data-preloader
      aria-hidden
      className="fixed inset-0 z-100 grid place-items-center overflow-clip bg-marigold text-ink"
    >
      {/* The site's trimmed top-right corner, in ink: the page behind is marigold too, so a
          real cut wouldn't show. Same size as the sections' corners. */}
      <span
        aria-hidden
        className="absolute top-0 right-0 size-(--notch-size) bg-ink [clip-path:polygon(0_0,100%_0,100%_100%)]"
      />
      <div className="flex flex-col items-center">
        <p data-count className="font-display text-[clamp(5rem,12vw,9rem)] leading-none tabular">
          00
        </p>
        {/* The runway: threshold bars, lit in ink one by one as the page loads. */}
        <div data-runway className="relative mt-6 flex gap-1.5 sm:gap-2">
          {Array.from({ length: BARS }, (_, i) => (
            <span
              key={i}
              data-bar
              className="h-8 w-2 -skew-x-12 bg-ink opacity-15 transition-opacity duration-300 data-lit:opacity-100 sm:h-10 sm:w-2.5"
            />
          ))}
        </div>
        <p className="mt-5 text-xs font-semibold tracking-[0.2em] uppercase">Raghav Puppala</p>
      </div>
      {/* Waits off the left edge until loading is done, then flies level with the top of the runway. */}
      <span data-jet className="absolute right-full size-12 sm:size-14">
        <JetIcon className="size-full text-ink" />
      </span>
    </div>
  );
}
