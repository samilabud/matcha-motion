"use client";

import { useState } from "react";
import { useAnimate } from "motion/react";
import { duration, ease } from "@/lib/motion/tokens";
import { Button } from "@/components/ui/button";
import { StaggerList } from "@/components/motion/stagger-list";
import { CartDrawer, type CartItem } from "./cart-drawer";

const PRODUCTS: CartItem[] = [
  { id: "p1", name: "Linen overshirt", price: 88 },
  { id: "p2", name: "Merino crew", price: 120 },
  { id: "p3", name: "Canvas tote", price: 34 },
  { id: "p4", name: "Selvedge denim", price: 145 },
  { id: "p5", name: "Wool beanie", price: 29 },
  { id: "p6", name: "Leather belt", price: 65 },
];

/** Demo of the add-to-cart pattern: instant state, badge feedback, spoken confirmation. */
export function ShopDemo() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [scope, animate] = useAnimate();

  function add(p: CartItem) {
    setCart((c) => [...c, p]); // state first, animation after: protects INP
    animate("[data-cart-badge]", { scale: [1, 1.3, 1] }, { duration: duration.slow, ease: ease.out });
    setAnnouncement(`${p.name} added to cart`);
  }

  return (
    <div ref={scope} className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-display-7">All products</h2>
        <CartDrawer
          open={open}
          onOpenChange={setOpen}
          items={cart}
          trigger={
            <Button variant="secondary" aria-label={`Cart, ${cart.length} items`}>
              Cart
              <span
                data-cart-badge
                aria-hidden
                className="inline-grid min-w-6 place-items-center rounded-full bg-action px-1.5 text-body-sm text-on-action tabular-nums"
              >
                {cart.length}
              </span>
            </Button>
          }
        />
      </div>

      <StaggerList
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        items={PRODUCTS}
        getKey={(p) => p.id}
        renderItem={(p) => (
          <article className="flex flex-col gap-4 rounded-2 border bg-canvas p-5">
            <div aria-hidden className="aspect-4/3 rounded-2 bg-subtle" />
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{p.name}</h3>
              <span className="text-muted tabular-nums">${p.price}</span>
            </div>
            <Button onClick={() => add(p)}>Add to cart</Button>
          </article>
        )}
      />

      <p aria-live="polite" className="sr-only">{announcement}</p>
    </div>
  );
}
