"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, MOTION_REDUCED, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const { footer } = site;

// Extra scroll for the wordmark, in screen heights.
const HOLD = 0.5;

// Fixed under the page, which lifts off it like a card: <main> scrolls up to uncover it, then
// holds (sticky) while the wordmark rises. The spacer before it is that scroll.
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const space = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      const el = root.current!;
      const spacer = space.current!;
      const main = document.querySelector("main");
      if (!main) return;

      gsap.matchMedia().add({ motion: MOTION_OK, reduced: MOTION_REDUCED }, (context) => {
        const { motion } = context.conditions as { motion: boolean };
        const hold = motion ? HOLD : 0;

        // Stops one notch short, so Contact's cut corner shows the footer's ink.
        const notch = () =>
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--notch-size")) || 0;
        const uncover = () => body.current!.offsetHeight - notch();
        const size = () => {
          spacer.style.height = `${uncover() + window.innerHeight * hold}px`;
        };
        // In dvh, so it stays aligned as a phone's toolbar collapses (no refresh there).
        const stick = () => {
          main.style.top = `calc(100dvh - ${uncover() + main.offsetHeight}px)`;
        };
        size();
        stick();
        ScrollTrigger.addEventListener("refreshInit", size);
        ScrollTrigger.addEventListener("refresh", stick);
        // Also when heights change between refreshes.
        const resized = new ResizeObserver(stick);
        resized.observe(main);
        resized.observe(body.current!);
        ScrollTrigger.refresh();

        if (motion) {
          const q = gsap.utils.selector(el);
          // Opacity only, so the credit link stays tabbable. fromTo, so nothing strands mid-way.
          const uncovering = {
            trigger: spacer,
            start: "top bottom",
            end: () => `top+=${uncover()} bottom`,
            scrub: true,
          };
          gsap.fromTo(q("[data-sign-block]"), { y: 48 }, { y: 0, ease: "none", scrollTrigger: uncovering });
          const contact = document.getElementById("contact");
          if (contact)
            gsap.fromTo(
              contact,
              { scale: 1 },
              { scale: 0.965, transformOrigin: "50% 0%", ease: "none", scrollTrigger: uncovering },
            );
          gsap.fromTo(
            q("[data-sign]"),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.25, ease: "none", scrollTrigger: uncovering },
          );
          // Then the wordmark, across the hold.
          SplitText.create(q("[data-wordmark]")[0], {
            type: "chars",
            mask: "chars",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 110,
                stagger: 0.04,
                ease: "none",
                scrollTrigger: {
                  trigger: spacer,
                  start: () => `top+=${uncover()} bottom`,
                  end: "bottom bottom",
                  scrub: true,
                },
              }),
          });
        }

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", size);
          ScrollTrigger.removeEventListener("refresh", stick);
          resized.disconnect();
          main.style.top = "";
        };
      });

      // Tabbing into the footer early: jump to the end so it's uncovered.
      const reveal = () => {
        const end = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= end - 2) return;
        lenis?.scrollTo(end, { immediate: true, force: true });
        window.scrollTo(0, end);
      };
      el.addEventListener("focusin", reveal);
      return () => el.removeEventListener("focusin", reveal);
    },
    { dependencies: [lenis] },
  );

  return (
    <>
      <div ref={space} aria-hidden className="h-[24rem]" />
      <footer
        ref={root}
        data-header-tone="paper"
        className="fixed inset-0 z-0 flex flex-col justify-end bg-ink text-paper"
      >
        <div ref={body} className="relative overflow-clip px-4 pt-20 pb-14 sm:px-8 sm:pb-12 lg:pt-24">
          <p
            data-wordmark
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[18%] text-center font-display text-[13.6vw] leading-[0.8] whitespace-nowrap text-paper/[0.06] uppercase select-none"
          >
            {site.name}
          </p>

          <div data-sign-block className="relative flex flex-col items-center text-center">
            <p data-sign className="text-[11px] leading-loose tracking-[0.3em] text-paper/85 uppercase md:text-sm">
              © {year} {site.name}
              <span className="block sm:inline">
                <span className="hidden sm:inline"> · </span>
                {footer.tagline}
              </span>
            </p>
            <p data-sign className="mt-5 text-[11px] tracking-[0.26em] text-paper/85 uppercase md:text-sm">
              Website brought to life by <Credit />
            </p>
            <p data-sign className="mt-10 max-w-[80ch] text-[11px] leading-relaxed text-paper/40 md:text-xs">
              {site.disclaimer}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function Credit() {
  return (
    <a
      href={footer.credit.href}
      target="_blank"
      rel="noopener"
      className="group relative inline-block px-1.5 py-0.5 text-marigold transition-colors duration-500 ease-out-expo hover:text-ink focus-visible:text-ink"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-[0.06] bg-marigold transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />
      <span className="relative">{footer.credit.name}</span>
    </a>
  );
}
