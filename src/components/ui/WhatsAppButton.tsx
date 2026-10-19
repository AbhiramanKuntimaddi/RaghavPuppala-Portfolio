"use client";

import { useEffect, useId, useRef, useState } from "react";
import { site, whatsappLink } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { QR_SEEN, QR_OPENED } from "@/lib/qr";
import { Button } from "./Button";
import { WhatsAppQR } from "./WhatsAppQR";

// On desktop (mouse), opens a popover card with the QR instead of WhatsApp Web; phones keep
// the plain link. Closes on Esc, outside click or scroll.

const DESKTOP = "(hover: hover) and (pointer: fine)";

type Props = Omit<React.ComponentProps<typeof Button>, "href" | "onClick" | "external"> & {
  message?: string;
  /** Put the message in the QR too (off by default: keeps the code small, like his flyer's). */
  messageInQr?: boolean;
  title?: string;
};

export function WhatsAppButton({ message, messageInQr, title = "Scan with your phone", ...button }: Props) {
  const href = whatsappLink(message);
  const qr = messageInQr ? href : whatsappLink();
  const id = useId();
  const card = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  // Stops the click that light-dismissed the card from reopening it.
  const closedAt = useRef(0);

  const toggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(DESKTOP).matches) return;
    e.preventDefault();
    if (performance.now() - closedAt.current < 400) return;
    anchor.current = e.currentTarget;
    card.current?.togglePopover();
  };

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const close = () => el.hidePopover();
    const onBeforeToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "closed") closedAt.current = performance.now();
    };
    const onToggle = (e: Event) => {
      const opening = (e as ToggleEvent).newState === "open";
      setOpen(opening);
      if (!opening) {
        window.removeEventListener("scroll", close);
        return;
      }
      // Above the button, kept on screen; below it if there's no room.
      const b = anchor.current!.getBoundingClientRect();
      const { offsetWidth: w, offsetHeight: h } = el;
      const left = Math.min(Math.max(b.left + b.width / 2 - w / 2, 16), window.innerWidth - w - 16);
      const top = b.top - h - 14 >= 16 ? b.top - h - 14 : b.bottom + 14;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      gsap.fromTo(el, { y: top < b.top ? 10 : -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 });
      window.addEventListener("scroll", close, { passive: true, once: true });
      try {
        sessionStorage.setItem(QR_SEEN, "1");
      } catch {}
      window.dispatchEvent(new Event(QR_OPENED));
    };
    el.addEventListener("beforetoggle", onBeforeToggle);
    el.addEventListener("toggle", onToggle);
    return () => {
      el.removeEventListener("beforetoggle", onBeforeToggle);
      el.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", close);
    };
  }, []);

  return (
    <>
      <Button
        {...button}
        href={href}
        external
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
      />
      <div
        ref={card}
        id={id}
        popover="auto"
        role="dialog"
        aria-label="WhatsApp QR code"
        className="fixed inset-auto m-0 w-64 overflow-visible border-0 bg-transparent p-0 text-paper"
      >
        <QrCard href={href} qr={qr} title={title} />
      </div>
    </>
  );
}

function QrCard({ href, qr, title }: { href: string; qr: string; title: string }) {
  return (
    <div className="bg-ink p-5 shadow-[0_18px_40px_-12px_oklch(0.2_0.02_55/0.45)] [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]">
      <p className="pr-4 text-xs font-semibold tracking-[0.12em] text-paper/70 uppercase">{title}</p>
      <WhatsAppQR href={qr} className="mt-3 block w-full" />
      <p className="mt-3 font-display text-2xl uppercase tabular">{site.contact.phones[0].display}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-paper/75 underline decoration-paper/30 underline-offset-4 transition-colors duration-300 hover:text-marigold hover:decoration-marigold"
      >
        Or open WhatsApp on this computer
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M4 12 12 4M5.5 4H12v6.5" strokeLinecap="square" />
        </svg>
      </a>
    </div>
  );
}
