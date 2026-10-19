"use client";

import { useEffect } from "react";
import { alignOptically, hangPunctuation } from "@/lib/optical";

// data-optical and data-hang for type that isn't split into lines. Re-runs once fonts load.
export function OpticalAlign() {
  useEffect(() => {
    const run = () => {
      alignOptically(document.querySelectorAll("[data-optical]"));
      hangPunctuation(document.querySelectorAll("[data-hang]"));
    };
    run();
    void document.fonts.ready.then(run);
  }, []);

  return null;
}
