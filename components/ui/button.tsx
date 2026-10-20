import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.005em] transition-[background-color,color,box-shadow,transform,border-color] duration-(--duration-base) ease-(--ease-out-quart) outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] active:duration-(--duration-fast) [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-foreground text-background hover:bg-foreground/85",
        outline: "border border-input bg-surface text-foreground hover:border-foreground/40 hover:bg-subtle",
        ghost: "text-foreground hover:bg-muted",
        subtle: "bg-muted text-foreground hover:bg-border/70",
        accent: "bg-accent text-accent-foreground hover:brightness-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "rounded-md text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        // Mobile-first: touch-sized on phones, compact from the sm breakpoint.
        sm: "h-10 px-3.5 text-sm sm:h-8 sm:px-3 sm:text-xs",
        md: "h-11 px-4 text-[0.95rem] sm:h-10 sm:text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "size-11 sm:size-10",
        "icon-sm": "size-10 sm:size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }: ButtonProps) {
  if (asChild) {
    // Slot requires exactly one child; the loading indicator is not supported here.
    return (
      <Slot.Root data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
