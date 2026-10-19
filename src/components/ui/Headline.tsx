"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { SplitText, useGSAP } from "@/lib/gsap";
import { alignOptically } from "@/lib/optical";

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
};

export function Headline({ as: Tag = "h2", className, children, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      SplitText.create(ref.current, {
        type: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) => void alignOptically(self.lines),
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
