import { MotionGlobalConfig } from "motion/react";

// Tests assert on end states. Mid-animation frames make axe contrast checks and screenshots flaky.
MotionGlobalConfig.skipAnimations = true;
