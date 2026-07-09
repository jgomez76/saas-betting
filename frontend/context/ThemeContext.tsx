"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* =========================
   🎨 THEMES
========================= */

export type Theme =
  | "midnight"
  | "stadium"
  | "light"
  | "carbon"
  | "sapphire"
  | "aurora"
  | "crimson"
  | "heritage";

export const VALID_THEMES: Theme[] = [
  "midnight",
  "stadium",
  "light",
  "carbon",
  "sapphire",
  "aurora",
  "crimson",
  "heritage",
];

/* =========================
   📦 CONTEXT
========================= */

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

/* =========================
   🚀 PROVIDER
========================= */

export function ThemeProvider({ children }: { children: React.ReactNode }) {

  /* ✅ INIT SIN EFFECT */
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "midnight";

    const saved = localStorage.getItem("theme");

    if (saved && VALID_THEMES.includes(saved as Theme)) {
      return saved as Theme;
    }

    return "midnight";
  });

  /* ---------- APPLY THEME ---------- */
  useEffect(() => {
    // console.log("THEME EFECT RUNNING");
    const root = document.documentElement;

    VALID_THEMES.forEach((t) => root.classList.remove(t));

    root.classList.add(theme);

    localStorage.setItem("theme", theme);
    // console.log("HTML CLASS:", root.className);

  }, [theme]);

  /* ---------- SETTER ---------- */
  const setTheme = (t: Theme) => {
    setThemeState((prev) => (prev === t ? prev : t));
  };

  /* ---------- PROVIDER ---------- */
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* =========================
   🧩 HOOK
========================= */

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return ctx;
}