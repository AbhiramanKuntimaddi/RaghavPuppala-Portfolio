"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

// The ink band along the bottom of the hero. It doubles as the jet's runway.
// Numbers tick up from zero, regulator names decode like an instrument readout.
// The server renders the final values, so nothing depends on the animation running.
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

        items.forEach((item, i) => {
          const value = item.querySelector<HTMLElement>("[data-value]")!;
          const count = Number(value.dataset.count);
          const at = 0.12 * i;

          if (count) {
            const suffix = value.dataset.suffix ?? "";
            const n = { v: 0 };
            value.textContent = `0${suffix}`;
            tl.to(n, { v: count, onUpdate: () => (value.textContent = `${Math.round(n.v)}${suffix}`) }, at);
          } else {
            const text = value.textContent ?? "";
            gsap.set(value, { opacity: 0 });
            tl.set(value, { opacity: 1 }, at).to(
              value,
              { scrambleText: { text, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", speed: 0.5 }, duration: 1.2, ease: "none" },
              at,
            );
          }
          tl.from(item.querySelector("[data-label]"), { y: 12, autoAlpha: 0, duration: 1 }, at + 0.15);
        });

        // Above the fold on desktop, so wait for the hero intro; below it on phones.
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 95%",
          once: true,
          onEnter: () => void tl.delay(0.9).play(),
        });
      });
    },
    { scope: root },
  );

  return (
    <div className="relative z-10 bg-ink text-paper">
      <ul
        ref={root}
        aria-label="Credentials"
        className="mx-auto grid max-w-[90rem] grid-cols-2 px-4 sm:px-8 lg:grid-cols-5"
      >
        {site.credentials.map((c, i, all) => (
          <li
            key={c.label}
            data-cred
            // Phones: two per row, rules between columns and rows, and an odd last item
            // spans the full width. From lg: one row, a rule before every item but the first.
            className={`border-paper/15 py-6 sm:py-7 lg:col-span-1 lg:border-t-0 lg:py-6 lg:pr-6 ${
              i % 2 ? "border-l pl-5 sm:pl-8" : ""
            } ${i > 1 ? "border-t" : ""} ${i === all.length - 1 && i % 2 === 0 ? "col-span-2" : ""} ${
              i > 0 ? "lg:border-l lg:pl-6 xl:pl-8" : ""
            }`}
          >
            <p
              data-value
              data-count={"count" in c ? c.count : undefined}
              data-suffix={"suffix" in c ? c.suffix : undefined}
              className="font-display text-[clamp(2.5rem,4.2vw,4.25rem)] text-marigold uppercase tabular"
            >
              {c.value}
            </p>
            <p data-label className="mt-2 text-sm text-paper/70 sm:text-base">
              {c.label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
