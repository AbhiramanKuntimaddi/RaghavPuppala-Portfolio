"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";
import { site, type Venture } from "@/content/site";
import { gsap, MOTION_OK, type ScrollTrigger, useGSAP } from "@/lib/gsap";
import { glideTo } from "@/lib/navigate";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";

// above: the corner's colour and shadow strength. --edge-shade-own: the shadow cast on this sheet.
const themes = {
  broadcast: {
    panel: "bg-broadcast text-ink [--edge-shade-own:var(--edge-shade-mid)]",
    soft: "text-ink/70",
    above: "[--notch:var(--color-paper)]",
  },
  interiors: {
    panel: "bg-interiors text-paper [--edge-shade-own:var(--edge-shade-mid)]",
    soft: "text-interiors-soft",
    above: "[--notch:var(--color-broadcast)] [--edge-shade:var(--edge-shade-mid)]",
  },
  foundation: {
    panel: "bg-foundation text-paper",
    soft: "text-foundation-soft",
    above: "[--notch:var(--color-interiors)] [--edge-shade:var(--edge-shade-mid)]",
  },
} as const;

// Stacked sheets: on desktop each sticks and the next slides over it (plain CSS sticky).
const sheet = "lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-lvh lg:motion-safe:overflow-x-clip";
// Desktop: the corner is a real cut, sized by the notch variables so it folds in and shuts.
const notch =
  "lg:motion-safe:[--cut:calc(var(--notch-size)*var(--notch-in,1)*(1-var(--notch-shut,0)))] lg:motion-safe:[clip-path:polygon(0_calc(-1*var(--notch-lift)),calc(100%-var(--cut)+var(--notch-lift)*0.4142)_calc(-1*var(--notch-lift)),calc(100%-var(--cut))_0,100%_var(--cut),100%_100%,0_100%)]";
const introClip =
  "lg:motion-safe:[clip-path:polygon(0_calc(-1*var(--notch-lift)),100%_calc(-1*var(--notch-lift)),100%_100%,0_100%)]";
// A real cut can't carry its own shadow, so the sheet beneath draws it, following the
// arriving sheet's edge (--beneath-y).
const shadowBeneath =
  "notch-corner-shadow pointer-events-none absolute right-0 z-1 hidden [--edge-shade:var(--edge-shade-own,var(--edge-shade-soft))] top-[calc(-1*var(--notch-lift))] [translate:0_var(--beneath-y,100lvh)] lg:motion-safe:block";

export function Ventures() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const sheets = q("[data-sheet]");
        // The sheet beneath shrinks and dims; its corner folds shut at the end, so the new
        // sheet's cut shows it instead of seeing through every sheet below.
        sheets.slice(0, -1).forEach((el, i) => {
          gsap.fromTo(
            el,
            { "--notch-shut": 0 },
            {
              "--notch-shut": 1,
              ease: "none",
              scrollTrigger: { trigger: sheets[i + 1], start: "top 15%", end: "top top", scrub: true },
            },
          );
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: sheets[i + 1],
                start: "top bottom",
                end: "top top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            .to(el.querySelector("[data-sheet-body]"), { scale: 0.92, yPercent: -3, transformOrigin: "50% 0%" }, 0)
            .to(el.querySelector("[data-shade]"), { opacity: 0.35 }, 0)
            .fromTo(el, { "--beneath-y": () => `${window.innerHeight}px` }, { "--beneath-y": "0px" }, 0);
        });
        animateArt((panel) => ({
          trigger: panel,
          start: "top 25%",
          toggleActions: "play none none reverse",
        }));
      });

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
          // data-duration / data-at override a stroke's timing. Hidden until drawn: a round cap shows as a dot.
          gsap.set(strokes, { drawSVG: "0%", visibility: "hidden" });
          strokes.forEach((path, i) => {
            const at = Number(path.dataset.at ?? i * 0.12);
            tl.set(path, { visibility: "visible" }, at).fromTo(
              path,
              { drawSVG: "0%" },
              {
                drawSVG: "100%",
                duration: Number(path.dataset.duration ?? 1.6),
                ease: "draw",
              },
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
    <section id="ventures" ref={root} aria-labelledby="ventures-title" className="bg-ink">
      <Intro />
      {site.ventures.map((v) => (
        <Panel key={v.id} venture={v} />
      ))}
    </section>
  );
}

function Sheet({ className = "", children, ...rest }: React.ComponentProps<"div">) {
  return (
    <div data-sheet className={`${sheet} ${className}`} {...rest}>
      <div data-sheet-body className="relative flex size-full flex-col">
        {children}
      </div>
      <span data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
      <span aria-hidden className={shadowBeneath} />
    </div>
  );
}

function Intro() {
  const lenis = useLenis();
  // Measured from the section: a stuck sheet reports where it's stuck, not where it sits.
  const openSheet = (from: HTMLElement, index: number) => {
    const section = from.closest("section");
    if (!section) return;
    const sheets = section.querySelectorAll<HTMLElement>("[data-sheet]");
    let y = section.getBoundingClientRect().top + window.scrollY;
    for (let k = 0; k < index; k++) y += sheets[k].offsetHeight;
    glideTo(y, lenis);
  };
  const swatch = {
    broadcast: "bg-broadcast",
    interiors: "bg-interiors",
    foundation: "bg-foundation",
  } as const;
  return (
    <Sheet className={`notch notch-over-ink bg-paper ${introClip}`}>
      <div className="flex flex-1 flex-col justify-center px-4 py-24 sm:px-8 lg:min-h-svh lg:motion-safe:py-16">
        <div className="mx-auto grid w-full max-w-360 gap-14 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <p data-scramble className="mb-5 text-sm font-semibold tracking-wide text-ink-soft uppercase">
              Beyond the portfolio
            </p>
            <Headline id="ventures-title" className="max-w-[14ch] font-display text-headline uppercase">
              Three more things I put my name to
            </Headline>
            <p className="mt-8 max-w-[44ch] text-lg text-ink-soft">
              Alongside the wealth practice, I run an advertising business, lead marketing for an interiors studio and
              head a foundation that gives back to Hyderabad.
            </p>
          </div>

          <div data-lines className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <div data-lined className="relative h-px">
              <span data-line aria-hidden className="absolute inset-0 origin-left bg-ink" />
            </div>
            <ul>
              {site.ventures.map((v, i) => (
                <li key={v.id} data-lined className="relative">
                  <span data-line aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-line" />
                  <button
                    type="button"
                    onClick={(e) => openSheet(e.currentTarget, i + 1)}
                    className="flex w-full cursor-pointer items-center gap-4 py-4 text-left"
                  >
                    <span aria-hidden className={`size-3 shrink-0 ${swatch[v.theme]}`} />
                    <span className="font-display text-2xl uppercase">{v.name}</span>
                    <span className="ml-auto hidden text-right text-sm text-ink-soft sm:block">{v.kicker}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function Panel({ venture: v }: { venture: Venture }) {
  const t = themes[v.theme];
  return (
    <Sheet
      data-header-tone={v.theme === "broadcast" ? "ink" : "paper"}
      className={`notch ${t.panel} ${t.above} ${notch}`}
    >
      <article
        data-panel
        aria-labelledby={`${v.id}-name`}
        className="flex flex-1 flex-col px-4 py-20 sm:px-8 lg:min-h-svh lg:motion-safe:pt-28 lg:motion-safe:pb-16"
      >
        <div className="mx-auto grid w-full max-w-360 flex-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <p className={`mb-5 text-sm font-semibold tracking-wide uppercase ${t.soft}`}>{v.kicker}</p>
            <h3 data-optical id={`${v.id}-name`} className="font-display text-[clamp(2.5rem,7.5vw,7.5rem)] uppercase">
              {v.name}
            </h3>
            <p className="mt-8 max-w-[42ch] text-lg sm:text-xl">{v.body}</p>
            {"proof" in v && <p className={`mt-5 max-w-[46ch] text-sm font-medium ${t.soft}`}>{v.proof}</p>}
            <ul className={`mt-8 flex flex-wrap gap-x-6 gap-y-2 font-semibold ${t.soft}`}>
              {v.offerings.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <div className="mt-10">
              <Button href={v.cta.href} external variant={v.theme}>
                {v.cta.label}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8" aria-hidden>
            {v.theme === "broadcast" && <Broadcast />}
            {v.theme === "interiors" && <FloorPlan />}
            {v.theme === "foundation" && <Heartbeat />}
          </div>
        </div>
      </article>
    </Sheet>
  );
}

// Stroke-only drawings, drawn in with DrawSVG (data-draw).
const stroke = { "data-draw": true } as const;

function Drawing({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 320"
      className="w-full max-w-lg fill-none stroke-current [&_path]:[vector-effect:non-scaling-stroke]"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

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
      <path
        {...stroke}
        d="M52 80h66a12 12 0 0 1 12 12v136a12 12 0 0 1-12 12H52a12 12 0 0 1-12-12V92a12 12 0 0 1 12-12Z"
      />
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

// HridaySpandana ("the heart's response").
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
