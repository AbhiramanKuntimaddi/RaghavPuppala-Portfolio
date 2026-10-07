"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Lenis drives the scroll, GSAP's ticker drives Lenis, and ScrollTrigger
// listens to Lenis. One clock, so pinned sections never drift.
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

  // ReactLenis creates its instance after this component mounts, so read the
  // ref on every tick instead of once.
  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  // Web fonts change heading heights (and SplitText re-splits) after first layout;
  // re-measure every trigger once they land so pins and the header's scrollspy line up.
  // And once more after the page has loaded and the browser has settled, which on iOS
  // includes the toolbar taking its final height. On touch devices the resize that would
  // otherwise correct this is ignored (lib/gsap.ts), so it has to be asked for.
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
