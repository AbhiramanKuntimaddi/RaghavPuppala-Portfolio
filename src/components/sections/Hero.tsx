"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, MOTION_REDUCED, SplitText, useGSAP } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Credentials } from "./Credentials";
import { JET_PATH } from "@/components/ui/Jet";
import { alignOptically } from "@/lib/optical";
import portrait from "../../../public/raghav-puppala.jpg";

const CRUISE = 0.42;

const routes = {
  // Pinned to the bottom of the SVG (YMax), so the runway sits just above the credentials band.
  wide: {
    viewBox: "0 0 1440 900",
    aspect: "xMidYMax slice",
    d: "M-60 880H420C640 880 790 850 850 700C895 590 870 420 900 320C930 210 1060 170 1200 160C1320 152 1400 140 1520 120",
  },
  // Phones: up the left of the photo, along its top and out past the clipped corner.
  narrow: {
    viewBox: "0 0 375 477",
    aspect: "xMidYMid meet",
    d: "M-8 480V48C-8 34 2 24 16 24H290C330 24 356 8 392-26C404-38 416-50 430-62",
  },
} as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      // One progress value drives both the jet and its trail. Only the visible route is measured.
      const flight = (wide: boolean) => {
        const svg = q(`[data-route="${wide ? "wide" : "narrow"}"]`)[0];
        const path = svg.querySelector("[data-flight]") as SVGPathElement;
        const jet = svg.querySelector("[data-jet]");
        const fly = gsap.to(jet, {
          motionPath: {
            path,
            align: path,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          ease: "none",
          paused: true,
        });
        const draw = gsap.fromTo(
          svg.querySelector("[data-trail]"),
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", ease: "none", paused: true },
        );
        return {
          svg,
          set: (p: number) => {
            fly.progress(p);
            draw.progress(p);
            gsap.set(jet, { autoAlpha: p > 0.005 && p < 0.995 ? 1 : 0 });
          },
        };
      };

      // "all" keeps the callback running on phones (GSAP needs one matching condition).
      mm.add({ wide: "(min-width: 1024px)", reduced: MOTION_REDUCED, all: "all" }, (ctx) => {
        const { wide, reduced } = ctx.conditions as {
          wide: boolean;
          reduced: boolean;
        };
        const route = flight(wide);
        if (reduced) {
          route.set(CRUISE);
          return;
        }

        const state = { takeoff: 0, climb: 0 };
        const render = () => route.set(state.takeoff + state.climb * (1 - CRUISE));
        render();
        gsap.to(state, {
          takeoff: CRUISE,
          duration: 2.6,
          ease: "power3.inOut",
          delay: 1.1,
          onUpdate: render,
        });

        // Desktop: the hero holds while the jet flies out. Phones: it completes while in view.
        gsap.to(state, {
          climb: 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: wide
            ? {
                trigger: root.current,
                start: "top top",
                end: "+=75%",
                pin: true,
                scrub: 0.6,
              }
            : {
                trigger: route.svg,
                start: "top 75%",
                end: "top 10%",
                scrub: 0.5,
              },
        });
      });

      // Intro timing (seconds): eyebrow 0.1, headline 0.25, portrait 0.3, lead 0.6, buttons 0.85,
      // jet 1.1, photo shadow 1.4. The credential plates rise at 0.7 (Credentials.tsx).
      mm.add(MOTION_OK, () => {
        SplitText.create(q("[data-headline]"), {
          type: "lines,words",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            alignOptically(self.masks);
            return gsap.from(self.words, {
              yPercent: 110,
              duration: 1.3,
              stagger: 0.07,
              delay: 0.25,
            });
          },
        });

        gsap
          .timeline({ delay: 0.1 })
          .set(q("[data-reveal]"), { visibility: "visible" }, 0)
          .from(q("[data-eyebrow]"), { y: 16, autoAlpha: 0, duration: 1 }, 0)
          .fromTo(
            q("[data-portrait]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.6,
              ease: "expo.inOut",
            },
            0.2,
          )
          .from(q("[data-portrait] img"), { scale: 1.3, duration: 2.2 }, 0.2)
          .from(q("[data-actions] > *"), { y: 24, autoAlpha: 0, stagger: 0.1, duration: 1 }, 0.75)
          .from(q("[data-shadow]"), { x: -20, y: 20, autoAlpha: 0, duration: 1.2 }, 1.3);

        gsap.fromTo(
          q("[data-parallax]"),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      // Lead: line by line from sm up. Not on phones, where splitting breaks the wrapping, and
      // never masked, which would clip the name's underline.
      mm.add(`(min-width: 640px) and ${MOTION_OK}`, () => {
        SplitText.create(q("[data-lead]"), {
          type: "lines",
          autoSplit: true,
          // Looked up per split: re-splitting rebuilds the sentence's elements.
          onSplit: (self) =>
            gsap
              .timeline({ delay: 0.6 })
              .from(self.lines, { y: 18, autoAlpha: 0, duration: 1.1, stagger: 0.09 }, 0)
              .fromTo(
                self.lines.flatMap((line) => [...line.querySelectorAll("[data-signature]")]),
                { drawSVG: "0%" },
                { drawSVG: "100%", duration: 1.1, ease: "draw" },
                0.7,
              ),
        });
      });
      // Without motion, still split the headline to align each line optically.
      mm.add(MOTION_REDUCED, () => {
        SplitText.create(q("[data-headline]"), {
          type: "lines",
          autoSplit: true,
          onSplit: (self) => void alignOptically(self.lines),
        });
      });
      mm.add(`(max-width: 639px) and ${MOTION_OK}`, () => {
        gsap
          .timeline({ delay: 0.6 })
          .from(q("[data-lead]"), { y: 18, autoAlpha: 0, duration: 1.1 }, 0)
          .fromTo(q("[data-signature]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "draw" }, 0.7);
      });
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      data-header-tone="ink"
      className="relative overflow-clip bg-marigold lg:flex lg:h-lvh lg:min-h-160 lg:flex-col"
    >
      <div className="relative pt-24 pb-12 sm:pt-28 lg:flex lg:flex-1 lg:flex-col lg:pt-28 lg:pb-12 short:pt-24 short:pb-8">
        <Route route="wide" className="absolute inset-0 hidden h-full w-full lg:block" />

        <div className="relative mx-auto grid w-full max-w-360 flex-1 gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-8">
            <p
              data-eyebrow
              data-reveal
              className="mb-6 text-sm font-semibold tracking-wide uppercase lg:mb-8 short:mb-5"
            >
              {site.role} · {site.city}
            </p>
            <h1
              data-headline
              data-reveal
              className="font-display text-[clamp(3.5rem,15vw,5.5rem)] uppercase sm:text-[clamp(4rem,10vw,7rem)] lg:text-[clamp(5rem,8.2vw,9rem)] short:text-[clamp(4rem,min(8.2vw,12svh),9rem)]"
            >
              {site.hero.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p
              data-lead
              data-reveal
              className="mt-8 max-w-[46ch] text-[1.1875rem] leading-[1.55] text-pretty text-ink/80 sm:text-[1.3125rem] lg:mt-10 short:mt-6"
            >
              {site.hero.lead.map((line, i) => (
                <span key={i} className={i === 0 ? "sm:block sm:whitespace-nowrap" : undefined}>
                  {line.map((part) =>
                    "as" in part && part.as === "name" ? (
                      <Signature key={part.text}>{part.text}</Signature>
                    ) : "as" in part && part.as === "strong" ? (
                      <strong key={part.text} className="font-semibold whitespace-nowrap text-ink">
                        {part.text}
                      </strong>
                    ) : (
                      part.text
                    ),
                  )}
                  {i === 0 && " "}
                </span>
              ))}
            </p>
            <div data-actions data-reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 short:mt-6">
              <Button href={site.contact.booking.href} external>
                {site.contact.booking.label}
              </Button>
              <WhatsAppButton message="Hi Raghav, I'd like to talk about my finances." variant="outline">
                Message on WhatsApp
              </WhatsAppButton>
            </div>
          </div>

          <figure className="relative mx-auto mt-6 w-full max-w-sm sm:max-w-md lg:col-span-4 lg:mt-0 lg:max-w-none short:max-w-[calc((100svh-17rem)*0.75)]">
            <Route
              route="narrow"
              className="absolute -inset-x-4 -top-12 h-[calc(100%+3rem)] w-[calc(100%+2rem)] overflow-visible lg:hidden"
            />
            <span
              data-shadow
              aria-hidden
              className="absolute inset-0 translate-x-3 -translate-y-3 bg-ink [clip-path:polygon(0_0,calc(100%-32px)_0,100%_32px,100%_100%,0_100%)] lg:translate-x-5 lg:-translate-y-5"
            />
            {/* The reveal animates its own clip on the inner layer, so it never overrides the notch. */}
            <div className="relative aspect-4/5 [clip-path:polygon(0_0,calc(100%-32px)_0,100%_32px,100%_100%,0_100%)] lg:aspect-3/4">
              <div data-portrait className="absolute inset-0 overflow-clip bg-marigold-deep">
                {/* Taller than the frame, so the parallax never shows an edge. */}
                <div data-parallax className="absolute inset-x-0 top-[-8%] h-[116%]">
                  <Image
                    src={portrait}
                    alt={site.portrait.alt}
                    fill
                    priority
                    placeholder="blur"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 28rem, 90vw"
                    className="origin-[61%_42%] scale-[1.3] object-cover object-[61%_42%]"
                  />
                </div>
              </div>
            </div>
          </figure>
        </div>
      </div>

      <Credentials />
    </section>
  );
}

function Signature({ children }: { children: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap text-ink">
      <span className="font-serif text-[1.3em] leading-none tracking-[-0.01em] italic">{children}</span>
      <svg
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-1.5 left-[-2%] h-3 w-[104%] overflow-visible"
        aria-hidden
      >
        <path
          data-signature
          d="M2 9C40 4 92 2 140 4C164 5 184 7 198 5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

function Route({ route, className }: { route: keyof typeof routes; className: string }) {
  const { viewBox, aspect, d } = routes[route];
  const mask = useId();
  return (
    <svg
      data-route={route}
      data-reveal
      viewBox={viewBox}
      preserveAspectRatio={aspect}
      className={`pointer-events-none ${className}`}
      aria-hidden
    >
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1400">
          <path data-trail d={d} fill="none" stroke="white" strokeWidth={8} />
        </mask>
      </defs>
      <path
        data-flight
        d={d}
        fill="none"
        className="stroke-ink/45"
        strokeWidth={1.5}
        strokeDasharray="6 9"
        strokeLinecap="round"
        mask={`url(#${mask})`}
      />
      <g data-jet opacity={0}>
        <path d={JET_PATH} transform="scale(1.6)" className="fill-ink" />
      </g>
    </svg>
  );
}
