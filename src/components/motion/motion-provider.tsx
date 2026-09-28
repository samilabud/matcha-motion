"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { duration, ease } from "@/lib/motion/tokens";

const loadFeatures = () => import("./features").then((m) => m.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    // strict: using <motion.div> instead of <m.div> throws, which keeps the full bundle out.
    <LazyMotion features={loadFeatures} strict>
      {/* "user": respects prefers-reduced-motion (drops transforms/layout, keeps opacity). */}
      <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.out }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
