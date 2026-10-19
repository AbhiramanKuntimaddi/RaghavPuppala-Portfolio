"use client";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

// Once-only arrivals: .notch corners fold in, and data-lines rules ([data-line]) draw in turn.
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
