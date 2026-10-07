"use client";

// Optical alignment for large type. Every glyph carries a little built-in space on its left
// (its side bearing): about 5.6% of the font size for straight stems like L, P and H in the
// display face, around 3.5% for round letters, and almost none for A or Y. At headline
// sizes that's enough to make a heading look indented next to the small eyebrow above it.
// These helpers measure the first character of each line in its real font and pull the
// line left by exactly that much, in em, so it stays right at every size.

const STRETCH = [
  [50, "ultra-condensed"],
  [62.5, "extra-condensed"],
  [75, "condensed"],
  [87.5, "semi-condensed"],
  [100, "normal"],
  [112.5, "semi-expanded"],
  [125, "expanded"],
] as const;

// Canvas only takes keyword widths, so use the nearest one (the display face's 72% is
// measured as 75%, which moves its bearings by a fraction of a pixel).
export const stretchKeyword = (value: string) => {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "normal";
  return STRETCH.reduce((best, s) => (Math.abs(s[0] - n) < Math.abs(best[0] - n) ? s : best))[1];
};

const cache = new Map<string, { bearing: number; advance: number }>();
let ctx: CanvasRenderingContext2D | null = null;

// The first character of an element's text, measured in its own font, in em. An element
// whose text animates (a counter) can name its final text in data-optical-text.
function measure(el: Element) {
  const text = (el as HTMLElement).dataset?.opticalText ?? el.textContent ?? "";
  const cs = getComputedStyle(el);
  // Measure the glyph that's actually drawn: headings are often typed in lower case and
  // set in capitals with CSS.
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
  // Only remember measurements taken in the real font, not a fallback still loading.
  if (document.fonts.check(ctx.font)) cache.set(key, result);
  return result;
}

// Pull each element left by its first glyph's side bearing (for lines of a heading, or a
// single-line heading).
export function alignOptically(els: Iterable<Element>) {
  for (const el of els) (el as HTMLElement).style.marginLeft = `${-measure(el).bearing}em`;
}

// Hang an opening quote mark into the margin, so the first word lines up instead. Put
// data-hang on an inline element holding just the mark.
export function hangPunctuation(els: Iterable<Element>) {
  for (const el of els) (el as HTMLElement).style.marginLeft = `${-measure(el).advance}em`;
}
