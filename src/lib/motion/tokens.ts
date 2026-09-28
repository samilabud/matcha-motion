import { duration, ease, stagger } from "./tokens.generated";

export { duration, ease, stagger };

// Springs are authored here: DTCG has no spring type yet.
export const spring = {
  snappy: { type: "spring", visualDuration: 0.25, bounce: 0 },
  gentle: { type: "spring", visualDuration: 0.4, bounce: 0.15 },
} as const;

// Exits run at roughly 70% of the matching entrance.
export const exit = { duration: duration.fast, ease: ease.in } as const;
