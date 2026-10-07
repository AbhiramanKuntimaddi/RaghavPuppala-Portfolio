import Link from "next/link";
import { site, whatsappLink } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { Headline } from "@/components/ui/Headline";
import { HoldingPattern } from "@/components/ui/HoldingPattern";

// The 404 page, for any address the site doesn't have. Marigold like the hero, with the
// trimmed ink corner, the RP badge back to the homepage, and the jet circling a holding
// pattern beside a way back on course.
export default function NotFound() {
  return (
    <>
      {/* The 404 page can't export metadata, so its tab title is set on the page. */}
      <DocumentTitle title={`Page not found · ${site.name}`} />
      <main className="relative flex min-h-dvh flex-col overflow-clip bg-marigold text-ink">
        {/* The site's trimmed top-right corner, in ink (as on the preloader). */}
        <span
          aria-hidden
          className="absolute top-0 right-0 z-10 size-(--notch-size) bg-ink [clip-path:polygon(0_0,100%_0,100%_100%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-360 px-4 pt-6 sm:px-8 lg:pt-8">
          <Link href="/" aria-label={`${site.name}, home`} className="inline-flex items-center gap-2.5">
            <span className="grid size-9 place-items-center bg-ink text-[0.95rem] font-extrabold tracking-[0.02em] text-marigold uppercase [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] font-stretch-72% lg:size-10">
              RP
            </span>
            <span className="text-[0.95rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase font-condensed sm:text-lg">
              {site.name}
            </span>
          </Link>
        </div>

        <section
          aria-labelledby="not-found-title"
          className="relative z-10 mx-auto grid w-full max-w-360 flex-1 content-center items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8"
        >
          <div className="lg:col-span-7">
            <p className="mb-5 text-sm font-semibold tracking-wide uppercase">Error 404</p>
            <Headline
              as="h1"
              id="not-found-title"
              className="max-w-[12ch] font-display text-[clamp(3.5rem,10vw,9rem)] uppercase"
            >
              Off the flight plan.
            </Headline>
            <p className="mt-8 max-w-[38ch] text-lg leading-relaxed text-ink/80">
              This page doesn&rsquo;t exist, or it has moved. Let&rsquo;s get you back on course.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/">Back to the homepage</Button>
              <Button href={whatsappLink("Hi Raghav, I'd like to talk about my finances.")} external variant="outline">
                Message on WhatsApp
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HoldingPattern className="mx-auto w-full max-w-md" />
            <p className="mt-4 text-center text-xs font-semibold tracking-[0.14em] text-ink/60 uppercase">
              Holding pattern · awaiting a valid address
            </p>
          </div>
        </section>

        {/* The error code, too big for the page, faint behind everything and off the bottom edge. */}
        <p
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 translate-y-[18%] font-display text-[32vw] leading-[0.8] text-ink/[0.06] select-none lg:text-[24vw]"
        >
          404
        </p>
      </main>
    </>
  );
}
