"use client";

import { useEffect } from "react";
import { alignOptically, hangPunctuation } from "@/lib/optical";

// Optical alignment for large type that isn't split into lines (split headings align
// their own lines): data-optical pulls a heading back by its first glyph's side bearing,
// and data-hang (on a span holding just an opening quote mark) hangs it into the margin. Runs again once the web
// fonts have loaded, since a fallback font has different bearings.
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
