"use client";

import { useEffect } from "react";

// Title for pages that can't export metadata. Re-applied on head changes, since Next can
// write the layout's title after this effect.
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    const previous = document.title;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      document.title = previous;
    };
  }, [title]);
  return null;
}
