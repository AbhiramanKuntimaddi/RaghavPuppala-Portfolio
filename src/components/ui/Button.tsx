"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Colors per surface. `fill` rises on hover, so it must contrast with both the
// button and whatever the button sits on.
const variants = {
  // Ink button on a marigold surface: hover fills with paper.
  ink: { bg: "var(--color-ink)", fg: "var(--color-paper)", fill: "var(--color-paper)", fillFg: "var(--color-ink)" },
  // Ink button on a paper surface: hover fills with marigold.
  "ink-on-paper": {
    bg: "var(--color-ink)",
    fg: "var(--color-paper)",
    fill: "var(--color-marigold)",
    fillFg: "var(--color-ink)",
  },
  // Header: sits on marigold at the top and on paper once scrolled.
  header: {
    bg: "var(--color-ink)",
    fg: "var(--color-paper)",
    fill: "var(--color-marigold-deep)",
    fillFg: "var(--color-ink)",
  },
  // Marigold button on an ink surface (the scrolled header, the mobile menu).
  marigold: {
    bg: "var(--color-marigold)",
    fg: "var(--color-ink)",
    fill: "var(--color-paper)",
    fillFg: "var(--color-ink)",
  },
  ads: { bg: "var(--color-ink)", fg: "var(--color-ads)", fill: "var(--color-paper)", fillFg: "var(--color-ink)" },
  interiors: {
    bg: "var(--color-paper)",
    fg: "var(--color-interiors)",
    fill: "var(--color-ink)",
    fillFg: "var(--color-paper)",
  },
  foundation: {
    bg: "var(--color-paper)",
    fg: "var(--color-foundation)",
    fill: "var(--color-ink)",
    fillFg: "var(--color-paper)",
  },
} as const;

const sizes = {
  sm: { box: "h-10 text-[0.8rem]", label: "px-4", cell: "w-10", notch: "8px" },
  md: { box: "h-14 text-[0.95rem]", label: "px-6", cell: "w-14", notch: "12px" },
  lg: { box: "h-16 text-base sm:h-[4.5rem] sm:text-lg", label: "px-7 sm:px-8", cell: "w-16 sm:w-[4.5rem]", notch: "14px" },
} as const;

export type ButtonVariant = keyof typeof variants;

type Props = {
  href: string;
  children: string;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  external?: boolean;
  className?: string;
  /** Shorter label for phones, when the full one won't fit. */
  shortLabel?: string;
  /** Drop the arrow cell below `sm`, for tight spots like the phone header. */
  compactOnMobile?: boolean;
};

// Squared button with one clipped corner. On hover a briefing band sweeps across
// behind the label and the arrow launches out of its cell. On mouse devices it leans
// toward the cursor.
export function Button({
  href,
  children,
  variant = "ink",
  size = "md",
  external,
  className = "",
  shortLabel,
  compactOnMobile,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const v = variants[variant];
  const s = sizes[size];

  useGSAP(
    () => {
      gsap.matchMedia().add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const el = ref.current!;
        const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "expo.out" });
        const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - (r.left + r.width / 2)) * 0.18);
          y((e.clientY - (r.top + r.height / 2)) * 0.3);
        };
        const reset = () => {
          x(0);
          y(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", reset);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", reset);
        };
      });
    },
    { scope: ref },
  );

  const style = {
    "--btn-bg": v.bg,
    "--btn-fg": v.fg,
    "--btn-fill": v.fill,
    "--btn-fill-fg": v.fillFg,
    "--btn-notch": s.notch,
  } as CSSProperties;

  const label = (text: string, extra = "") => <span className={`block ${extra}`}>{text}</span>;

  return (
    <a
      ref={ref}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      style={style}
      className={`group relative inline-flex shrink-0 items-stretch font-bold tracking-[0.06em] whitespace-nowrap uppercase [font-stretch:82%] text-(--btn-fg) transition-colors duration-300 hover:text-(--btn-fill-fg) focus-visible:text-(--btn-fill-fg) ${s.box} ${className}`}
    >
      {/* Background and hover fill live on a clipped layer so the focus ring isn't clipped too. */}
      <span
        aria-hidden
        className="absolute inset-0 overflow-clip bg-(--btn-bg) [clip-path:polygon(0_0,calc(100%-var(--btn-notch))_0,100%_var(--btn-notch),100%_100%,0_100%)]"
      >
        {/* Briefing band, as on the header links: the fill sweeps in from the left and,
            on leave, carries on out to the right (the origin flips with hover). */}
        <span className="absolute inset-0 origin-right scale-x-0 bg-(--btn-fill) transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100" />
      </span>

      <span className={`relative flex items-center leading-none ${s.label}`}>
        {shortLabel ? (
          <>
            {label(shortLabel, "sm:hidden")}
            {label(children, "hidden sm:block")}
          </>
        ) : (
          label(children)
        )}
      </span>

      <span
        aria-hidden
        className={`relative place-items-center overflow-clip border-l border-current/25 ${s.cell} ${
          compactOnMobile ? "hidden sm:grid" : "grid"
        }`}
      >
        <Arrow className="transition-transform duration-500 ease-out-expo group-hover:translate-x-[3em] group-hover:-translate-y-[3em] group-focus-visible:translate-x-[3em] group-focus-visible:-translate-y-[3em]" />
        <Arrow className="absolute -translate-x-[3em] translate-y-[3em] transition-transform duration-500 ease-out-expo group-hover:translate-0 group-focus-visible:translate-0" />
      </span>
    </a>
  );
}

function Arrow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-[1.1em] ${className}`} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 12 12 4M5.5 4H12v6.5" strokeLinecap="square" />
    </svg>
  );
}
