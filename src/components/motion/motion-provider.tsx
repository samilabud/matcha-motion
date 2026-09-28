"use client";

import { LazyMotion, MotionConfig, MotionGlobalConfig } from "motion/react";
import { duration, ease } from "@/lib/motion/tokens";

// Set by Playwright (tests/visual.spec.ts) so screenshots capture end states, never mid-animation frames.
if (typeof window !== "undefined" && (window as { __SKIP_MOTION__?: boolean }).__SKIP_MOTION__) {
  MotionGlobalConfig.skipAnimations = true;
}

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
