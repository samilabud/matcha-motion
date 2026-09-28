import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./cart-drawer";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <CartDrawer
      open={open}
      onOpenChange={setOpen}
      trigger={<Button>Open cart</Button>}
      items={[
        { id: "p1", name: "Linen overshirt", price: 88 },
        { id: "p3", name: "Canvas tote", price: 34 },
      ]}
    />
  );
}

const meta = { title: "Patterns/CartDrawer", component: Harness } satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Focus moves into the drawer, Esc closes it, focus returns to the trigger. */
export const FocusManagement: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open cart" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Your cart" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
