import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ShopDemo } from "@/components/patterns/shop-demo";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16">
        {/* The hero is static on purpose: it is the LCP element, so it never fades in. */}
        <header className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Motion DS Starter
          </h1>
          <p className="max-w-prose text-lg text-muted">
            Tokens from Figma, a component layer with no per-screen values, and motion that stays
            on the compositor. Replace this page with your Figma build.
          </p>
        </header>
        <ShopDemo />
      </main>
    </>
  );
}
