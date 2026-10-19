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

// Same curve as cubic-bezier(.7,0,.3,1), for line drawing.
CustomEase.create("draw", "M0,0 C0.7,0 0.3,1 1,1");

gsap.defaults({ ease: "expo.out", duration: 1.1 });

// Ignore toolbar-only resizes on touch devices, so pins aren't re-measured mid-scroll. (Why
// pinned sections use lvh: it's fixed, so they still reach the bottom when the toolbar hides.)
ScrollTrigger.config({ ignoreMobileResize: true });

// Reloads start at the top: restoring the old position before pins exist lands in the wrong place.
if (typeof window !== "undefined") ScrollTrigger.clearScrollMemory("manual");

// Lets the Design Lab's motion speed control slow GSAP in dev.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined")
  (window as Window & { gsap?: typeof gsap }).gsap = gsap;

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
