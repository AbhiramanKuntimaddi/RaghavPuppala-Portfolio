import type { PointerEvent } from "react";

// The briefing band follows the pointer: it sweeps in from the side the pointer entered on
// and out toward the side it left by. Spread these handlers on the element whose hover shows
// the band; the band's transform origin reads --band-from (left when unset, e.g. keyboard).
const side = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return e.clientX < r.left + r.width / 2 ? "left" : "right";
};
const setFrom = (e: PointerEvent<HTMLElement>) => e.currentTarget.style.setProperty("--band-from", side(e));

export const bandHandlers = { onPointerEnter: setFrom, onPointerLeave: setFrom };

// The band's transform origin, as a class: from --band-from, left by default.
export const bandOrigin = "[transform-origin:var(--band-from,left)]";
