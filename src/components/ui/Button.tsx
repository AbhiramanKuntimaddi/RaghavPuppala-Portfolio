"use client";

import { useRef, type CSSProperties } from "react";
import { bandHandlers, bandOrigin } from "@/lib/band";
import { gsap, useGSAP } from "@/lib/gsap";

// Per surface. `fill` rises on hover, so it must contrast with the button and the surface.
const variants = {
  // on marigold
  ink: { bg: "var(--color-ink)", fg: "var(--color-paper)", fill: "var(--color-paper)", fillFg: "var(--color-ink)" },
  // on paper
  "ink-on-paper": {
    bg: "var(--color-ink)",
    fg: "var(--color-paper)",
    fill: "var(--color-marigold)",
    fillFg: "var(--color-ink)",
  },
  // header: marigold at the top, paper once scrolled
  header: {
    bg: "var(--color-ink)",
    fg: "var(--color-paper)",
    fill: "var(--color-marigold-deep)",
    fillFg: "var(--color-ink)",
  },
  // on ink
  marigold: {
    bg: "var(--color-marigold)",
    fg: "var(--color-ink)",
    fill: "var(--color-paper)",
    fillFg: "var(--color-ink)",
  },
  // outline on marigold
  outline: {
    bg: "var(--color-ink)",
    fg: "var(--color-ink)",
    fill: "var(--color-ink)",
    fillFg: "var(--color-marigold)",
    inner: "var(--color-marigold)",
  },
  // outline on the calculator's paper
  "outline-on-paper": {
    bg: "var(--color-ink)",
    fg: "var(--color-ink)",
    fill: "var(--color-ink)",
    fillFg: "var(--color-paper)",
    inner: "var(--color-paper)",
  },
  "outline-on-paper-2": {
    bg: "var(--color-ink)",
    fg: "var(--color-ink)",
    fill: "var(--color-ink)",
    fillFg: "var(--color-paper)",
    inner: "var(--color-paper-2)",
  },
  // outline on ink
  "outline-on-ink": {
    bg: "var(--color-paper)",
    fg: "var(--color-paper)",
    fill: "var(--color-paper)",
    fillFg: "var(--color-ink)",
    inner: "var(--color-ink)",
  },
  broadcast: {
    bg: "var(--color-ink)",
    fg: "var(--color-broadcast)",
    fill: "var(--color-paper)",
    fillFg: "var(--color-ink)",
  },
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
  lg: {
    box: "h-16 text-base sm:h-[4.5rem] sm:text-lg",
    label: "px-7 sm:px-8",
    cell: "w-16 sm:w-[4.5rem]",
    notch: "14px",
  },
} as const;

type ButtonVariant = keyof typeof variants;

type Props = {
  href: string;
  children: string;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  external?: boolean;
  className?: string;
  /** Shorter label for phones. */
  shortLabel?: string;
  /** Drop the arrow cell below `sm`. */
  compactOnMobile?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & Pick<React.AriaAttributes, "aria-haspopup" | "aria-expanded" | "aria-controls">;

export function Button({
  href,
  children,
  variant = "ink",
  size = "md",
  external,
  className = "",
  shortLabel,
  compactOnMobile,
  onClick,
  ...aria
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const v: { bg: string; fg: string; fill: string; fillFg: string; inner?: string } = variants[variant];
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
    "--btn-inner": v.inner,
  } as CSSProperties;

  const label = (text: string, extra = "") => <span className={`block ${extra}`}>{text}</span>;

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      {...aria}
      {...bandHandlers}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      style={style}
      className={`group relative inline-flex shrink-0 items-stretch font-bold tracking-[0.06em] whitespace-nowrap uppercase font-condensed text-(--btn-fg) transition-colors duration-300 hover:text-(--btn-fill-fg) focus-visible:text-(--btn-fill-fg) ${s.box} ${className}`}
    >
      {/* Clipped layer, so the focus ring isn't clipped. */}
      <span
        aria-hidden
        className="absolute inset-0 overflow-clip bg-(--btn-bg) [clip-path:polygon(0_0,calc(100%-var(--btn-notch))_0,100%_var(--btn-notch),100%_100%,0_100%)]"
      >
        {v.inner && (
          <span className="absolute inset-0.5 bg-(--btn-inner) [clip-path:polygon(0_0,calc(100%-var(--btn-notch)+1px)_0,100%_calc(var(--btn-notch)-1px),100%_100%,0_100%)]" />
        )}
        <span
          className={`absolute inset-0 scale-x-0 bg-(--btn-fill) transition-transform duration-500 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100 ${bandOrigin}`}
        />
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
        <Arrow className="transition-transform duration-500 ease-out-expo group-hover:translate-x-[3em] group-hover:translate-y-[-3em] group-focus-visible:translate-x-[3em] group-focus-visible:translate-y-[-3em]" />
        <Arrow className="absolute translate-x-[-3em] translate-y-[3em] transition-transform duration-500 ease-out-expo group-hover:translate-0 group-focus-visible:translate-0" />
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
