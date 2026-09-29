"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme) {
  return theme === "system" ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ww-theme");
    if (saved === "light" || saved === "dark" || saved === "system") {
      setThemeState(saved);
      document.documentElement.classList.toggle("dark", resolveTheme(saved) === "dark");
    } else {
      document.documentElement.classList.toggle("dark", getSystemTheme() === "dark");
    }

    const listener = (e) => {
      if (localStorage.getItem("ww-theme") === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const setTheme = (next) => {
    localStorage.setItem("ww-theme", next);
    setThemeState(next);
    document.documentElement.classList.toggle("dark", resolveTheme(next) === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved: mounted ? resolveTheme(theme) : "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}
