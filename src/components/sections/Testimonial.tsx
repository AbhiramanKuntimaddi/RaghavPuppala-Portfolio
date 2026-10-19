"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const SLOT = 7;

// A timed loop while on screen: each quote lights up word by word, then the next. Pauses
// off-screen and while focus is inside; with reduced motion the quotes just stack.
export function Testimonial() {
  const root = useRef<HTMLElement>(null);
  const loop = useRef<gsap.core.Timeline | null>(null);
  const starts = useRef<number[]>([]);

  useGSAP(
    () => {
      // Created first, so the play/pause trigger below includes the hold.
      gsap.matchMedia().add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=100%",
          pin: true,
        });
      });

      gsap.matchMedia().add(MOTION_OK, () => {
        const quotes = gsap.utils.toArray<HTMLElement>("[data-quote]");
        const bars = gsap.utils.toArray<HTMLElement>("[data-bar]");
        // Words only, so re-wrapping never invalidates the split.
        const words = quotes.map((q) => SplitText.create(q.querySelector("blockquote"), { type: "words" }).words);

        gsap.set(quotes, { autoAlpha: 0 });
        gsap.set(words.flat(), { opacity: 0.15 });
        const tl = gsap.timeline({ repeat: -1, paused: true });
        tl.set(bars, { scaleX: 0 }, 0);

        quotes.forEach((q, i) => {
          const at = i * SLOT;
          const caption = q.querySelector("figcaption");
          starts.current[i] = at;
          // Reset at the start of each slot, so every pass begins dim.
          tl.set(words[i], { opacity: 0.15 }, at)
            .set(caption, { autoAlpha: 0, y: 12 }, at)
            .fromTo(q, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, at)
            .to(words[i], { opacity: 1, duration: 0.4, stagger: 0.07, ease: "none" }, at + 0.3)
            .to(
              caption,
              { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" },
              at + 0.3 + 0.07 * words[i].length + 0.2,
            )
            .fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: SLOT, ease: "none" }, at)
            .to(q, { autoAlpha: 0, y: -30, duration: 0.6, ease: "power2.in" }, at + SLOT - 0.6);
        });
        loop.current = tl;

        const parent = root.current!.parentElement;
        ScrollTrigger.create({
          trigger: parent?.classList.contains("pin-spacer") ? parent : root.current,
          start: "top 70%",
          end: "bottom 30%",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });

        return () => {
          loop.current = null;
        };
      });
    },
    { scope: root },
  );

  // Pause for keyboard users; a mouse resting anywhere is fine.
  const pause = () => loop.current?.pause();
  const resume = () => loop.current?.play();
  const jump = (i: number) => loop.current?.seek((starts.current[i] ?? 0) + 0.8).play();

  return (
    <section
      ref={root}
      aria-label="What clients say"
      // WhatsAppToast's trigger.
      data-qr-toast
      data-header-tone="paper"
      onFocus={(e) => e.target.matches(":focus-visible") && pause()}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && resume()}
      className="notch bg-ink py-24 text-paper [--notch:var(--color-paper-2)] sm:py-32 md:flex md:h-lvh md:min-h-160 md:flex-col md:justify-center md:py-0 md:pt-16"
    >
      <div className="mx-auto w-full max-w-360 px-4 sm:px-8">
        <p data-scramble className="mb-10 text-sm font-semibold tracking-wide text-paper/60 uppercase md:mb-14">
          What clients say
        </p>

        {/* One shared grid cell: as tall as the longest quote, so nothing jumps. */}
        <div className="grid gap-20 motion-safe:gap-0">
          {site.testimonials.map((t) => (
            <figure key={t.author} data-quote className="motion-safe:[grid-area:1/1]">
              <blockquote className="max-w-[26ch] font-serif text-[clamp(2rem,5.2vw,4.75rem)] leading-[1.08] tracking-[-0.01em] italic">
                {/* The quote mark hangs in the margin. */}
                <span data-hang>&ldquo;</span>
                {t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-4 font-semibold">
                <span aria-hidden className="h-px w-12 bg-paper" />
                {t.author}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 hidden max-w-xs gap-2 motion-safe:flex">
          {site.testimonials.map((t, i) => (
            <button
              key={t.author}
              type="button"
              onClick={() => jump(i)}
              aria-label={`Show the quote from ${t.author}`}
              className="group flex-1 py-3"
            >
              <span className="block h-0.5 bg-paper/15 transition-colors duration-300 group-hover:bg-paper/30">
                <span data-bar className="block h-full origin-left scale-x-0 bg-paper" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
