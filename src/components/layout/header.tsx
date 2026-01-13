"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Command,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  Clock,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useStore, useNavigation, useSettings } from "@/store/useStore";

/**
 * Header - Main navigation header with branding and quick actions
 */

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigation = useNavigation();
  const settings = useSettings();
  const { setCurrentView, updateSettings } = useStore();

  const navItems = [
    { id: "input", label: "Tasks", icon: ListTodo },
    { id: "schedule", label: "Schedule", icon: Clock },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ] as const;

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <GlassCard
        variant="elevated"
        className="mx-4 mt-4 px-4 py-3 md:px-6 rounded-2xl"
        hover={false}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center shadow-glow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-400 to-purple-500 blur-lg -z-10"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Pace
              </h1>
              <p className="text-xs text-white/50 hidden sm:block">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={navigation.currentView === item.id ? "glass" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(item.id)}
                className="gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenCommandPalette}
              className="hidden sm:flex gap-2 text-white/60"
            >
              <Command className="w-4 h-4" />
              <span className="text-xs">⌘K</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              className="text-white/60 hover:text-white"
            >
              {settings.theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/60 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={
                      navigation.currentView === item.id ? "glass" : "ghost"
                    }
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start gap-3"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </GlassCard>
    </header>
  );
}
