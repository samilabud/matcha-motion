import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// Variant and size names mirror the Figma component properties exactly.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-medium " +
    "transition-colors duration-150 ease-out " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover",
        secondary: "border bg-surface text-fg hover:bg-surface-hover",
        ghost: "text-fg hover:bg-surface-hover",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
