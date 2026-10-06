"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, MOTION_REDUCED, useGSAP } from "@/lib/gsap";
import { JetIcon } from "./Jet";

// The jet's landing, built in real 3D. A runway lies on the ground, tilted back with CSS
// perspective so it runs off into the distance. The jet comes in large and high, sinks
// onto it and meets its own shadow at touchdown, then rolls away down the runway, all
// while the runway scrolls up into the middle of the screen. With reduced motion it's shown
// parked a little way down the runway.
//
// Two layers share the same ground tilt: the runway (which fades out with a mask) and
// the jet with its shadow. They're kept apart because a mask or filter on a 3D layer
// flattens everything inside it, and the jet needs real altitude.
const ground =
  "absolute bottom-0 left-1/2 h-[2600px] w-[320px] -translate-x-1/2 origin-bottom [transform:rotateX(78deg)] sm:w-[440px]";

export function Landing() {
  const scene = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scene);
      const jet = q("[data-jet]");
      const shadow = q("[data-jet-shadow]");
      const mm = gsap.matchMedia();

      // The jet flies nose-up (pitched about its tail), the attitude of a landing flare,
      // which also turns more of its outline toward the low camera. The shadow stays flat.
      gsap.set(jet, { rotationX: -50, transformOrigin: "50% 100%" });

      mm.add(MOTION_REDUCED, () => {
        gsap.set([jet, shadow], { y: -700 });
      });

      mm.add(MOTION_OK, () => {
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: scene.current, start: "top bottom", end: "bottom center", scrub: 0.8 },
          })
          // Approach: in from the left, high and close, settling onto the centre line.
          .fromTo(
            jet,
            { x: -150, y: 520, z: 360, rotationZ: -12 },
            { x: 0, y: -240, z: 0, rotationZ: 0, ease: "power1.inOut", duration: 0.62 },
          )
          // Its shadow tracks it along the ground, darkening and sharpening as it nears.
          .fromTo(
            shadow,
            { x: -150, y: 520, rotationZ: -12, opacity: 0, scale: 1.25 },
            { x: 0, y: -240, rotationZ: 0, opacity: 0.32, scale: 1, ease: "power1.inOut", duration: 0.62 },
            0,
          )
          // Roll-out: away down the runway, shrinking into the distance.
          .to([jet, shadow], { y: -1500, ease: "power2.out", duration: 0.38 });
      });
    },
    { scope: scene },
  );

  return (
    <div
      ref={scene}
      aria-hidden
      className="pointer-events-none relative h-[260px] overflow-clip [perspective:900px] [perspective-origin:50%_0%] sm:h-[340px]"
    >
      {/* Runway: edges, threshold bars and a dashed centre line, fading into the distance. */}
      <div className={`${ground} border-x-[3px] border-ink [mask-image:linear-gradient(to_top,black_30%,transparent_80%)]`}>
        <div className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 bg-[repeating-linear-gradient(to_top,var(--color-ink)_0_60px,transparent_60px_130px)]" />
        <div className="absolute inset-x-[18px] bottom-[40px] h-[90px] bg-[repeating-linear-gradient(to_right,var(--color-ink)_0_12px,transparent_12px_26px)]" />
      </div>

      {/* Jet and shadow, in the runway's own coordinates (same tilt, no mask). */}
      <div className={`${ground} [transform-style:preserve-3d]`}>
        <div data-jet-shadow className="absolute bottom-0 left-1/2 -ml-[70px] size-[140px] text-ink blur-[3px]">
          <JetIcon className="size-full -rotate-90" />
        </div>
        <div data-jet className="absolute bottom-0 left-1/2 -ml-[70px] size-[140px] text-ink">
          <JetIcon className="size-full -rotate-90" />
        </div>
      </div>
    </div>
  );
}
