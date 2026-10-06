# raghavpuppala.com

Single-page site for Raghav Puppala: financial consulting first, with AdsXcell, SP Design Studio and the HridaySpandana Foundation as secondary ventures.

Next.js 16 (App Router, static export-friendly) · TypeScript · Tailwind CSS v4 · GSAP 3 (ScrollTrigger, SplitText) · Lenis

```bash
npm install
npm run dev
```

## Where things live

- `src/content/site.ts`: every word, number, link and phone on the site. Edit copy here, not in components.
- `src/app/globals.css`: color tokens (OKLCH), fonts, display utilities.
- `src/components/SmoothScroll.tsx`: Lenis driven by GSAP's ticker so ScrollTrigger and smooth scroll share one clock.
- `src/components/SipCalculator.tsx`: the SIP projection tool. The chart tweens between scenarios with GSAP.

All motion is gated behind `prefers-reduced-motion: no-preference`. With reduced motion the ventures stack vertically and Lenis is off.

## Before launch

- `public/raghav-puppala.jpg` is the web copy of the portrait (1600px, about 560KB); the 12MB `raghav-puppala.png` original isn't used by the site and can be kept out of the deploy.
- Add the AMFI ARN number to the disclaimer in `site.ts` (AMFI requires distributors to display it).
