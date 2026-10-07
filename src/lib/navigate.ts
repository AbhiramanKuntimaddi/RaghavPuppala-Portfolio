"use client";

import type Lenis from "lenis";
import { MOTION_OK, ScrollTrigger } from "./gsap";

const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

// Where a link to a section should land. Sections that hold still while their content
// plays in (pinned) land at the end of that sequence, so you arrive at the finished
// section instead of its empty first frame. Everything else lands at its top edge.
function landing(id: string, target: HTMLElement) {
  if (id === "top") return 0;
  const pin = ScrollTrigger.getAll().find((t) => t.pin === target);
  if (pin) return pin.end;
  return target.getBoundingClientRect().top + window.scrollY;
}

// Scroll to a point with a fixed-length glide, so long jumps across the page don't drift
// through half-built sections. Motion-sensitive visitors jump straight there.
export function glideTo(y: number, lenis: Lenis | undefined) {
  if (lenis && window.matchMedia(MOTION_OK).matches) lenis.scrollTo(y, { duration: 1.4, easing: easeInOutQuint });
  else window.scrollTo({ top: y });
}

export function scrollToSection(id: string, lenis: Lenis | undefined) {
  const target = document.getElementById(id);
  if (target) glideTo(landing(id, target), lenis);
}
