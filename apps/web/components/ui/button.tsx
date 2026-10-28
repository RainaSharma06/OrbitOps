import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-[var(--brand-contrast)] shadow-sm hover:opacity-90 active:scale-[0.98]",
        outline:
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-strong)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border-strong)] active:scale-[0.98]",
        ghost:
          "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-strong)]",
        danger:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
      },
      size: {
        default: "px-4 py-2",
        sm: "min-h-8 px-3 py-1.5 text-xs rounded-lg",
        icon: "size-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
