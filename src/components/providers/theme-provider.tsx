"use client";

import { useEffect } from "react";
import { useSettings } from "@/store/useStore";

/**
 * ThemeProvider - Manages dark/light theme based on user preference
 * Syncs with Zustand store and applies theme class to document
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        root.classList.toggle("dark", mediaQuery.matches);
      };
      handleChange();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    
    root.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  return <>{children}</>;
}

