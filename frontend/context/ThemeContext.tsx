"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "classic" | "modern" | "futuristic";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";

    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
    });

  // 🔥 aplicar al HTML
  useEffect(() => {
    document.documentElement.classList.remove(
      "dark",
      "light",
      "classic",
      "modern",
      "futuristic"
    );

    document.documentElement.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}