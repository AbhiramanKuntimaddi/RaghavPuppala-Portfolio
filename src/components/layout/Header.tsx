"use client";

import { useLenis } from "lenis/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { site, whatsappLink } from "@/content/site";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { bandHandlers, bandOrigin } from "@/lib/band";
import { scrollToSection } from "@/lib/navigate";
import { Button } from "@/components/ui/Button";
import { JetIcon } from "@/components/ui/Jet";

// Scrollspy: the section crossing a line just above the middle of the screen. A pinned
// section is measured by its pin spacer, which spans the whole held stretch of scroll.
function sectionAt(line: number) {
  for (const { id } of nav) {
    const el = document.getElementById(id);
    if (!el) continue;
    const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
    const r = box.getBoundingClientRect();
    if (r.top <= line && r.bottom > line) return id;
  }
  return null;
}

type Tone = "ink" | "paper" | null;

// Which colour the page wants the header in right under it: the nearest ancestor with
// data-header-tone of whatever sits behind the header's middle (ignoring the header).
// Desktop only: there those sections hold still while the header is over them. On
// smaller screens they scroll freely, so text would slide under a see-through header;
// the cream panel stays instead.
function toneUnder(header: HTMLElement | null): Tone {
  if (window.innerWidth < 1024) return null;
  for (const el of document.elementsFromPoint(window.innerWidth / 2, 40)) {
    if (header?.contains(el)) continue;
    const t = el.closest("[data-header-tone]")?.getAttribute("data-header-tone");
    return t === "ink" || t === "paper" ? t : null;
  }
  return null;
}

// How long the header stays after you stop scrolling up, before it tucks away again.
const IDLE_HIDE_MS = 1500;

// `about` is the one-line summary shown under each section in the mobile menu.
const nav = [
  { id: "wealth", label: "Wealth", about: "Investments, insurance, retirement" },
  { id: "process", label: "How it works", about: "Brief, plan, review" },
  { id: "calculator", label: "Calculator", about: "See what a SIP grows into" },
  { id: "ventures", label: "Ventures", about: "AdsXcell, SP Design Studio, HridaySpandana" },
  { id: "contact", label: "Contact", about: "Call, email, WhatsApp" },
];

// Transparent over the marigold hero, a floating cream panel once scrolled, with a
// centered nav and a short ink bar sliding under the section you're in.
export function Header() {
  const root = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // Over full-colour panels the header drops its cream panel and takes the panel's
  // text colour instead ("ink" or "paper"); null means the normal behaviour.
  const [tone, setTone] = useState<Tone>(null);
  const lenis = useLenis();

  // Visibility: hidden while scrolling down past the hero, shown while scrolling up,
  // then tucked away again once scrolling has paused, unless the header is being
  // used (pointer over it, keyboard focus inside it, menu open) or we're at the top.
  const engaged = useRef(false);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scheduleHide = useCallback(() => {
    clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      if (window.scrollY > 400 && !engaged.current && !openRef.current) setHidden(true);
    }, IDLE_HIDE_MS);
  }, []);
  // Closing the menu mid-page starts the countdown too.
  useEffect(() => {
    if (!open) scheduleHide();
  }, [open, scheduleHide]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      setActive(sectionAt(window.innerHeight * 0.45));
      setTone(toneUnder(root.current));
      if (y <= 400) setHidden(false);
      else if (y > last) setHidden(true);
      else {
        setHidden(false);
        scheduleHide();
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle.current);
    };
  }, [scheduleHide]);

  const engage = () => {
    engaged.current = true;
    clearTimeout(idle.current);
  };
  const disengage = () => {
    engaged.current = false;
    scheduleHide();
  };

  // Entry: the bar drops in from above, then its contents settle one after another,
  // timed to land with the hero intro. data-reveal keeps it hidden until then.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap
          .timeline({ delay: 0.15 })
          .set(root.current, { visibility: "visible" })
          .from(root.current, { yPercent: -100, duration: 1, ease: "expo.out" })
          .from("[data-header-item]", { y: -14, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.25);
      });
    },
    { scope: root },
  );

  // Exit on scroll down, re-entry on scroll up. Leaving is quick and accelerating;
  // coming back decelerates, and the contents ripple in behind the bar.
  const shown = useRef(true);
  useGSAP(
    () => {
      const show = !hidden || open;
      if (show === shown.current) return;
      shown.current = show;
      const motion = window.matchMedia(MOTION_OK).matches;
      if (show) {
        gsap.to(root.current, { yPercent: 0, duration: motion ? 0.8 : 0, ease: "expo.out", overwrite: "auto" });
        if (motion) {
          gsap.fromTo(
            "[data-header-item]",
            { y: -10, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, delay: 0.08, ease: "expo.out", overwrite: "auto" },
          );
        }
      } else {
        gsap.to(root.current, { yPercent: -100, duration: motion ? 0.5 : 0, ease: "power3.in", overwrite: "auto" });
      }
    },
    { dependencies: [hidden, open], scope: root },
  );

  // Menu: lock the page behind it, close on Escape, return focus to the toggle.
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open, lenis]);

  // Close the menu if the viewport grows into the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const close = () => mq.matches && setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const go = useCallback(
    (id: string) => () => {
      setOpen(false);
      // Wait a frame so the menu's cleanup has restarted Lenis before scrolling.
      requestAnimationFrame(() => scrollToSection(id, lenis));
    },
    [lenis],
  );

  // Once scrolled (or with the menu open) the header floats as an inset cream panel.
  // With the menu open the header sits straight on its ink sheet: no cream panel, cream type.
  const solidBar = solid && !open;
  const blend: Tone = open ? "paper" : tone;

  return (
    <>
      <header
        ref={root}
        data-reveal
        onPointerEnter={engage}
        onPointerLeave={disengage}
        onFocus={engage}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && disengage()}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${blend === "paper" ? "text-paper" : "text-ink"}`}
      >
        <div className="relative mx-auto max-w-360 px-2 sm:px-4">
          {/* The floating panel: notched like the buttons, a hairline edge and a soft
              shadow. Fades and settles into place. */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-2 inset-y-2 drop-shadow-[0_12px_28px_oklch(0.2_0.02_55/0.16)] transition-[opacity,translate] duration-500 ease-out-expo sm:inset-x-4 ${
              solidBar && !blend ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            }`}
          >
            <span className="absolute inset-0 bg-ink/15 [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]" />
            <span className="absolute inset-px bg-paper [clip-path:polygon(0_0,calc(100%-13.5px)_0,100%_13.5px,100%_100%,0_100%)]" />
          </span>

          <div className="relative grid h-16 grid-cols-[1fr_auto] items-center gap-4 px-2 sm:px-4 lg:h-20 xl:grid-cols-[1fr_auto_1fr] xl:gap-8">
            <button
              type="button"
              onClick={go("top")}
              data-header-item
              className="group flex cursor-pointer items-center gap-2.5 justify-self-start"
              aria-label={`${site.name}, back to top`}
            >
              <Monogram onDark={blend === "paper"} />
              <span className="text-[0.95rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase font-condensed max-[374px]:text-[0.8rem] max-[374px]:tracking-[0.03em] sm:text-lg">
                Raghav Puppala
              </span>
            </button>

            <DesktopNav active={active} onDark={blend === "paper"} go={go} />

            <div className="flex items-center gap-2 justify-self-end sm:gap-3">
              <span data-header-item className="flex">
                <Button
                  href={site.contact.demat}
                  external
                  size="sm"
                  variant={blend === "paper" ? "marigold" : solidBar && !blend ? "ink-on-paper" : "header"}
                  shortLabel="Free Demat"
                  compactOnMobile
                >
                  Open a free Demat account
                </Button>
              </span>
              <button
                ref={toggleRef}
                type="button"
                aria-expanded={open}
                aria-controls="site-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
                data-header-item
                className="group relative grid size-10 place-items-center xl:hidden"
              >
                <span aria-hidden className="relative block h-3 w-6">
                  <span
                    className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-500 ease-out-expo ${
                      open ? "top-1.25 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-0.5 bg-current transition-[transform,width] duration-500 ease-out-expo ${
                      open ? "top-1.25 w-6 -rotate-45" : "top-2.5 w-4 group-hover:w-6"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Outside the header: the header slides with a transform, which would trap a fixed child inside it. */}
      <MobileMenu open={open} active={active} go={go} firstLinkRef={firstLinkRef} />
    </>
  );
}

// On hover the letters lift out of the badge and a jet climbs in to take their place.
function Monogram({ onDark }: { onDark: boolean }) {
  const move = "transition-transform duration-500 ease-out-expo";
  return (
    <span
      aria-hidden
      className={`relative grid size-9 place-items-center overflow-clip text-[0.95rem] font-extrabold tracking-[0.02em] uppercase transition-colors duration-500 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] font-stretch-72% lg:size-10 ${
        onDark ? "bg-marigold text-ink" : "bg-ink text-marigold"
      }`}
    >
      <span className={`${move} group-hover:translate-y-[-150%] group-focus-visible:translate-y-[-150%]`}>RP</span>
      <span
        className={`absolute inset-0 grid translate-y-full place-items-center ${move} group-hover:translate-y-0 group-focus-visible:translate-y-0`}
      >
        <JetIcon className="size-5 -rotate-90" />
      </span>
    </span>
  );
}

function DesktopNav({
  active,
  onDark,
  go,
}: {
  active: string | null;
  onDark: boolean;
  go: (id: string) => () => void;
}) {
  const list = useRef<HTMLUListElement>(null);
  const plate = useRef<HTMLSpanElement>(null);
  const shown = useRef<string | null>(null);

  // The active section sits on a notched plate in the header's own colour (ink on cream and
  // marigold, cream over dark sections), like the credential plates; its label reverses out.
  // The plate glides between sections, and the newly active label decodes like the eyebrows.
  useLayoutEffect(() => {
    const el = plate.current;
    const link = active ? list.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`) : null;
    if (!el) return;
    // Each move replaces any still running, so a quick show-then-hide (as the scrollspy
    // settles while the page loads) can't leave the plate showing.
    if (!link) {
      gsap.to(el, { autoAlpha: 0, duration: 0.3, overwrite: true });
      shown.current = null;
      return;
    }
    const to = { x: link.offsetLeft + 4, width: link.offsetWidth - 8 };
    const motion = window.matchMedia(MOTION_OK).matches;
    const visible = Number(gsap.getProperty(el, "autoAlpha"));
    if (!visible || !motion) gsap.set(el, to);
    gsap.to(el, { ...to, autoAlpha: 1, duration: motion ? 0.7 : 0, ease: "expo.out", overwrite: true });

    const label = link.querySelector<HTMLElement>("[data-label]");
    const item = nav.find((n) => n.id === active);
    if (motion && label && item && shown.current && shown.current !== active)
      gsap.to(label, {
        duration: 0.6,
        ease: "none",
        overwrite: true,
        scrambleText: { text: item.label, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.7 },
      });
    shown.current = active;
  }, [active]);

  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul ref={list} className="relative flex items-center">
        <span
          ref={plate}
          aria-hidden
          className="invisible absolute inset-y-1.5 left-0 w-0 bg-current opacity-0 [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
        />
        {nav.map((item) => {
          const current = active === item.id;
          // Inherit the header's colour, so links read on cream, marigold and dark panels alike;
          // the active one reverses out of its plate.
          const tone = current
            ? `${onDark ? "text-ink" : "text-paper"} hover:text-marigold focus-visible:text-marigold`
            : "text-current/60 hover:text-marigold focus-visible:text-marigold";
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={go(item.id)}
                {...bandHandlers}
                data-nav={item.id}
                aria-current={current ? "location" : undefined}
                className={`group relative block cursor-pointer px-4 py-3 text-base font-bold tracking-[0.07em] uppercase transition-colors duration-300 font-condensed ${tone}`}
              >
                <BriefingBand />
                <span data-label className="relative">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Hover/focus: an ink bar sweeps in behind the link, like a line highlighted in a mission
// brief, and the text turns marigold. It follows the pointer: in from the side it entered
// on, out toward the side it left by (see lib/band).
function BriefingBand() {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-1 inset-y-1.5 scale-x-0 bg-ink transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${bandOrigin}`}
    />
  );
}

function MobileMenu({
  open,
  active,
  go,
  firstLinkRef,
}: {
  open: boolean;
  active: string | null;
  go: (id: string) => () => void;
  firstLinkRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // Opening: the ink sheet drops down, then the ruled list draws in row by row (each rule
  // left to right, its row rising just behind it), then the buttons and hours. Closing
  // runs it back: the rows lift away, then the sheet rises.
  useGSAP(
    () => {
      const el = panel.current!;
      const q = gsap.utils.selector(el);
      const motion = window.matchMedia(MOTION_OK).matches;
      const lines = q("[data-menu-line]");
      const content = q("[data-menu-row] > :not([data-menu-line]), [data-menu-eyebrow]");
      const foot = q("[data-menu-foot]");

      if (open) {
        gsap.set(el, { visibility: "visible" });
        if (!motion) {
          gsap.set(el, { yPercent: 0 });
          gsap.set([...lines, ...content, ...foot], { clearProps: "all" });
          return;
        }
        gsap
          .timeline()
          .fromTo(el, { yPercent: -101 }, { yPercent: 0, duration: 0.8, ease: "draw" })
          .fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.08, ease: "draw" }, 0.35)
          .fromTo(content, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05 }, 0.45)
          .fromTo(foot, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.8);
      } else if (el.style.visibility === "visible") {
        if (!motion) {
          gsap.set(el, { visibility: "hidden" });
          return;
        }
        gsap
          .timeline({ onComplete: () => void gsap.set(el, { visibility: "hidden" }) })
          .to(foot, { autoAlpha: 0, duration: 0.25 })
          .to([...content].reverse(), { y: -10, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0)
          .to(el, { yPercent: -101, duration: 0.65, ease: "draw" }, 0.3);
      }
    },
    { dependencies: [open], scope: panel },
  );

  return (
    <div
      ref={panel}
      id="site-menu"
      aria-hidden={!open}
      inert={!open}
      data-lenis-prevent
      // The bottom-right corner is trimmed like the buttons; it shows as the sheet moves.
      className="invisible fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-4 pt-24 pb-8 text-paper [clip-path:polygon(0_0,100%_0,100%_calc(100%-40px),calc(100%-40px)_100%,0_100%)] sm:px-8 lg:pt-28 xl:hidden"
    >
      <nav aria-label="Menu">
        <p data-menu-eyebrow className="mb-3 text-xs font-semibold tracking-wide text-paper/60 uppercase">
          Menu
        </p>
        <ul>
          <li aria-hidden className="relative h-px">
            <span data-menu-line className="absolute inset-0 origin-left bg-paper" />
          </li>
          {nav.map((item, i) => {
            const current = active === item.id;
            return (
              <li key={item.id} data-menu-row className="relative">
                <span data-menu-line aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-paper/15" />
                <button
                  type="button"
                  ref={i === 0 ? firstLinkRef : undefined}
                  onClick={go(item.id)}
                  aria-current={current ? "location" : undefined}
                  className="group flex w-full cursor-pointer items-center gap-3 py-3.5 text-left sm:py-4"
                >
                  {/* The section you're in: a marigold bar, and its name in marigold. */}
                  {current && <span aria-hidden className="w-1 self-stretch bg-marigold" />}
                  <span
                    className={`font-display text-[clamp(2rem,9vw,3.5rem)] uppercase transition-colors duration-300 group-hover:text-marigold group-focus-visible:text-marigold ${
                      current ? "text-marigold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="ml-auto max-w-[45%] text-right text-xs text-paper/50 sm:text-sm">{item.about}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div data-menu-foot className="mt-auto pt-10">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
          <Button href={whatsappLink("Hi Raghav, I'd like to talk about my finances.")} external variant="marigold">
            Message on WhatsApp
          </Button>
          <Button href={site.contact.phones[0].href} variant="outline-on-ink">
            {`Call ${site.contact.phones[0].display}`}
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-paper/70">
          <span>
            {site.contact.days.short} · {site.contact.hours}
          </span>
          <span className="bg-marigold px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.12em] whitespace-nowrap text-ink uppercase [clip-path:polygon(0_0,calc(100%-7px)_0,100%_7px,100%_100%,0_100%)]">
            {site.city} · IST
          </span>
        </div>
      </div>
    </div>
  );
}
