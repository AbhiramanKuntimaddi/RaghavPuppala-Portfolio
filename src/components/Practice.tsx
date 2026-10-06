"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { Button } from "./Button";
import { RevealHeading } from "./Reveal";

// Desktop: the section holds still while the three services come in one after another
// (rule draws across, then title, copy and detail rise), and only lets go once the last
// one has fully landed. Phones: each service simply reveals as it scrolls into view.
export function Practice() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // "all" keeps the callback running when neither named condition matches.
      gsap.matchMedia().add({ wide: "(min-width: 1024px)", motion: MOTION_OK, all: "all" }, (ctx) => {
        const { wide, motion } = ctx.conditions as { wide: boolean; motion: boolean };
        if (!motion) return;
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]");

        if (!wide) {
          rows.forEach((row) => {
            const st = { trigger: row, start: "top 82%", once: true };
            gsap.from(row.querySelector("[data-rule]"), { scaleX: 0, duration: 1.4, scrollTrigger: st });
            gsap.from(row.querySelectorAll("[data-fade]"), {
              y: 24,
              autoAlpha: 0,
              stagger: 0.07,
              delay: 0.15,
              scrollTrigger: st,
            });
          });
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 1.5}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        rows.forEach((row, i) => {
          tl.from(row.querySelector("[data-rule]"), { scaleX: 0, duration: 0.8 }, i).from(
            row.querySelectorAll("[data-fade]"),
            { y: 40, autoAlpha: 0, duration: 0.7, stagger: 0.12 },
            i + 0.2,
          );
        });
        // A short hold so the last service sits fully on screen before the page moves on.
        tl.to({}, { duration: 0.6 });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="wealth"
      ref={root}
      aria-labelledby="wealth-title"
      className="py-24 sm:py-32 lg:flex lg:h-svh lg:min-h-[46rem] lg:items-center lg:py-0 lg:pt-16"
    >
      <div className="mx-auto grid w-full max-w-[90rem] gap-14 px-4 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <p className="mb-5 text-sm font-semibold tracking-wide text-ink-soft uppercase">Wealth practice</p>
          <RevealHeading id="wealth-title" className="font-display text-headline uppercase">
            One advisor for the whole plan
          </RevealHeading>
          <p className="mt-8 max-w-[44ch] text-lg text-ink-soft">
            Most families buy a policy here and a fund there, and never see how the pieces fit. I start with
            your goals, then build the investments, cover and retirement plan around them.
          </p>
          <Button href={site.contact.demat} external variant="ink-on-paper" className="mt-10">
            Open a free Demat account
          </Button>
        </div>

        <ul className="lg:col-span-6 lg:col-start-7">
          {site.practice.map((item) => (
            <li key={item.title} data-row className="relative pt-7 pb-10 sm:pb-12 lg:pt-6 lg:pb-8">
              <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-ink" />
              <h3 data-fade className="font-display text-[clamp(2.25rem,4vw,3.5rem)] uppercase">
                {item.title}
              </h3>
              <p data-fade className="mt-4 max-w-[48ch] text-lg">
                {item.body}
              </p>
              <p data-fade className="mt-3 text-sm font-medium text-ink-soft">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
