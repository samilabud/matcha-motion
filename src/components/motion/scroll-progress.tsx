"use client";

import * as m from "motion/react-m";
import { useScroll, useSpring } from "motion/react";

/** Page reading progress. scaleX is compositor-only; motion values never re-render React. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <m.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0%" }}
      className="fixed inset-x-0 top-0 z-50 h-1 bg-action"
    />
  );
}
