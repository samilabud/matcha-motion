"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import { exit, spring } from "@/lib/motion/tokens";
import { Button } from "@/components/ui/button";

export type CartItem = { id: string; name: string; price: number };

/**
 * Radix owns behaviour (focus trap, focus return, Esc, aria-modal); Motion owns animation.
 * The trigger must render through Dialog.Trigger: Radix returns focus to it on close.
 */
export function CartDrawer({
  open,
  onOpenChange,
  items,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  trigger: React.ReactNode;
}) {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-40 bg-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: exit }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <m.aside
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col gap-6 bg-surface p-6 shadow-xl"
                initial={{ x: "100%" }}
                animate={{ x: 0, transition: spring.snappy }}
                exit={{ x: "100%", transition: exit }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0, right: 0.5 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 120 || info.velocity.x > 500) onOpenChange(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-xl font-semibold">Your cart</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="sm">Close</Button>
                  </Dialog.Close>
                </div>
                {items.length === 0 ? (
                  <p className="text-muted">Your cart is empty.</p>
                ) : (
                  <ul className="flex flex-col divide-y">
                    {items.map((i, idx) => (
                      <li key={`${i.id}-${idx}`} className="flex justify-between py-3">
                        <span>{i.name}</span>
                        <span className="tabular-nums">${i.price}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto flex items-center justify-between border-t pt-4">
                  <span className="text-muted">Total</span>
                  <span className="text-lg font-semibold tabular-nums">${total}</span>
                </div>
              </m.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
