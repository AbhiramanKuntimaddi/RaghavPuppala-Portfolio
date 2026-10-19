"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// GSAP's ticker drives Lenis, which drives ScrollTrigger: one clock, so pins never drift.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // The Lenis instance appears after mount, so read the ref each tick.
  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  // Re-measure after fonts load and once the page settles (iOS toolbar). Touch resizes are
  // ignored (lib/gsap.ts), so it has to be asked for.
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const remeasure = () => !cancelled && ScrollTrigger.refresh();
    document.fonts?.ready.then(remeasure);
    const settled = () => (timer = window.setTimeout(remeasure, 400));
    if (document.readyState === "complete") settled();
    else window.addEventListener("load", settled, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", settled);
    };
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.11 }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}

function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  return null;
}
