"use client";

import { useRef } from "react";
import { site, whatsappLink } from "@/content/site";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { Button } from "./Button";
import { Landing } from "./Landing";
import { RevealHeading } from "./Reveal";

// The size every contact detail is set in: numbers, email, socials and hours.
const value = "font-display text-[clamp(1.25rem,2.4vw,2rem)] uppercase";

const HELLO = "Hi Raghav, I'd like to talk about my finances.";

// WhatsApp has its own button beside these, so the rows cover calling and email.
const rows = [
  ...site.contact.phones.map((p) => ({
    label: "Call",
    value: p.display,
    href: p.href,
    external: false,
  })),
  {
    label: "Email",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    external: false,
  },
];

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(q("[data-row]"), {
          y: 24,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1,
          scrollTrigger: {
            trigger: q("[data-rows]")[0],
            start: "top 85%",
            once: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="contact"
      ref={root}
      aria-labelledby="contact-title"
      className="overflow-clip bg-marigold pt-20 sm:pt-24 lg:pt-28"
    >
      <div className="mx-auto max-w-[90rem] px-4 sm:px-8">
        <p className="mb-5 text-sm font-semibold tracking-wide uppercase">
          Contact
        </p>
        <RevealHeading
          id="contact-title"
          className="max-w-[13ch] font-display text-[clamp(3.5rem,10vw,10rem)] uppercase"
        >
          Let&rsquo;s talk about your plan
        </RevealHeading>

        <div className="mt-12 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 lg:border-t lg:border-ink lg:pt-[2.65rem]">
            <p className="max-w-[34ch] text-lg leading-relaxed text-ink/80">
              The first conversation is free. Tell me what you&rsquo;re planning
              for and I&rsquo;ll reply the same day.
            </p>
            <Button
              href={whatsappLink(HELLO)}
              external
              size="lg"
              className="mt-8"
            >
              Message on WhatsApp
            </Button>
          </div>

          <div className="lg:col-span-8">
            {/* Every way to reach him as a big row. Hover: the briefing band sweeps across. */}
            <ul data-rows className="border-t border-ink">
              {rows.map((r) => (
                <li
                  key={`${r.label}-${r.value}`}
                  data-row
                  className="border-b border-ink/20"
                >
                  <a
                    href={r.href}
                    {...(r.external
                      ? { target: "_blank", rel: "noopener" }
                      : {})}
                    className="group relative grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4 transition-colors duration-300 hover:text-marigold focus-visible:text-marigold sm:grid-cols-[8rem_1fr_auto] sm:py-5"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-right scale-x-0 bg-ink transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
                    />
                    <span className="relative text-sm font-semibold tracking-wide uppercase transition-transform duration-500 ease-out-expo group-hover:translate-x-4 group-focus-visible:translate-x-4">
                      {r.label}
                    </span>
                    <span className={`relative ${value} break-words tabular`}>
                      {/* If an address has to wrap, let it break cleanly after the @. */}
                      {r.value.includes("@") ? (
                        <>
                          {r.value.split("@")[0]}@<wbr />
                          {r.value.split("@")[1]}
                        </>
                      ) : (
                        r.value
                      )}
                    </span>
                    <svg
                      viewBox="0 0 16 16"
                      className="relative mr-1 size-5 transition-transform duration-500 ease-out-expo group-hover:-translate-x-3 group-hover:-translate-y-0.5 sm:size-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        d="M4 12 12 4M5.5 4H12v6.5"
                        strokeLinecap="square"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

            {/* His socials, lined up under the rows' labels. */}
            <div
              data-row
              className="grid grid-cols-[5.5rem_1fr] items-center gap-4 py-4 sm:grid-cols-[8rem_1fr] sm:py-5"
            >
              <p className="text-sm font-semibold tracking-wide uppercase">
                Follow
              </p>
              <ul className="-ml-2 flex flex-col items-start sm:flex-row sm:flex-wrap sm:gap-x-2">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener"
                      className={`group relative inline-flex items-center gap-2 px-2 py-1 ${value} transition-colors duration-300 hover:text-marigold focus-visible:text-marigold`}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 origin-right scale-x-0 bg-ink transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
                      />
                      <span className="relative">{s.label}</span>
                      <svg
                        viewBox="0 0 16 16"
                        className="relative size-4 sm:size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          d="M4 12 12 4M5.5 4H12v6.5"
                          strokeLinecap="square"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Office hours close the list: same label and type, not a link. */}
            <div
              data-row
              className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 border-t border-ink/20 py-4 sm:grid-cols-[8rem_1fr_auto] sm:py-5"
            >
              <p className="text-sm font-semibold tracking-wide uppercase">
                Hours
              </p>
              <p className={`${value} tabular`}>{site.contact.hours}</p>
              <p className="mr-1 text-right text-xs font-semibold tracking-wide text-ink/60 uppercase sm:text-sm">
                {site.city}, IST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The jet comes in to land as the runway scrolls into view. */}
      <div className="mt-16 lg:mt-20">
        <Landing />
      </div>
    </section>
  );
}
