"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin, CustomEase, useGSAP);

// Line-drawing ease, the same curve as cubic-bezier(.7,0,.3,1): a soft start and a soft
// landing, so strokes visibly travel instead of popping in.
CustomEase.create("draw", "M0,0 C0.7,0 0.3,1 1,1");

// One easing vocabulary for the whole site: exponential ease-outs only.
gsap.defaults({ ease: "expo.out", duration: 1.1 });

// On phones and tablets the browser's toolbar collapses as you scroll, and each step is
// reported as a resize. Left alone, ScrollTrigger re-measures every pin mid-scroll, which
// yanks a held section out from under the reader. This ignores resizes on touch devices
// that only change the height (rotating changes the width too, so that still refreshes).
// It's why the pinned sections are sized in lvh rather than svh: lvh is the height with
// the toolbar hidden and never changes, so a pin measured once still reaches the bottom
// of the screen after the toolbar collapses, with no strip of the next section beneath.
ScrollTrigger.config({ ignoreMobileResize: true });

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
