"use client";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { stretchKeyword } from "@/lib/optical";

// Section entries and exits: content (never the background) is revealed and cut along a 45°
// line from the top-right corner, with headline letters scrambling at the edge. Scroll-driven.

const NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TEXT = "h1, h2, h3, blockquote, [data-scramble], [data-eyebrow]";
const ENTER_BY = 0.7; // entry finishes once the top is 70% up the screen
const EXIT_BY = 0.75; // exit finishes once 75% has left
const EMPTY = "polygon(0 0,0 0,0 0)";

type Point = [number, number];
// Positioned in its target's unscaled coordinates, so it holds while a sheet shrinks back.
type Glyph = { node: Text; index: number; target: number; lx: number; ly: number; noise: string[] };
type Unit = {
  el: HTMLElement;
  box: HTMLElement; // the pin spacer of a pinned section, else el
  next?: HTMLElement; // the sheet that slides over this one
  targets: HTMLElement[]; // content only, not the background
  exitBy: number;
  sticky: boolean;
  glyphs: Glyph[] | null;
  originals: Map<Text, string>;
  blocks: { el: HTMLElement; height: number }[]; // headings held at their height while scrambled
  clipped: boolean;
  noisy: boolean;
};
type Plan = { u: Unit; clips: string[] | null; text: Map<Text, string> | null };

const clamp = (v: number) => Math.min(1, Math.max(0, v));

// Sutherland–Hodgman: clip a convex polygon to where f(point) >= 0.
function clipTo(poly: Point[], f: (p: Point) => number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

// Noise letters of similar width, so scrambling never reflows a line.
const noiseCache = new Map<string, string[]>();
let ctx: CanvasRenderingContext2D | null = null;
function noiseLike(el: Element, width: number): string[] {
  const cs = getComputedStyle(el);
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const key = `${font}|${cs.fontStretch}|${Math.round(width * 2)}`;
  const hit = noiseCache.get(key);
  if (hit) return hit;
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return [...NOISE];
  ctx.font = font;
  ctx.fontStretch = stretchKeyword(cs.fontStretch);
  const sized = [...NOISE].map((c) => [c, ctx!.measureText(c).width] as const);
  let near = sized.filter(([, w]) => Math.abs(w - width) <= width * 0.12).map(([c]) => c);
  if (near.length < 3)
    near = [...sized]
      .sort((a, b) => Math.abs(a[1] - width) - Math.abs(b[1] - width))
      .slice(0, 3)
      .map(([c]) => c);
  noiseCache.set(key, near);
  return near;
}

export function Cuts() {
  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      const units: Unit[] = [];
      const add = (el: HTMLElement, box: HTMLElement, targets: HTMLElement[], extra: Partial<Unit> = {}) =>
        units.push({
          el,
          box,
          targets,
          exitBy: EXIT_BY,
          sticky: false,
          glyphs: null,
          originals: new Map(),
          blocks: [],
          clipped: false,
          noisy: false,
          ...extra,
        });
      const children = (el: HTMLElement) => [...el.children].filter((c): c is HTMLElement => c instanceof HTMLElement);

      const sections = gsap.utils.toArray<HTMLElement>("main > section, main > .pin-spacer > section");
      sections.forEach((section, i) => {
        const sheets = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-sheet]"));
        if (sheets.length) {
          sheets.forEach((sheet, k) => {
            const body = sheet.querySelector<HTMLElement>("[data-sheet-body]");
            add(sheet, sheet, body ? [body] : children(sheet), { next: sheets[k + 1] });
          });
          return;
        }
        const box = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
        // Contact only enters; it leaves by lifting off the footer.
        add(section, box, children(section), i === sections.length - 1 ? { exitBy: Infinity } : {});
      });

      const restore = (u: Unit) => {
        for (const [node, text] of u.originals) if (node.data !== text) node.data = text;
        for (const { el } of u.blocks) el.style.height = "";
        u.noisy = false;
      };
      const reset = (u: Unit) => {
        if (u.clipped) for (const t of u.targets) t.style.clipPath = "";
        u.clipped = false;
        if (u.noisy) restore(u);
      };

      // Once per layout, and again if a heading re-split its text.
      const measure = (u: Unit) => {
        if (u.noisy) restore(u);
        u.originals.clear();
        u.blocks = [];
        const range = document.createRange();
        const list: Glyph[] = [];
        u.targets.forEach((t, ti) => {
          const tr = t.getBoundingClientRect();
          const s = (t.offsetWidth ? tr.width / t.offsetWidth : 1) || 1;
          for (const el of t.querySelectorAll<HTMLElement>(TEXT)) {
            u.blocks.push({ el, height: el.offsetHeight });
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
              u.originals.set(n, n.data);
              const owner = n.parentElement ?? el;
              for (let i = 0; i < n.data.length; i++) {
                if (!n.data[i].trim()) continue;
                range.setStart(n, i);
                range.setEnd(n, i + 1);
                const r = range.getBoundingClientRect();
                if (!r.width) continue;
                list.push({
                  node: n,
                  index: i,
                  target: ti,
                  lx: (r.left + r.width / 2 - tr.left) / s,
                  ly: (r.top + r.height / 2 - tr.top) / s,
                  noise: noiseLike(owner, r.width / s),
                });
              }
            }
          }
        });
        u.glyphs = list;
      };

      const render = () => {
        const vh = window.innerHeight;
        const plans: Plan[] = [];

        // Read everything first, then write, so layout runs once per frame.
        for (const u of units) {
          const r = u.el.getBoundingClientRect();
          const b = u.box === u.el ? r : u.box.getBoundingClientRect();
          if (b.bottom < -vh || b.top > vh * 2) continue;
          const w = r.width;
          const H = u.el.offsetHeight;
          const screen = Math.min(vh, H);

          const enter = clamp((vh - b.top) / Math.min(vh * ENTER_BY, H * 0.9));
          const cIn = enter >= 1 ? Infinity : enter * (w + screen);
          // A stacked sheet exits as the next one slides over it.
          const leave =
            u.sticky && u.next
              ? clamp((vh - u.next.getBoundingClientRect().top) / (vh * u.exitBy))
              : clamp((vh - b.bottom) / (vh * u.exitBy));
          const cOut = leave * (w + screen);
          const offOut = H - screen;

          if (cIn === Infinity && cOut <= 0) {
            plans.push({ u, clips: null, text: null });
            continue;
          }

          let poly: Point[] = [
            [0, 0],
            [w, 0],
            [w, H],
            [0, H],
          ];
          if (cIn !== Infinity) poly = clipTo(poly, ([x, y]) => cIn - (w - x + y));
          if (cOut > 0) poly = clipTo(poly, ([x, y]) => w - x + (y - offOut) - cOut);
          const frames = u.targets.map((t) => {
            const tr = t.getBoundingClientRect();
            return { dx: tr.left - r.left, dy: tr.top - r.top, s: (t.offsetWidth ? tr.width / t.offsetWidth : 1) || 1 };
          });
          const clips = frames.map(({ dx, dy, s }) =>
            poly.length ? `polygon(${poly.map(([x, y]) => `${(x - dx) / s}px ${(y - dy) / s}px`).join(",")})` : EMPTY,
          );

          let text: Map<Text, string> | null = new Map();
          if (b.bottom > 0 && b.top < vh) {
            if (!u.glyphs || u.glyphs.some((g) => !g.node.isConnected)) measure(u);
            const band = Math.min(160, Math.max(60, 0.07 * (w + screen)));
            const step = Math.floor(((cIn === Infinity ? 0 : cIn) + cOut) / 14);
            const scrambled = new Map<Text, string[]>();
            for (const g of u.glyphs ?? []) {
              const f = frames[g.target];
              const x = f.dx + g.lx * f.s;
              const y = f.dy + g.ly * f.s;
              const dIn = w - x + y;
              const dOut = w - x + (y - offOut);
              const entering = cIn !== Infinity && dIn <= cIn && dIn > cIn - band;
              const leaving = cOut > 0 && dOut >= cOut && dOut < cOut + band;
              if (!entering && !leaving) continue;
              const chars = scrambled.get(g.node) ?? [...(u.originals.get(g.node) ?? "")];
              chars[g.index] = g.noise[(g.index * 13 + step) % g.noise.length];
              scrambled.set(g.node, chars);
            }
            for (const [node, chars] of scrambled) text.set(node, chars.join(""));
          } else text = null;
          plans.push({ u, clips, text });
        }

        for (const { u, clips, text } of plans) {
          if (!clips) {
            reset(u);
            continue;
          }
          u.targets.forEach((t, i) => (t.style.clipPath = clips[i]));
          u.clipped = true;
          if (!text || !text.size) {
            if (u.noisy) restore(u);
            continue;
          }
          if (!u.noisy) for (const { el, height } of u.blocks) el.style.height = `${height}px`;
          for (const [node, original] of u.originals) {
            const want = text.get(node) ?? original;
            if (node.data !== want) node.data = want;
          }
          u.noisy = true;
        }
      };

      let frame = 0;
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(() => ((frame = 0), render()));
      };
      // Layout changed: reset every unit, re-measure, redraw (far-off ones too).
      const relayout = () => {
        for (const u of units) {
          reset(u);
          u.glyphs = null;
          u.sticky = getComputedStyle(u.el).position === "sticky";
        }
        render();
        const vh = window.innerHeight;
        for (const u of units) {
          const b = u.box.getBoundingClientRect();
          if (!(b.bottom < -vh || b.top > vh * 2)) continue;
          if (b.top > 0) {
            for (const t of u.targets) t.style.clipPath = EMPTY;
            u.clipped = true;
          }
        }
      };

      window.addEventListener("scroll", schedule, { passive: true });
      ScrollTrigger.addEventListener("refresh", relayout);
      relayout();

      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        ScrollTrigger.removeEventListener("refresh", relayout);
        units.forEach(reset);
      };
    });
  });

  return null;
}
