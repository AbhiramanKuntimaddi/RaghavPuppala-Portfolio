"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

// A row of ink plates along the bottom of the hero, each with the site's trimmed corner:
// cream figures, marigold labels.
// Their top edge doubles as the jet's runway.
// The plates rise one after another; as each lands its number ticks up from zero, or its
// regulator name decodes like an instrument readout. The server renders the final values,
// so nothing depends on the animation running.
export function Credentials() {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-cred]");
        const tl = gsap.timeline({
          paused: true,
          defaults: { duration: 1.6, ease: "expo.out" },
        });

        tl.set(root.current, { visibility: "visible" }, 0);
        items.forEach((item, i) => {
          const value = item.querySelector<HTMLElement>("[data-value]")!;
          const count = Number(value.dataset.count);
          const landed = 0.08 * i;
          tl.from(item, { y: 40, autoAlpha: 0, duration: 1.1 }, landed);
          const at = landed + 0.2;

          if (count) {
            const suffix = value.dataset.suffix ?? "";
            const n = { v: 0 };
            value.textContent = `0${suffix}`;
            tl.to(
              n,
              {
                v: count,
                onUpdate: () => (value.textContent = `${Math.round(n.v)}${suffix}`),
              },
              at,
            );
          } else {
            const text = value.textContent ?? "";
            gsap.set(value, { opacity: 0 });
            tl.set(value, { opacity: 1 }, at).to(
              value,
              {
                scrambleText: {
                  text,
                  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                  speed: 0.5,
                },
                duration: 1.2,
                ease: "none",
              },
              at,
            );
          }
          tl.from(item.querySelector("[data-label]"), { y: 12, autoAlpha: 0, duration: 1 }, at + 0.15);
        });

        // In view on load (desktop): part of the hero intro, 0.7s in. Otherwise (phones,
        // below the fold): when they're scrolled to.
        if (ScrollTrigger.isInViewport(root.current!, 0.1)) tl.delay(0.7).play();
        else
          ScrollTrigger.create({
            trigger: root.current,
            start: "top 90%",
            once: true,
            onEnter: () => void tl.play(),
          });
      });
    },
    { scope: root },
  );

  return (
    <div className="relative z-10 pb-4 sm:pb-6">
      <ul
        ref={root}
        data-reveal
        aria-label="Credentials"
        className="mx-auto grid max-w-360 grid-cols-2 gap-2 px-4 sm:gap-3 sm:px-8 lg:grid-cols-5"
      >
        {site.credentials.map((c, i, all) => (
          <li
            key={c.label}
            data-cred
            // Phones: two per row, and an odd last plate spans the full width.
            className={`bg-ink px-5 py-5 text-paper [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)] sm:px-6 sm:py-6 short:py-4 lg:[clip-path:polygon(0_0,calc(100%-20px)_0,100%_20px,100%_100%,0_100%)] ${
              i === all.length - 1 && i % 2 === 0 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <p
              data-optical
              data-optical-text={c.value}
              data-value
              data-count={"count" in c ? c.count : undefined}
              data-suffix={"suffix" in c ? c.suffix : undefined}
              className="font-display text-[clamp(2.25rem,3.8vw,4rem)] text-paper uppercase tabular short:text-[clamp(2rem,3vw,3rem)]"
            >
              {c.value}
            </p>
            <p data-label className="mt-2 text-sm font-medium text-marigold sm:text-base lg:text-sm 2xl:text-base">
              {c.label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
