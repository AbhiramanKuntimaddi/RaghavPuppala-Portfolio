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

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
