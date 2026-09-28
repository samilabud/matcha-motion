import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// Variant and size names mirror the Figma component properties exactly.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none font-semibold " +
    "transition-colors duration-150 ease-out " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action hover:bg-action/85",
        secondary: "border border-line-strong bg-canvas text-fg hover:bg-subtle",
        ghost: "text-fg hover:bg-subtle",
      },
      size: {
        sm: "h-8 px-3 text-body-sm",
        md: "h-10 px-4 text-body",
        lg: "h-12 px-6 text-body-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
