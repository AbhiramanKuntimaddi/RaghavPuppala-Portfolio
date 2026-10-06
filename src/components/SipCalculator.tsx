"use client";

import { useId, useMemo, useRef, useState } from "react";
import { whatsappLink } from "@/content/site";
import { formatINR, formatINRShort } from "@/lib/format";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { Button } from "./Button";
import { RevealHeading } from "./Reveal";

const AMOUNTS = [500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000];
const SAMPLES = 48;
const W = 640;
const H = 280;

function futureValue(monthly: number, annualRate: number, months: number) {
  const i = annualRate / 100 / 12;
  if (months === 0) return 0;
  return monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
}

// Value and invested amount at evenly spaced points, so every scenario has
// the same number of points and the curve can tween between them.
function series(monthly: number, rate: number, years: number) {
  const value: number[] = [];
  const invested: number[] = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const m = Math.round((s / SAMPLES) * years * 12);
    value.push(futureValue(monthly, rate, m));
    invested.push(monthly * m);
  }
  return { value, invested };
}

type Frame = { value: number[]; invested: number[]; max: number; total: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function blend(a: Frame, b: Frame, t: number): Frame {
  return {
    value: a.value.map((v, i) => lerp(v, b.value[i], t)),
    invested: a.invested.map((v, i) => lerp(v, b.invested[i], t)),
    max: lerp(a.max, b.max, t),
    total: lerp(a.total, b.total, t),
  };
}

function toPath(points: number[], max: number, close: boolean) {
  const d = points
    .map((v, s) => `${s ? "L" : "M"}${((s / SAMPLES) * W).toFixed(1)},${(H - (v / max) * H * 0.92).toFixed(1)}`)
    .join("");
  return close ? `${d}L${W},${H}L0,${H}Z` : d;
}

export function SipCalculator() {
  const [amountIdx, setAmountIdx] = useState(6);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);

  const monthly = AMOUNTS[amountIdx];
  const target = useMemo(() => series(monthly, rate, years), [monthly, rate, years]);
  const total = target.value[SAMPLES];
  const invested = target.invested[SAMPLES];

  const root = useRef<HTMLElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const investedRef = useRef<SVGPathElement>(null);
  const shown = useRef<Frame | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  // One tween blends the whole frame (curve, scale, headline) from wherever it
  // is now to the new scenario, so the parts can never fall out of step.
  useGSAP(
    () => {
      const to: Frame = { value: target.value, invested: target.invested, max: Math.max(total, 1), total };
      const draw = (f: Frame) => {
        shown.current = f;
        areaRef.current?.setAttribute("d", toPath(f.value, f.max, true));
        lineRef.current?.setAttribute("d", toPath(f.value, f.max, false));
        investedRef.current?.setAttribute("d", toPath(f.invested, f.max, false));
        const text = totalRef.current?.firstChild;
        if (text) text.nodeValue = formatINRShort(f.total);
      };

      tween.current?.kill();
      const from = shown.current;
      if (!from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        draw(to);
        return;
      }

      const p = { t: 0 };
      tween.current = gsap.to(p, {
        t: 1,
        duration: 0.9,
        ease: "expo.out",
        onUpdate: () => draw(blend(from, to, p.t)),
      });
    },
    { dependencies: [target, total], scope: root },
  );

  // Desktop: the section holds still while it builds (sliders arrive, the result rises,
  // the chart draws left to right, then the breakdown and CTA) and lets go once it's
  // complete. The sliders work the whole time. Phones: the same pieces reveal on entry.
  useGSAP(
    () => {
      // "all" keeps the callback running when neither named condition matches.
      gsap.matchMedia().add({ wide: "(min-width: 1024px)", motion: MOTION_OK, all: "all" }, (ctx) => {
        const { wide, motion } = ctx.conditions as { wide: boolean; motion: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);
        const sliders = q("[data-sliders] > *");
        const result = q("[data-calc=result]");
        const chart = q("[data-calc=chart]");
        const after = q("[data-calc=after]");
        const reveal = { clipPath: "inset(0% 100% 0% 0%)" };
        const revealed = { clipPath: "inset(0% 0% 0% 0%)" };

        if (!wide) {
          const tl = gsap.timeline({
            defaults: { ease: "expo.out", duration: 1 },
            scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
          });
          tl.from(sliders, { y: 24, autoAlpha: 0, stagger: 0.1 })
            .from(result, { y: 30, autoAlpha: 0, stagger: 0.1 }, 0.2)
            .fromTo(chart, reveal, { ...revealed, duration: 1.4, ease: "power2.inOut" }, 0.3)
            .from(after, { y: 20, autoAlpha: 0, stagger: 0.1 }, 0.8);
          return;
        }

        gsap
          .timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${window.innerHeight * 1.5}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .from(sliders, { y: 30, autoAlpha: 0, stagger: 0.25, duration: 0.6 })
          .from(result, { y: 40, autoAlpha: 0, stagger: 0.15, duration: 0.6 }, 0.3)
          .fromTo(chart, reveal, { ...revealed, duration: 1.2, ease: "power1.inOut" }, 0.6)
          .from(after, { y: 24, autoAlpha: 0, stagger: 0.15, duration: 0.5 }, ">-0.3")
          // A short hold so the finished calculator sits on screen before the page moves on.
          .to({}, { duration: 0.6 });
      });
    },
    { scope: root },
  );

  const message = `Hi Raghav, I'd like to plan a SIP of ${formatINR(monthly)} a month for ${years} years.`;

  return (
    <section
      id="calculator"
      ref={root}
      aria-labelledby="calc-title"
      className="bg-paper-2 py-24 sm:py-32 lg:flex lg:h-svh lg:min-h-[46rem] lg:items-center lg:py-0 lg:pt-16"
    >
      <div className="mx-auto grid w-full max-w-[90rem] gap-16 px-4 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <p className="mb-5 text-sm font-semibold tracking-wide text-ink-soft uppercase">SIP calculator</p>
          <RevealHeading id="calc-title" className="font-display text-headline uppercase">
            Run the numbers
          </RevealHeading>
          <p className="mt-8 max-w-[40ch] text-lg text-ink-soft">
            See what a monthly SIP could grow into. Then let&rsquo;s build the real plan around it.
          </p>

          <div data-sliders className="mt-12 space-y-8 lg:mt-10">
            <Slider
              label="Every month"
              value={formatINR(monthly)}
              min={0}
              max={AMOUNTS.length - 1}
              step={1}
              current={amountIdx}
              onChange={setAmountIdx}
              valueText={formatINR(monthly)}
            />
            <Slider
              label="For"
              value={`${years} ${years === 1 ? "year" : "years"}`}
              min={1}
              max={35}
              step={1}
              current={years}
              onChange={setYears}
            />
            <Slider
              label="Expected return"
              value={`${rate}% a year`}
              min={6}
              max={15}
              step={0.5}
              current={rate}
              onChange={setRate}
            />
          </div>
        </div>

        <div className="flex flex-col lg:col-span-6 lg:col-start-7">
          <p data-calc="result" className="text-lg font-medium">
            In {years} {years === 1 ? "year" : "years"}, {formatINR(monthly)} a month could become
          </p>
          <p
            data-calc="result"
            className="mt-2 font-display text-[clamp(4rem,11vw,9.5rem)] tabular lg:text-[clamp(4rem,7.5vw,8rem)]"
            aria-hidden
          >
            <span ref={totalRef}>{formatINRShort(total)}</span>
          </p>
          <p className="sr-only" aria-live="polite">
            Projected value {formatINR(total)}, of which {formatINR(invested)} is invested.
          </p>

          <div data-calc="chart" className="relative mt-8 lg:mt-6">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-56 w-full sm:h-72 lg:h-56" aria-hidden>
              <path ref={areaRef} className="fill-marigold" />
              <path ref={lineRef} className="fill-none stroke-ink" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
              <path
                ref={investedRef}
                className="fill-none stroke-ink"
                strokeWidth={1.5}
                strokeDasharray="5 6"
                vectorEffect="non-scaling-stroke"
              />
              <line x1="0" x2={W} y1={H} y2={H} className="stroke-ink" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-2 flex justify-between text-xs font-medium text-ink-soft tabular">
              <span>Today</span>
              <span>Year {years}</span>
            </div>
          </div>

          <dl data-calc="after" className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 lg:mt-6">
            <div>
              <dt className="flex items-center gap-2 text-sm text-ink-soft">
                <span aria-hidden className="inline-block w-5 border-t-[1.5px] border-dashed border-ink" />
                You invest
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular">{formatINRShort(invested)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm text-ink-soft">
                <span aria-hidden className="inline-block size-3 rounded-[2px] bg-marigold" />
                Estimated growth
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular">{formatINRShort(total - invested)}</dd>
            </div>
          </dl>

          <div data-calc="after" className="mt-10 self-start lg:mt-8">
            <Button href={whatsappLink(message)} external variant="ink-on-paper">
              Plan this with Raghav
            </Button>
          </div>

          <p data-calc="after" className="mt-8 max-w-[60ch] text-xs leading-relaxed text-ink-soft lg:mt-6">
            Illustration only. Assumes a constant annual return compounded monthly. Mutual fund returns are
            market-linked, vary year to year and are not guaranteed.
          </p>
        </div>
      </div>
    </section>
  );
}

type SliderProps = {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
  valueText?: string;
};

function Slider({ label, value, min, max, step, current, onChange, valueText }: SliderProps) {
  const id = useId();
  const fill = ((current - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <span className="text-xl font-semibold tabular">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={current}
        aria-valuetext={valueText ?? value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
    </div>
  );
}
