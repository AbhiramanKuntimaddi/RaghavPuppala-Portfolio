"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { site, type Venture } from "@/content/site";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Button } from "./Button";
import { RevealHeading } from "./Reveal";

const themes = {
  ads: { panel: "bg-ads text-ink", soft: "text-ink/70", rule: "border-ink/25" },
  interiors: {
    panel: "bg-interiors text-paper",
    soft: "text-interiors-soft",
    rule: "border-paper/25",
  },
  foundation: {
    panel: "bg-foundation text-paper",
    soft: "text-foundation-soft",
    rule: "border-paper/25",
  },
} as const;

// Easing for the glide onto the next panel.
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export function Ventures() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: pin the section and walk sideways from the intro through the three panels.
      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const slide = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            pin: true,
            scrub: 0.6,
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
          },
        });
        animateArt((panel) => ({
          trigger: panel,
          containerAnimation: slide,
          start: "left 8%",
          toggleActions: "play none none reverse",
        }));

        const st = slide.scrollTrigger!;
        const steps = el.children.length - 1;
        const yFor = (index: number) => st.start + (index / steps) * (st.end - st.start);
        // Inside the sideways run, counting its first and last panel positions as inside
        // (ScrollTrigger's isActive is false exactly on the boundaries we snap to).
        const inside = () => window.scrollY >= st.start - 2 && window.scrollY <= st.end + 2;
        const glideTo = (index: number, onDone?: () => void) => {
          const lenis = lenisRef.current;
          if (lenis) lenis.scrollTo(yFor(index), { duration: 0.9, easing: easeInOutCubic, onComplete: onDone });
          else {
            window.scrollTo({ top: yFor(index), behavior: "smooth" });
            setTimeout(() => onDone?.(), 900);
          }
        };

        // One wheel gesture = one panel. Inside the section, the first wheel event of a
        // gesture moves straight to the next (or previous) panel; the rest of that gesture
        // (a fast flick of the wheel, or trackpad momentum) is swallowed so it can't skip
        // ahead. Events closer than 250ms apart count as one gesture. Caught in the capture
        // phase so Lenis never sees them. At either end the wheel passes through, so you can
        // scroll out of the section as normal.
        let gliding = false;
        let used = false; // the current gesture already moved a panel
        let fromOutside = false; // the current gesture began before the section was reached
        let lastWheel = 0;
        const onWheel = (e: WheelEvent) => {
          const now = performance.now();
          if (now - lastWheel > 250) {
            used = false;
            fromOutside = !inside();
          }
          lastWheel = now;
          const swallow = () => {
            e.preventDefault();
            e.stopPropagation();
          };
          if (gliding || used) return swallow();
          if (!inside() || Math.abs(e.deltaY) < 2) return;
          // A gesture that carried you into the section brings you in, but can't also
          // advance a panel; the settle below parks you on the nearest one (the intro).
          // Park straight away on the panel it reached, so Lenis's leftover momentum can't
          // carry on and bounce against the settle (most noticeable scrolling up from below).
          if (fromOutside) {
            swallow();
            used = true;
            gliding = true;
            glideTo(Math.round(st.progress * steps), () => {
              gliding = false;
            });
            return;
          }
          const next = Math.round(st.progress * steps) + Math.sign(e.deltaY);
          if (next < 0 || next > steps) return;
          swallow();
          used = true;
          gliding = true;
          glideTo(next, () => {
            gliding = false;
          });
        };
        window.addEventListener("wheel", onWheel, { capture: true, passive: false });

        // Whenever scrolling stops between two panels (entering the section, keyboard,
        // scrollbar drags, touch), settle on the nearest whole panel.
        const settle = () => {
          if (!inside() || gliding) return;
          const at = st.progress * steps;
          if (Math.abs(at - Math.round(at)) < 0.01) return;
          glideTo(Math.round(at));
        };
        ScrollTrigger.addEventListener("scrollEnd", settle);

        return () => {
          window.removeEventListener("wheel", onWheel, { capture: true });
          ScrollTrigger.removeEventListener("scrollEnd", settle);
        };
      });

      // Mobile, or no sideways motion: the same reveals, triggered vertically.
      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        animateArt((panel) => ({
          trigger: panel.querySelector("svg") ?? panel,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }));
      });

      function animateArt(trigger: (panel: Element) => ScrollTrigger.Vars) {
        gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
          const tl = gsap.timeline({ scrollTrigger: trigger(panel) });
          const strokes = gsap.utils.toArray<SVGPathElement>(panel.querySelectorAll("[data-draw]"));
          const motto = panel.querySelectorAll("[data-motto]");
          // Each stroke draws in over 1.6s, 0.12s after the one before. A path can set its
          // own length (data-duration) or start time (data-at) in seconds, e.g. the long
          // heartbeat line.
          // Hidden until its turn: an undrawn stroke with round caps still shows a dot.
          gsap.set(strokes, { drawSVG: "0%", visibility: "hidden" });
          strokes.forEach((path, i) => {
            const at = Number(path.dataset.at ?? i * 0.12);
            tl.set(path, { visibility: "visible" }, at).fromTo(
              path,
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: Number(path.dataset.duration ?? 1.6), ease: "draw" },
              at,
            );
          });
          if (motto.length) tl.from(motto, { yPercent: 40, autoAlpha: 0, stagger: 0.15, duration: 1.4 }, 1.6);
        });
      }
    },
    { scope: root },
  );

  return (
    <section id="ventures" ref={root} aria-labelledby="ventures-title">
      <div className="overflow-clip">
        <div ref={track} className="flex flex-col lg:motion-safe:w-max lg:motion-safe:flex-row">
          <Intro />
          {site.ventures.map((v) => (
            <Panel key={v.id} venture={v} />
          ))}
        </div>
      </div>
    </section>
  );
}

// The first panel of the sideways run: what this part of the page is, and what's coming.
function Intro() {
  const swatch = { ads: "bg-ads", interiors: "bg-interiors", foundation: "bg-foundation" } as const;
  return (
    <div className="relative flex flex-col justify-center px-4 py-24 sm:px-8 lg:min-h-svh lg:motion-safe:h-svh lg:motion-safe:w-screen lg:motion-safe:py-16">
      <div className="mx-auto grid w-full max-w-[90rem] gap-14 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-7">
          <p className="mb-5 text-sm font-semibold tracking-wide text-ink-soft uppercase">Beyond the portfolio</p>
          <RevealHeading id="ventures-title" className="max-w-[14ch] font-display text-headline uppercase">
            Three more things I put my name to
          </RevealHeading>
          <p className="mt-8 max-w-[44ch] text-lg text-ink-soft">
            Alongside the wealth practice, I run an advertising business, lead marketing for an interiors
            studio and head a foundation that gives back to Hyderabad.
          </p>
        </div>

        <ul className="border-t border-ink lg:col-span-4 lg:col-start-9">
          {site.ventures.map((v) => (
            <li key={v.id} className="flex items-center gap-4 border-b border-line py-4">
              <span aria-hidden className={`size-3 shrink-0 ${swatch[v.theme]}`} />
              <span className="font-display text-2xl uppercase">{v.name}</span>
              <span className="ml-auto hidden text-right text-sm text-ink-soft sm:block">{v.kicker}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop only: a nudge that this part moves sideways. */}
      <p
        aria-hidden
        className="absolute right-8 bottom-12 hidden items-center gap-3 text-sm font-semibold tracking-wide uppercase lg:motion-safe:flex"
      >
        Keep scrolling
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="square" />
        </svg>
      </p>
    </div>
  );
}

function Panel({ venture: v }: { venture: Venture }) {
  const t = themes[v.theme];
  return (
    <article
      data-panel
      data-header-tone={v.theme === "ads" ? "ink" : "paper"}
      aria-labelledby={`${v.id}-name`}
      className={`${t.panel} relative flex flex-col lg:min-h-svh justify-between px-4 py-20 sm:px-8 lg:motion-safe:h-svh lg:motion-safe:w-screen lg:motion-safe:pt-28 lg:motion-safe:pb-16`}
    >
      <div className={`border-b pb-4 text-sm font-semibold ${t.rule}`}>{v.kicker}</div>

      <div className="mx-auto grid w-full max-w-[90rem] flex-1 items-center gap-12 py-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <h3 id={`${v.id}-name`} className="font-display text-[clamp(3rem,7.5vw,7.5rem)] uppercase">
            {v.name}
          </h3>
          <p className="mt-8 max-w-[42ch] text-lg sm:text-xl">{v.body}</p>
          <ul className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 font-semibold ${t.soft}`}>
            {v.offerings.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <Button href={v.cta.href} external variant={v.theme} className="mt-10">
            {v.cta.label}
          </Button>
        </div>

        <div className="lg:col-span-5 lg:col-start-8" aria-hidden>
          {v.theme === "ads" && <Broadcast />}
          {v.theme === "interiors" && <FloorPlan />}
          {v.theme === "foundation" && <Heartbeat />}
        </div>
      </div>
    </article>
  );
}

// The three venture drawings share one style: stroke-only line art in the panel's text
// colour, each path drawn in by the panel's reveal (data-draw, see animateArt) using GSAP's
// DrawSVG, which measures every path's real length so the stroke grows smoothly.
const stroke = { "data-draw": true } as const;

function Drawing({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 320"
      // Non-scaling strokes keep the fine line weight however large the drawing renders.
      className="w-full max-w-lg fill-none stroke-current [&_path]:[vector-effect:non-scaling-stroke]"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// AdsXcell: one phone sends a message, waves go out, and a grid of phones receive it.
const smallPhones = [
  [250, 62],
  [320, 62],
  [250, 132],
  [320, 132],
  [250, 202],
  [320, 202],
] as const;

function Broadcast() {
  return (
    <Drawing>
      <path {...stroke} d="M52 80h66a12 12 0 0 1 12 12v136a12 12 0 0 1-12 12H52a12 12 0 0 1-12-12V92a12 12 0 0 1 12-12Z" />
      <path {...stroke} d="M74 94h22" strokeWidth={1.5} />
      <path {...stroke} d="M58 128h54v30H80l-12 10v-10H58Z" strokeWidth={1.5} />
      <path {...stroke} d="M66 139h38M66 148h24" strokeWidth={1.5} opacity={0.7} />
      <path {...stroke} d="M151 139A30 30 0 0 1 151 181" />
      <path {...stroke} d="M169 121A55 55 0 0 1 169 199" />
      <path {...stroke} d="M187 103A80 80 0 0 1 187 217" />
      {smallPhones.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          {...stroke}
          d={`M${x + 6} ${y}h28a6 6 0 0 1 6 6v48a6 6 0 0 1-6 6h-28a6 6 0 0 1-6-6V${y + 6}a6 6 0 0 1 6-6ZM${x + 10} ${y + 22}h20`}
          strokeWidth={1.5}
        />
      ))}
    </Drawing>
  );
}

// SP Design Studio: a floor plan drawing itself in, room by room.
function FloorPlan() {
  return (
    <Drawing>
      <path {...stroke} d="M20 20H380V300H20Z" />
      <path {...stroke} d="M200 20V140M200 190V300" />
      <path {...stroke} d="M20 170H120M160 170H200" />
      <path {...stroke} d="M260 300V220H380" strokeWidth={1.5} />
      <path {...stroke} d="M60 60h90v50H60Z" strokeWidth={1.5} opacity={0.7} />
      <path {...stroke} d="M240 60h110v80H240Z" strokeWidth={1.5} opacity={0.7} />
      <path {...stroke} d="M50 220a30 30 0 1 0 60 0a30 30 0 1 0-60 0" strokeWidth={1.5} opacity={0.7} />
      <path {...stroke} d="M120 170a40 40 0 0 1 40-40" strokeWidth={1.25} opacity={0.6} />
    </Drawing>
  );
}

// HridaySpandana ("the heart's response"): a heartbeat that loops into a heart, with a
// small medical cross for the health camps, and the motto underneath.
function Heartbeat() {
  return (
    <div>
      <Drawing>
        <path
          {...stroke}
          data-duration="2.6"
          d="M10 230H96l12-34 18 70 16-96 14 60H200C200 230 146 192 146 158a27 27 0 0 1 54-8a27 27 0 0 1 54 8c0 34-54 72-54 72H262l10-24 12 40 10-16H390"
        />
        <path {...stroke} data-at="1.44" d="M188 92v-24M176 80h24" strokeWidth={1.5} opacity={0.7} />
        <path {...stroke} data-at="1.68" d="M110 290h180" strokeWidth={1.25} opacity={0.5} />
      </Drawing>
      <p className="mt-6 font-serif text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.05] italic">
        <span data-motto className="block">
          Maanav Seva, Madhav Seva.
        </span>
        <span data-motto className="mt-3 block font-sans text-base not-italic text-foundation-soft">
          Service to people is service to God.
        </span>
      </p>
    </div>
  );
}
