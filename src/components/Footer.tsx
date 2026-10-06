"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";

const { footer } = site;

// A short sign-off in the studio's footer style: the copyright and credit centred over
// his name as a huge, faint wordmark that rises out of the bottom edge.
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(q("[data-item]"), {
          y: 20,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 0.9,
          scrollTrigger: { trigger: root.current, start: "top 90%", once: true },
        });

        SplitText.create(q("[data-wordmark]")[0], {
          type: "chars",
          mask: "chars",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.chars, {
              yPercent: 100,
              stagger: 0.035,
              duration: 1.5,
              scrollTrigger: { trigger: root.current, start: "top 90%", once: true },
            });
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      data-header-tone="paper"
      className="relative overflow-clip bg-ink px-4 pt-20 pb-14 text-paper sm:px-8 sm:pb-12 lg:pt-24"
    >
      {/* His name, too big for the page, sitting behind the text and off the bottom edge. */}
      <p
        data-wordmark
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[18%] text-center font-display text-[13.6vw] leading-[0.8] whitespace-nowrap text-paper/[0.06] uppercase select-none"
      >
        {site.name}
      </p>

      <div className="relative flex flex-col items-center text-center">
        <p data-item className="text-[11px] leading-loose tracking-[0.3em] text-paper/85 uppercase md:text-sm">
          © {year} {site.name}
          <span className="block sm:inline">
            <span className="hidden sm:inline"> · </span>
            {footer.tagline}
          </span>
        </p>
        <p data-item className="mt-5 text-[11px] tracking-[0.26em] text-paper/85 uppercase md:text-sm">
          Website brought to life by <Credit />
        </p>
        <p data-item className="mt-10 max-w-[80ch] text-[11px] leading-relaxed text-paper/40 md:text-xs">
          {site.disclaimer}
        </p>
      </div>
    </footer>
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
