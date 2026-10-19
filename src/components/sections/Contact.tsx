"use client";

import { site, whatsappLink } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { WhatsAppQR } from "@/components/ui/WhatsAppQR";
import { bandHandlers, bandOrigin } from "@/lib/band";
import { JetLanding } from "./JetLanding";
import { Headline } from "@/components/ui/Headline";

const value = "font-display text-[clamp(1.25rem,2.4vw,2rem)] uppercase";

const HELLO = "Hi Raghav, I'd like to talk about my finances.";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      // Cuts the bottom-right corner over the footer; extends above the top for the edge shadow.
      className="notch overflow-x-clip bg-marigold [--notch:var(--color-foundation)] [--edge-shade:var(--edge-shade-mid)] [clip-path:polygon(0_calc(-1*var(--notch-lift)),100%_calc(-1*var(--notch-lift)),100%_calc(100%-var(--notch-size)),calc(100%-var(--notch-size))_100%,0_100%)] pt-20 sm:pt-24 lg:pt-28"
    >
      <div className="mx-auto max-w-360 px-4 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-8 xl:col-span-9">
            <p data-scramble className="mb-5 text-sm font-semibold tracking-wide uppercase">
              Contact
            </p>
            <Headline
              id="contact-title"
              className="max-w-[13ch] font-display text-[clamp(3.5rem,10vw,10rem)] uppercase"
            >
              Let&rsquo;s talk about your plan
            </Headline>
            <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-ink/80">
              Reserve a free, no-obligation 30-minute {site.session.name.toLowerCase()}, online at a time that suits
              you. We&rsquo;ll go through:
            </p>
            <ul data-lines className="mt-6 grid max-w-3xl gap-x-8 gap-y-4 sm:grid-cols-3">
              {site.session.covers.map((c) => (
                <li key={c.title} data-lined className="relative pt-3">
                  <span data-line aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-ink" />
                  <p className="font-display text-xl uppercase">{c.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{c.detail}</p>
                </li>
              ))}
            </ul>
            {/* Wrapped, so the entrance and the buttons' pointer drift don't share a transform. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href={site.contact.booking.href} external size="lg">
                {site.contact.booking.label}
              </Button>
              <WhatsAppButton message={HELLO} size="lg" variant="outline">
                Message on WhatsApp
              </WhatsAppButton>
            </div>
          </div>

          {/* Desktop only; phones have the WhatsApp button. */}
          <figure className="hidden w-44 lg:col-span-4 lg:block lg:justify-self-end xl:col-span-3">
            <WhatsAppQR href={whatsappLink()} quiet={0} className="block w-full" />
            <figcaption className="mt-5 text-center">
              <span className="block text-sm font-semibold tracking-wide uppercase">Scan to WhatsApp</span>
              <span className="mt-1 block font-display text-2xl uppercase tabular">
                {site.contact.phones[0].display}
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Departure board. The labels scramble in like split-flap letters (Cuts). */}
        <div className="mt-14 bg-ink px-5 pt-2 pb-3 text-marigold [clip-path:polygon(0_0,calc(100%-24px)_0,100%_24px,100%_100%,0_100%)] sm:px-8 sm:pt-4 sm:pb-5 lg:mt-16">
          <div data-lines>
            <div
              data-lined
              className="relative hidden grid-cols-[8rem_1fr_minmax(10rem,auto)] gap-x-6 py-3 text-xs font-semibold tracking-[0.14em] text-marigold/60 uppercase md:grid"
            >
              <span data-line aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-marigold/40" />
              <span>Via</span>
              <span>Details</span>
              <span className="text-right">When</span>
            </div>
            <ul>
              <Row via="Book" when={<>30 min · Online</>}>
                <Links>
                  <DetailLink href={site.contact.booking.href} external>
                    {site.session.name}
                  </DetailLink>
                </Links>
              </Row>
              <Row via="Call" when={site.contact.days.short}>
                <Links>
                  {site.contact.phones.map((p) => (
                    <DetailLink key={p.href} href={p.href}>
                      <span className="tabular">{p.display}</span>
                    </DetailLink>
                  ))}
                </Links>
              </Row>
              <Row via="Email" when="Same-day reply">
                <Links>
                  <DetailLink href={`mailto:${site.contact.email}`}>
                    {/* Break after the @ if it has to wrap. */}
                    {site.contact.email.split("@")[0]}@<wbr />
                    {site.contact.email.split("@")[1]}
                  </DetailLink>
                </Links>
              </Row>
              <Row via="Follow" when="Anytime">
                <Links>
                  {site.socials.map((s) => (
                    <DetailLink key={s.label} href={s.href} external>
                      {s.label}
                    </DetailLink>
                  ))}
                </Links>
              </Row>
              <Row via="Hours" when={`${site.city} · IST`}>
                <p className={`${value} tabular`}>
                  <span className="inline-block whitespace-nowrap">
                    <span className="sm:hidden">{site.contact.days.short}</span>
                    <span className="hidden sm:inline">{site.contact.days.long}</span>
                    <span className="mx-2 text-marigold/40">·</span>
                  </span>
                  <span className="inline-block whitespace-nowrap">{site.contact.hours}</span>
                </p>
              </Row>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 lg:mt-20">
        <JetLanding />
      </div>
    </section>
  );
}

// On phones, Via and When share the first line, with the details below.
function Row({ via, when, children }: { via: string; when: React.ReactNode; children: React.ReactNode }) {
  return (
    <li
      data-lined
      className="relative grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-4 md:grid-cols-[8rem_1fr_minmax(10rem,auto)] md:py-5"
    >
      <span data-line aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-marigold/20" />
      <p data-scramble className="text-sm font-semibold tracking-[0.12em] uppercase">
        {via}
      </p>
      <div className="col-span-2 min-w-0 md:order-none md:col-span-1 max-md:order-last">{children}</div>
      <p
        data-scramble
        className="text-right text-xs font-semibold tracking-[0.12em] text-marigold/80 uppercase tabular"
      >
        {when}
      </p>
    </li>
  );
}

// The negative margin aligns the text (not the hover band's padding) with the other rows.
function Links({ children }: { children: React.ReactNode }) {
  return <div className="-ml-2 flex flex-col items-start sm:flex-row sm:flex-wrap sm:gap-x-4">{children}</div>;
}

function DetailLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      {...bandHandlers}
      className={`group relative inline-flex max-w-full items-center gap-2 px-2 py-1 ${value} transition-colors duration-300 hover:text-ink focus-visible:text-ink`}
    >
      <span
        aria-hidden
        className={`absolute inset-0 scale-x-0 bg-marigold transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${bandOrigin}`}
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
