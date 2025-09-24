"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type ThemeToggleProps = {
  variant?: "pill" | "icon";
  className?: string;
};

export function ThemeToggle({ variant = "pill", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    const iconClasses = isDark
      ? "border-white/30 bg-slate-900/80 text-slate-100"
      : "border-slate-300 bg-white/85 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.12)]";
    const focusOffset = isDark ? "focus-visible:ring-offset-slate-900" : "focus-visible:ring-offset-white";

    return (
      <button
        type="button"
        aria-label="Toggle theme"
        aria-pressed={!isDark}
        onClick={toggleTheme}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 ${focusOffset} ${iconClasses} ${className}`.trim()}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    );
  }

  const pillClasses = isDark
    ? "border-white/25 bg-white/10"
    : "border-slate-200 bg-white/85 shadow-[0_12px_22px_rgba(2,5,10,0.12)]";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={!isDark}
      onClick={toggleTheme}
      className={`relative inline-flex h-12 w-32 items-center justify-between overflow-hidden rounded-full border px-5 transition-all duration-500 backdrop-blur-lg ${pillClasses} ${className}`.trim()}
    >
      <Moon
        className={`relative z-10 h-4 w-4 transition-colors duration-500 ${
          isDark ? "text-slate-100" : "text-slate-400"
        }`}
        aria-hidden="true"
      />
      <Sun
        className={`relative z-10 h-4 w-4 transition-colors duration-500 ${
          isDark ? "text-slate-500" : "text-slate-700"
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">Toggle theme</span>
      <span
        className={`absolute top-1 h-10 w-14 rounded-full transition-all duration-500 ${
          isDark
            ? "left-1 bg-slate-900/85 shadow-[0_12px_30px_rgba(15,23,42,0.45)]"
            : "left-[calc(100%-3.5rem-0.25rem)] bg-white shadow-[0_12px_22px_rgba(2,5,10,0.15)]"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

export default ThemeToggle;



