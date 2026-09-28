"use client";

import * as m from "motion/react-m";
import type { Variants } from "motion/react";
import { duration, ease, stagger } from "@/lib/motion/tokens";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: stagger.base, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
};

/** Reveals children as the list scrolls into view. Only the first `cap` items stagger. */
export function StaggerList<T>({
  items,
  getKey,
  renderItem,
  cap = 8,
  className,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  cap?: number;
  className?: string;
}) {
  return (
    <m.ul
      className={className}
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {items.map((it, i) => (
        <m.li key={getKey(it)} variants={i < cap ? item : undefined}>
          {renderItem(it)}
        </m.li>
      ))}
    </m.ul>
  );
}
