"use client";

import { site, whatsappLink } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { bandHandlers, bandOrigin } from "@/lib/band";
import { JetLanding } from "./JetLanding";
import { Headline } from "@/components/ui/Headline";

// The size every contact detail is set in: numbers, email, socials and hours.
const value = "font-display text-[clamp(1.25rem,2.4vw,2rem)] uppercase";

const HELLO = "Hi Raghav, I'd like to talk about my finances.";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      // Clipped to cut the bottom-right corner over the footer, with room above the top edge
      // for the shadow it casts on the section above (see notch, globals.css).
      className="notch overflow-x-clip bg-marigold [--notch:var(--color-foundation)] [--edge-shade:var(--edge-shade-mid)] [clip-path:polygon(0_calc(-1*var(--notch-lift)),100%_calc(-1*var(--notch-lift)),100%_calc(100%-var(--notch-size)),calc(100%-var(--notch-size))_100%,0_100%)] pt-20 sm:pt-24 lg:pt-28"
    >
      <div className="mx-auto max-w-360 px-4 sm:px-8">
        <p data-scramble className="mb-5 text-sm font-semibold tracking-wide uppercase">
          Contact
        </p>
        <Headline id="contact-title" className="max-w-[13ch] font-display text-[clamp(3.5rem,10vw,10rem)] uppercase">
          Let&rsquo;s talk about your plan
        </Headline>

        <div className="mt-12 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          {/* Ruled like the list beside it (desktop): the rule draws in, then the copy follows. */}
          <div data-lines className="lg:col-span-5 xl:col-span-4">
            <div data-lined className="relative lg:pt-[2.65rem]">
              <span
                data-line
                aria-hidden
                className="absolute inset-x-0 top-0 hidden h-px origin-left bg-ink lg:block"
              />
              <p className="max-w-[34ch] text-lg leading-relaxed text-ink/80">
                The first conversation is free. Tell me what you&rsquo;re planning for and I&rsquo;ll reply the same
                day.
              </p>
              {/* Wrapped, so its entrance and the button's own pointer drift don't share a transform. */}
              <div className="mt-8">
                <Button href={whatsappLink(HELLO)} external size="lg">
                  Message on WhatsApp
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            {/* Every way to reach him, one row per kind: a small label, then each detail as
                its own link in the large type. Hover: the briefing band sweeps across the
                link you're on, not the whole row. On arrival the rules draw in one after
                another, each row's details just behind its rule. */}
            <div data-lines>
              <div data-lined className="relative h-px">
                <span data-line aria-hidden className="absolute inset-0 origin-left bg-ink" />
              </div>
              <ul>
                <Row label="Call">
                  <Links>
                    {site.contact.phones.map((p) => (
                      <DetailLink key={p.href} href={p.href}>
                        <span className="tabular">{p.display}</span>
                      </DetailLink>
                    ))}
                  </Links>
                </Row>
                <Row label="Email">
                  <Links>
                    <DetailLink href={`mailto:${site.contact.email}`}>
                      {/* If the address has to wrap, let it break cleanly after the @. */}
                      {site.contact.email.split("@")[0]}@<wbr />
                      {site.contact.email.split("@")[1]}
                    </DetailLink>
                  </Links>
                </Row>
                <Row label="Follow">
                  <Links>
                    {site.socials.map((s) => (
                      <DetailLink key={s.label} href={s.href} external>
                        {s.label}
                      </DetailLink>
                    ))}
                  </Links>
                </Row>
                {/* Office hours close the list: same label and type, not a link. */}
                <Row
                  label="Hours"
                  aside={
                    // The time zone as a small plate, trimmed like the buttons.
                    <span className="mr-1 bg-ink px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.12em] whitespace-nowrap text-marigold uppercase [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] sm:text-xs">
                      <span className="hidden sm:inline">{site.city} · </span>IST
                    </span>
                  }
                >
                  <p className={`${value} tabular`}>
                    <span className="inline-block whitespace-nowrap">
                      <span className="sm:hidden">{site.contact.days.short}</span>
                      <span className="hidden sm:inline">{site.contact.days.long}</span>
                      <span className="mx-2 text-ink/40">·</span>
                    </span>
                    <span className="inline-block whitespace-nowrap">{site.contact.hours}</span>
                  </p>
                </Row>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* The jet comes in to land as the runway scrolls into view. */}
      <div className="mt-16 lg:mt-20">
        <JetLanding />
      </div>
    </section>
  );
}

// One row of the contact list: a small label, its details, and an optional aside on the right.
function Row({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <li
      data-lined
      className="relative grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[8rem_1fr_auto] sm:py-5"
    >
      <span data-line aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-ink/20" />
      <p className="text-sm font-semibold tracking-wide uppercase">{label}</p>
      <div className="min-w-0">{children}</div>
      {aside ?? <span />}
    </li>
  );
}

// Several details in one row: side by side, stacked on phones. The negative margin lines
// the text (not the hover band's padding) up with the other rows.
function Links({ children }: { children: React.ReactNode }) {
  return <div className="-ml-2 flex flex-col items-start sm:flex-row sm:flex-wrap sm:gap-x-4">{children}</div>;
}

// A detail as a link in the large type. Hover: an ink band sweeps in behind just this link
// from the side the pointer came in on (and out the side it leaves by), the text turns
// marigold, and the small arrow nudges out.
function DetailLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      {...bandHandlers}
      className={`group relative inline-flex max-w-full items-center gap-2 px-2 py-1 ${value} transition-colors duration-300 hover:text-marigold focus-visible:text-marigold`}
    >
      <span
        aria-hidden
        className={`absolute inset-0 scale-x-0 bg-ink transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${bandOrigin}`}
      />
      <span className="relative min-w-0 wrap-break-word">{children}</span>
      <svg
        viewBox="0 0 16 16"
        className="relative size-4 shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path d="M4 12 12 4M5.5 4H12v6.5" strokeLinecap="square" />
      </svg>
    </a>
  );
}
