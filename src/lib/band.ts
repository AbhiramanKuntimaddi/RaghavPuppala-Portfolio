import type { PointerEvent } from "react";

// The hover band enters from the side the pointer came in and leaves toward the side it went
// out. Spread these on the hovered element; the band reads --band-from.
const side = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return e.clientX < r.left + r.width / 2 ? "left" : "right";
};
const setFrom = (e: PointerEvent<HTMLElement>) => e.currentTarget.style.setProperty("--band-from", side(e));

export const bandHandlers = { onPointerEnter: setFrom, onPointerLeave: setFrom };

export const bandOrigin = "[transform-origin:var(--band-from,left)]";
