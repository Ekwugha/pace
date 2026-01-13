"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Button variants using class-variance-authority
 * Provides consistent, accessible button styles across the app
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500 text-white hover:bg-sky-600 shadow-glow-sm hover:shadow-glow-md",
        secondary:
          "bg-white/[0.08] text-white hover:bg-white/[0.15] border border-white/[0.15] backdrop-blur-sm",
        ghost:
          "text-white/70 hover:text-white hover:bg-white/[0.1]",
        outline:
          "border-2 border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-white",
        destructive:
          "bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm",
        success:
          "bg-emerald-500/80 text-white hover:bg-emerald-600 backdrop-blur-sm",
        glass:
          "bg-white/[0.08] text-white backdrop-blur-xl border border-white/[0.15] hover:bg-white/[0.15] hover:border-white/[0.25]",
        glow:
          "bg-gradient-to-r from-sky-400 to-purple-500 text-white shadow-glow-md hover:shadow-glow-lg hover:brightness-110",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animated?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, animated = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    if (animated) {
      return (
        <motion.button
          ref={ref}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(buttonVariants({ variant, size, className }))}
          {...(props as HTMLMotionProps<"button">)}
        />
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
