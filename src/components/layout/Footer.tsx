"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, MOTION_REDUCED, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const { footer } = site;

// Extra scroll after the footer is uncovered, while its wordmark assembles (screen heights).
const HOLD = 0.5;

// A short sign-off in the studio's footer style: the copyright and credit centred over his
// name as a huge, faint wordmark sitting off the bottom edge.
//
// It sits underneath the page, fixed to the bottom of the screen, and the page lifts off
// it like a card: <main> scrolls up until the footer is fully uncovered while Contact shrinks
// back a little, and the footer's copy rises into place as it's revealed. Then <main> holds
// (it's sticky, with its top set so it stops right there) for half a screen more while the
// wordmark rises letter by letter with the scroll. The empty block rendered before the
// footer is that scroll: the footer's height plus the hold. Scrolling back reverses it all
// and the card settles back over the footer.
//
// The footer's ink fills the screen behind the page (its content sits at the bottom), so the
// gaps around the shrinking card show ink, not the page background.
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

        // The page stops one trimmed corner short of the footer's top edge, overlapping its top
        // padding, so the corner cut into Contact's bottom-right shows the footer's ink.
        const notch = () =>
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--notch-size")) || 0;
        const uncover = () => body.current!.offsetHeight - notch();
        // Before ScrollTrigger measures: the scroll the footer needs (uncovering plus the hold).
        const size = () => {
          spacer.style.height = `${uncover() + window.innerHeight * hold}px`;
        };
        // After: <main> sticks once the footer is uncovered. Measured from the live screen
        // height (dvh) rather than a number taken at refresh, so it stays meeting the footer
        // as a phone's toolbar collapses, which doesn't trigger a refresh (lib/gsap.ts).
        const stick = () => {
          main.style.top = `calc(100dvh - ${uncover() + main.offsetHeight}px)`;
        };
        size();
        stick();
        ScrollTrigger.addEventListener("refreshInit", size);
        ScrollTrigger.addEventListener("refresh", stick);
        // And whenever the page or the footer changes height between refreshes (a section
        // settling after a resize, or a layout shift a touch device's ignored resize hides).
        const resized = new ResizeObserver(stick);
        resized.observe(main);
        resized.observe(body.current!);
        ScrollTrigger.refresh();

        if (motion) {
          const q = gsap.utils.selector(el);
          // Entry, while the page lifts off the footer: its copy rises into place with the
          // scroll, line after line, and the whole block drifts up a little as it's uncovered.
          // Opacity only (not visibility), so the credit link can still be tabbed to. Both ends
          // are stated, so nothing can be stranded half-way if the layout is recalculated.
          const uncovering = {
            trigger: spacer,
            start: "top bottom",
            end: () => `top+=${uncover()} bottom`,
            scrub: true,
          };
          gsap.fromTo(q("[data-sign-block]"), { y: 48 }, { y: 0, ease: "none", scrollTrigger: uncovering });
          // Contact lifts off like a card: it shrinks back a little from its top edge, so its
          // sides and trimmed corner pull in over the footer's ink.
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
          // Then the hold, from fully uncovered to the end of the page: the wordmark rises
          // letter by letter across it.
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

      // Tabbing into the footer before the end of the page: go to the end, so it's uncovered.
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
      {/* The scroll that uncovers the footer (sized by script; a close guess without it). */}
      <div ref={space} aria-hidden className="h-[24rem]" />
      <footer
        ref={root}
        data-header-tone="paper"
        className="fixed inset-0 z-0 flex flex-col justify-end bg-ink text-paper"
      >
        <div ref={body} className="relative overflow-clip px-4 pt-20 pb-14 sm:px-8 sm:pb-12 lg:pt-24">
          {/* His name, too big for the page, sitting behind the text and off the bottom edge. */}
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

// The studio credit. Its marigold underline rises into a full band on hover, with the
// same clipped corner as the site's buttons.
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
