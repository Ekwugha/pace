"use client";

import { forwardRef, HTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * GlassCard - A futuristic glassmorphism card component
 * Provides a frosted glass effect with subtle animations
 */

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "bordered";
  hover?: boolean;
  glow?: boolean;
  animated?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      hover = true,
      glow = false,
      animated = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300";

    const variantStyles = {
      default:
        "bg-white/[0.08] border border-white/[0.15] shadow-glass-sm",
      elevated:
        "bg-white/[0.12] border border-white/[0.2] shadow-glass",
      subtle:
        "bg-white/[0.05] border border-white/[0.1]",
      bordered:
        "bg-transparent border-2 border-white/[0.25]",
    };

    const hoverStyles = hover
      ? "hover:bg-white/[0.15] hover:border-white/[0.25] hover:shadow-glass"
      : "";

    const glowStyles = glow
      ? "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-sky-400/20 before:to-purple-500/20 before:blur-xl before:-z-10"
      : "";

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            baseStyles,
            variantStyles[variant],
            hoverStyles,
            glowStyles,
            className
          )}
          {...(props as HTMLMotionProps<"div">)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles,
          glowStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
export type { GlassCardProps };
