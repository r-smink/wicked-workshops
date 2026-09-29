"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ww-demo-mode";
const DemoModeContext = createContext({ demoMode: false, mounted: false, setDemoMode: () => {} });

export function useDemoMode() {
  return useContext(DemoModeContext);
}

export function DemoModeProvider({ children }) {
  const [demoMode, setDemoModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const active = localStorage.getItem(STORAGE_KEY) === "true";
    setDemoModeState(active);
    document.documentElement.dataset.demo = active ? "true" : "false";
    setMounted(true);
  }, []);

  const setDemoMode = (active) => {
    const next = Boolean(active);
    localStorage.setItem(STORAGE_KEY, String(next));
    document.documentElement.dataset.demo = next ? "true" : "false";
    setDemoModeState(next);
  };

  return (
    <DemoModeContext.Provider value={{ demoMode, mounted, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}
