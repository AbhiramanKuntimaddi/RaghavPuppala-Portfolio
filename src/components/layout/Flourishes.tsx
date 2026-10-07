"use client";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

// Small arrivals shared by every section, each played once as it first scrolls into view
// (alongside the sections' corner-cut entry, components/layout/Cuts):
//   .notch         a section's trimmed top-right corner folds in from the corner
//   data-lines     a ruled list: each [data-lined] row's rule ([data-line]) draws left to
//                  right, one after another
// Everything is rendered in full first, so without motion (or scripts) nothing is lost.
export function Flourishes() {
  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((group) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: group, start: "top 85%", once: true } });
        gsap.utils.toArray<HTMLElement>(group.querySelectorAll("[data-lined]")).forEach((row, i) => {
          const line = row.querySelector(":scope > [data-line]");
          if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "draw" }, i * 0.14);
        });
      });

      // The corner's size is a CSS variable (--notch-in) on the section, read by its ::before.
      gsap.utils.toArray<HTMLElement>(".notch").forEach((el) => {
        gsap.fromTo(
          el,
          { "--notch-in": 0 },
          {
            "--notch-in": 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });
    });
  });

  return null;
}
