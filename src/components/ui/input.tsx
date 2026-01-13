"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Input component with glass morphism styling
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "minimal";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-white/10 border-white/20 focus:border-pace-400 focus:bg-white/15",
      glass:
        "bg-white/5 backdrop-blur-xl border-white/10 focus:border-white/30 focus:bg-white/10",
      minimal:
        "bg-transparent border-transparent border-b-white/20 rounded-none focus:border-b-pace-400",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border px-4 py-3 text-base text-white placeholder:text-white/40 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-pace-400/30 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };

