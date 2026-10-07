"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { JetIcon } from "./Jet";
import { RevealHeading } from "./Reveal";

// The hero's jet (an Air Force emblem, not a claim he flew) crossing the three steps.
// From md up the section pins and the jet crosses while the page holds still,
// so each step gets its own stretch of scroll. On phones the jet tracks the
// scroll 1:1, sitting on a fixed line just below the middle of the screen.
export function FlightPlan() {
  const root = useRef<HTMLElement>(null);
  const route = useRef<HTMLDivElement>(null);
  const jet = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add({ wide: "(min-width: 768px)", motion: MOTION_OK, all: "all" }, (ctx) => {
        const { wide, motion } = ctx.conditions as { wide: boolean; motion: boolean };
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
        const axis = wide ? "x" : "y";
        const length = () => (wide ? route.current!.offsetWidth : route.current!.offsetHeight);
        const offset = (el: HTMLElement) => (wide ? el.offsetLeft : el.offsetTop);
        const light = () => {
          const reached = Number(gsap.getProperty(jet.current, axis));
          steps.forEach((step) => step.toggleAttribute("data-active", offset(step) <= reached + 1));
        };

        gsap.set(jet.current, { rotation: wide ? 0 : 90 });
        gsap.set(trail.current, { transformOrigin: wide ? "left center" : "center top" });
        const scale = wide ? "scaleX" : "scaleY";

        if (!motion) {
          gsap.set(jet.current, { [axis]: () => length() });
          gsap.set(trail.current, { [scale]: 1 });
          steps.forEach((step) => step.setAttribute("data-active", ""));
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: wide
            ? {
                trigger: root.current,
                pin: true,
                // The section is a full screen tall from md up, so it pins flush with the top.
                start: "top top",
                end: () => `+=${window.innerHeight * 1.6}`,
                scrub: 1,
                invalidateOnRefresh: true,
              }
            : {
                trigger: route.current,
                start: "top 58%",
                end: "bottom 58%",
                scrub: 0.4,
                invalidateOnRefresh: true,
              },
        });
        tl.fromTo(jet.current, { [axis]: 0 }, { [axis]: () => length(), duration: 1, onUpdate: light }, 0)
          .fromTo(trail.current, { [scale]: 0 }, { [scale]: 1, duration: 1 }, 0);
        // A short hold so the last step is fully lit before the section moves on.
        if (wide) tl.to({}, { duration: 0.2 });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="process"
      ref={root}
      data-header-tone="paper"
      aria-labelledby="plan-title"
      className="bg-ink py-24 text-paper sm:py-28 md:flex md:h-svh md:min-h-[42rem] md:items-center md:py-0 md:pt-16"
    >
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-sm font-semibold tracking-wide text-paper/60 uppercase">How it works</p>
            <RevealHeading id="plan-title" className="max-w-[14ch] font-display text-headline lg:max-w-[20ch] uppercase">
              How a plan comes together
            </RevealHeading>
          </div>
          <p className="max-w-[34ch] text-lg text-paper/70">
            Three steps, in order, with no surprises. You always know where we are and what comes next.
          </p>
        </div>

        <div ref={route} className="relative mt-16 md:mt-24">
          {/* The route: horizontal from md up, vertical below. */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-[11px] border-l border-dashed border-paper/35 md:inset-x-0 md:top-[11px] md:bottom-auto md:border-t md:border-l-0"
          />
          {/* Solid trail that fills in behind the jet. */}
          <span
            ref={trail}
            aria-hidden
            className="absolute top-0 bottom-0 left-[11px] w-px bg-marigold md:inset-x-0 md:top-[11px] md:bottom-auto md:h-px md:w-auto"
          />
          <div
            ref={jet}
            aria-hidden
            className="absolute top-0 left-0 z-10 -translate-y-1/2 text-marigold max-md:-translate-x-[8px] max-md:translate-y-0 md:top-[11px]"
          >
            <JetIcon className="size-10 -translate-x-1/2 max-md:translate-x-0" />
          </div>

          <ol className="grid gap-14 md:grid-cols-3 md:gap-10">
            {site.flightPlan.map((step) => (
              <li
                key={step.title}
                data-step
                className="group relative pl-12 opacity-40 transition-opacity duration-700 data-active:opacity-100 md:pt-14 md:pl-0"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 grid size-[23px] place-items-center rounded-full border border-paper/40 bg-ink transition-colors duration-500 group-data-active:border-marigold group-data-active:bg-marigold"
                >
                  <span className="size-1.5 rounded-full bg-paper/60 group-data-active:bg-ink" />
                </span>
                <h3 className="font-display text-[clamp(2.5rem,4.5vw,4rem)] uppercase">{step.title}</h3>
                <p className="mt-4 max-w-[36ch] text-lg text-paper/80">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
