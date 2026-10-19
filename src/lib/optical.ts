"use client";

// Optical alignment: pull large type left by its first glyph's side bearing (measured in its
// real font, in em), so headings line up with the small text above them.

const STRETCH = [
  [50, "ultra-condensed"],
  [62.5, "extra-condensed"],
  [75, "condensed"],
  [87.5, "semi-condensed"],
  [100, "normal"],
  [112.5, "semi-expanded"],
  [125, "expanded"],
] as const;

// Canvas only takes keyword widths, so the nearest one (72% is measured as 75%).
export const stretchKeyword = (value: string) => {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "normal";
  return STRETCH.reduce((best, s) => (Math.abs(s[0] - n) < Math.abs(best[0] - n) ? s : best))[1];
};

const cache = new Map<string, { bearing: number; advance: number }>();
let ctx: CanvasRenderingContext2D | null = null;

// data-optical-text names the final text of an element that animates (a counter).
function measure(el: Element) {
  const text = (el as HTMLElement).dataset?.opticalText ?? el.textContent ?? "";
  const cs = getComputedStyle(el);
  // Measure what's drawn: CSS may set lower-case text in capitals.
  const first = text.trimStart().charAt(0);
  const ch =
    cs.textTransform === "uppercase"
      ? first.toUpperCase()
      : cs.textTransform === "lowercase"
        ? first.toLowerCase()
        : first;
  if (!ch) return { bearing: 0, advance: 0 };
  const key = [ch, cs.fontFamily, cs.fontWeight, cs.fontStyle, cs.fontStretch].join("|");
  const hit = cache.get(key);
  if (hit) return hit;

  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return { bearing: 0, advance: 0 };
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} 1000px ${cs.fontFamily}`;
  ctx.fontStretch = stretchKeyword(cs.fontStretch);
  const m = ctx.measureText(ch);
  const result = {
    bearing: Math.max(0, -m.actualBoundingBoxLeft) / 1000,
    advance: m.width / 1000,
  };
  // Only cache measurements taken in the real font.
  if (document.fonts.check(ctx.font)) cache.set(key, result);
  return result;
}

export function alignOptically(els: Iterable<Element>) {
  for (const el of els) (el as HTMLElement).style.marginLeft = `${-measure(el).bearing}em`;
}

// Hang an opening quote mark (data-hang) into the margin, so the first word lines up.
export function hangPunctuation(els: Iterable<Element>) {
  for (const el of els) (el as HTMLElement).style.marginLeft = `${-measure(el).advance}em`;
}
