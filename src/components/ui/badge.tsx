"use client";

import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge component for labels and status indicators
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.1] text-white border border-white/[0.2]",
        work: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
        rest: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
        social: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
        movement: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        error: "bg-red-500/20 text-red-300 border border-red-500/30",
        info: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
      },
      size: {
        default: "text-xs px-3 py-1",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-sm px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
