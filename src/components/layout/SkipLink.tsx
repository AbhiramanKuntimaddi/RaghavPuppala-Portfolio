"use client";

import { useLenis } from "lenis/react";
import { scrollToSection } from "@/lib/navigate";

// For keyboard and screen-reader visitors: hidden until the first Tab on the page, then a
// notched ink plate in the top-left corner. It skips past the header straight to the first
// section, landing the way the nav links do (a pinned section at its finished state), with
// no #hash added to the address, and moves keyboard focus there so the next Tab carries on
// from the content.
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
      // Only the focused state sets size and shape: anything always-on would override the
      // hiding (sr-only shrinks it to 1px and clips it away).
      className="sr-only z-60 bg-ink text-sm font-bold tracking-[0.07em] text-paper uppercase font-condensed focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-5 focus:py-3 focus:[clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)]"
    >
      Skip to content
    </a>
  );
}
