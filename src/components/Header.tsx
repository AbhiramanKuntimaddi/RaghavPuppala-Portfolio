"use client";

import { useLenis } from "lenis/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { site, whatsappLink } from "@/content/site";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrollToSection } from "@/lib/navigate";
import { Button } from "./Button";
import { JetIcon } from "./Jet";


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


const nav = [
  { id: "wealth", label: "Wealth" },
  { id: "process", label: "How it works" },
  { id: "calculator", label: "Calculator" },
  { id: "ventures", label: "Ventures" },
  { id: "contact", label: "Contact" },
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
  const solidBar = solid || open;
  const blend = open ? null : tone;

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
        <div className="relative mx-auto max-w-[90rem] px-2 sm:px-4">
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
              <span className="text-[0.95rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase [font-stretch:82%] sm:text-lg">
                Raghav Puppala
              </span>
            </button>

            <DesktopNav active={active} go={go} />

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
                      open ? "top-[5px] rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-0.5 bg-current transition-[transform,width] duration-500 ease-out-expo ${
                      open ? "top-[5px] w-6 -rotate-45" : "top-[10px] w-4 group-hover:w-6"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Outside the header: the header slides with a transform, which would trap a fixed child inside it. */}
      <MobileMenu open={open} go={go} firstLinkRef={firstLinkRef} />
    </>
  );
}

// On hover the letters lift out of the badge and a jet climbs in to take their place.
function Monogram({ onDark }: { onDark: boolean }) {
  const move = "transition-transform duration-500 ease-out-expo";
  return (
    <span
      aria-hidden
      className={`relative grid size-9 place-items-center overflow-clip text-[0.95rem] font-extrabold tracking-[0.02em] uppercase transition-colors duration-500 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] [font-stretch:72%] lg:size-10 ${
        onDark ? "bg-marigold text-ink" : "bg-ink text-marigold"
      }`}
    >
      <span className={`${move} group-hover:-translate-y-[150%] group-focus-visible:-translate-y-[150%]`}>RP</span>
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
  go,
}: {
  active: string | null;
  go: (id: string) => () => void;
}) {
  const list = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  // Slide the bar under the active link's label and stretch it to the label's width
  // (a 100px element scaled, so only transforms animate). Fade it when nothing is active.
  useLayoutEffect(() => {
    const link = active ? list.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`) : null;
    if (!bar.current) return;
    if (!link) {
      gsap.to(bar.current, { autoAlpha: 0, duration: 0.3 });
      return;
    }
    const label = link.querySelector<HTMLElement>("[data-label]")!;
    const to = { x: link.offsetLeft + label.offsetLeft, scaleX: label.offsetWidth / 100 };
    const motion = window.matchMedia(MOTION_OK).matches;
    const visible = Number(gsap.getProperty(bar.current, "autoAlpha"));
    if (!visible || !motion) gsap.set(bar.current, to);
    gsap.to(bar.current, { ...to, autoAlpha: 1, duration: motion ? 0.7 : 0, ease: "expo.out" });
  }, [active]);

  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul ref={list} className="relative flex items-center">
        {nav.map((item) => {
          const current = active === item.id;
          // Inherit the header's colour, so links read on cream, marigold and dark panels alike.
          const tone = current
            ? "text-current hover:text-marigold focus-visible:text-marigold"
            : "text-current/70 hover:text-marigold focus-visible:text-marigold";
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={go(item.id)}
                data-nav={item.id}
                aria-current={current ? "location" : undefined}
                className={`group relative block cursor-pointer px-4 py-3 text-base font-bold tracking-[0.07em] uppercase transition-colors duration-300 [font-stretch:82%] ${tone}`}
              >
                <BriefingBand />
                <span data-label className="relative">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
        <span
          ref={bar}
          aria-hidden
          className="invisible absolute bottom-1 left-0 h-0.5 w-[100px] origin-left bg-current opacity-0"
        />
      </ul>
    </nav>
  );
}

// Hover/focus: an ink bar sweeps in behind the link from the left, like a line
// highlighted in a mission brief, and the text turns marigold. On leave the bar
// keeps going and exits to the right (the transform origin flips with hover).
function BriefingBand() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-1 inset-y-1.5 origin-right scale-x-0 bg-ink transition-transform duration-500 ease-out-expo [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
    />
  );
}

function MobileMenu({
  open,
  go,
  firstLinkRef,
}: {
  open: boolean;
  go: (id: string) => () => void;
  firstLinkRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = panel.current!;
      const motion = window.matchMedia(MOTION_OK).matches;
      if (open) {
        gsap.set(el, { visibility: "visible" });
        if (!motion) {
          gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
          return;
        }
        gsap
          .timeline()
          .fromTo(
            el,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" },
          )
          .fromTo(
            el.querySelectorAll("[data-menu-item]"),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "expo.out" },
            0.35,
          )
          .fromTo(el.querySelectorAll("[data-menu-foot]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.6);
      } else if (el.style.visibility === "visible") {
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: motion ? 0.6 : 0,
          ease: "expo.inOut",
          onComplete: () => void gsap.set(el, { visibility: "hidden" }),
        });
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
      className="invisible fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-4 pt-24 pb-10 text-paper [clip-path:inset(0%_0%_100%_0%)] sm:px-8 lg:pt-28 xl:hidden"
    >
      <nav aria-label="Menu">
        <ul className="border-t border-paper/15">
          {nav.map((item, i) => (
            <li key={item.id} className="overflow-clip border-b border-paper/15">
              <button
                type="button"
                ref={i === 0 ? firstLinkRef : undefined}
                onClick={go(item.id)}
                data-menu-item
                className="group relative flex w-full cursor-pointer items-center py-4 sm:py-5"
              >
                {/* Hover: an arrow slides in from the left and the label steps aside for it. */}
                <span
                  aria-hidden
                  className="absolute left-0 -translate-x-4 text-marigold opacity-0 transition-[translate,opacity] duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                >
                  <svg viewBox="0 0 16 16" className="size-7" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="square" />
                  </svg>
                </span>
                <span className="font-display text-[clamp(2.5rem,11vw,4.5rem)] uppercase transition-[color,translate] duration-500 ease-out-expo group-hover:translate-x-10 group-hover:text-marigold group-focus-visible:translate-x-10 group-focus-visible:text-marigold">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div data-menu-foot className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 pt-10">
        <Button href={whatsappLink("Hi Raghav, I'd like to talk about my finances.")} external variant="marigold">
          Message on WhatsApp
        </Button>
        <a
          href={site.contact.phones[0].href}
          className="tabular font-semibold underline decoration-marigold decoration-2 underline-offset-[6px]"
        >
          Call {site.contact.phones[0].display}
        </a>
      </div>
    </div>
  );
}
