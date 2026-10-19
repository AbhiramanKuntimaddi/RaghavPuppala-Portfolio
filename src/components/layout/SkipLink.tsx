"use client";

import { useLenis } from "lenis/react";
import { scrollToSection } from "@/lib/navigate";

// Shown on the first Tab. Lands like the nav links, adds no #hash, and moves focus there.
export function SkipLink() {
  const lenis = useLenis();

  const skip = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection("wealth", lenis);
    const target = document.getElementById("wealth");
    if (!target) return;
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  };

  return (
    <a
      href="#wealth"
      onClick={skip}
      // Size and shape only when focused, or they'd override sr-only.
      className="sr-only z-60 bg-ink text-sm font-bold tracking-[0.07em] text-paper uppercase font-condensed focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-5 focus:py-3 focus:[clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)]"
    >
      Skip to content
    </a>
  );
}
