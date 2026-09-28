import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaggerList } from "./stagger-list";

const ITEMS = Array.from({ length: 12 }, (_, i) => ({ id: `i${i}`, label: `Item ${i + 1}` }));

const meta = {
  title: "Motion/StaggerList",
  component: StaggerList<(typeof ITEMS)[number]>,
  args: {
    items: ITEMS,
    getKey: (i) => i.id,
    renderItem: (i) => <div className="rounded-card border bg-surface p-4">{i.label}</div>,
    className: "grid grid-cols-3 gap-3",
    cap: 8,
  },
} satisfies Meta<typeof StaggerList<(typeof ITEMS)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Items 9–12 appear without staggering: the cap keeps the sequence under ~500ms. */
export const Capped: Story = {};
export const Uncapped: Story = { args: { cap: 99 } };
