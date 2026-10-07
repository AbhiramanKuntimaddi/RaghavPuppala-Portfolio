"use client";

import { useEffect } from "react";

// Sets the tab title from a page that can't export metadata (the 404 page), and puts the
// previous title back when it unmounts. Next writes the layout's title into the head as the
// page hydrates, which can land after this effect, so the title is re-applied whenever the
// head changes while the page is open.
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
