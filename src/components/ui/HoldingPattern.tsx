"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, MOTION_REDUCED, useGSAP } from "@/lib/gsap";
import { JET_PATH } from "./Jet";

// The jet flying a holding pattern, the racetrack loop flown while waiting for clearance
// to land: a dashed route like the hero's, with the jet circling it on a slow loop. With
// reduced motion it's parked on the route.
export function HoldingPattern({ className = "" }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const path = root.current!.querySelector<SVGPathElement>("[data-route]")!;
      const jet = root.current!.querySelector("[data-jet]");
      gsap.matchMedia().add({ motion: MOTION_OK, reduced: MOTION_REDUCED }, (context) => {
        const { motion } = context.conditions as { motion: boolean };
        const fly = gsap.to(jet, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true },
          duration: 10,
          ease: "none",
          repeat: -1,
          paused: !motion,
        });
        if (!motion) fly.progress(0.1);
      });
    },
    { scope: root },
  );

  return (
    <svg ref={root} viewBox="0 0 400 240" className={`overflow-visible ${className}`} aria-hidden>
      <path
        data-route
        d="M130 50H270A70 70 0 0 1 270 190H130A70 70 0 0 1 130 50Z"
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.45}
        strokeWidth={1.5}
        strokeDasharray="6 9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <g data-jet>
        <path d={JET_PATH} transform="scale(1.6)" fill="currentColor" />
      </g>
    </svg>
  );
}
