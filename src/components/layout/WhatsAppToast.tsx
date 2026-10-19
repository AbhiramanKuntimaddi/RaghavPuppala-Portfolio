"use client";

import { useEffect, useRef, useState } from "react";
import { site, whatsappLink } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { QR_OPENED, QR_SEEN } from "@/lib/qr";
import { WhatsAppQR } from "@/components/ui/WhatsAppQR";

// A one-time reminder, desktop only: once a visitor reaches what clients say (most of the
// way through the page), a small card slides in at the bottom-left with the WhatsApp QR.
// It shows at most once a visit, never on phones (the buttons open WhatsApp directly
// there), and not at all for someone who has already opened a QR card. It leaves when
// they close it, or by itself once Contact comes into view, which has the QR anyway.

const DESKTOP = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

export function WhatsAppToast() {
  const root = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const seen = () => {
      try {
        return sessionStorage.getItem(QR_SEEN) === "1";
      } catch {
        return false;
      }
    };
    if (!window.matchMedia(DESKTOP).matches || seen()) return;
    const trigger = document.querySelector("[data-qr-toast]");
    const contact = document.getElementById("contact");
    if (!trigger || !contact) return;

    const show = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        show.disconnect();
        // Already scrolled on to Contact (a nav jump), or seen the QR on the way: skip it.
        if (seen() || contact.getBoundingClientRect().top < window.innerHeight) return;
        try {
          sessionStorage.setItem(QR_SEEN, "1");
        } catch {}
        setShown(true);
      },
      { threshold: 0.5 },
    );
    const hide = new IntersectionObserver(([e]) => e.isIntersecting && setShown(false), { threshold: 0.15 });
    const onQr = () => setShown(false);
    show.observe(trigger);
    hide.observe(contact);
    window.addEventListener(QR_OPENED, onQr);
    return () => {
      show.disconnect();
      hide.disconnect();
      window.removeEventListener(QR_OPENED, onQr);
    };
  }, []);

  // In from the left; back out the same way.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(el, {
      x: shown || still ? 0 : -24,
      autoAlpha: shown ? 1 : 0,
      duration: shown ? 0.9 : 0.4,
      ease: shown ? "expo.out" : "power2.in",
      overwrite: true,
    });
  }, [shown]);

  const href = whatsappLink();

  return (
    <aside
      ref={root}
      aria-label="Chat with Raghav on WhatsApp"
      className="invisible fixed bottom-6 left-6 z-40 hidden w-[23rem] opacity-0 lg:block"
    >
      <div className="flex items-center gap-4 bg-ink p-4 text-paper shadow-[0_18px_40px_-12px_oklch(0.2_0.02_55/0.45)] [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]">
        <WhatsAppQR href={href} className="size-28 shrink-0" />
        <div className="min-w-0 pr-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-paper/70 uppercase">Prefer to chat?</p>
          <p className="mt-1.5 font-display text-2xl uppercase">Scan to WhatsApp Raghav</p>
          <a
            href={href}
            target="_blank"
            rel="noopener"
            className="mt-1.5 inline-block text-sm text-paper/75 tabular underline decoration-paper/30 underline-offset-4 transition-colors duration-300 hover:text-marigold hover:decoration-marigold"
          >
            {site.contact.phones[0].display}
          </a>
        </div>
        <button
          type="button"
          onClick={() => setShown(false)}
          aria-label="Close"
          className="absolute top-5 right-3 grid size-7 place-items-center text-paper/60 transition-colors duration-300 hover:text-marigold"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M3 3l10 10M13 3 3 13" strokeLinecap="square" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
