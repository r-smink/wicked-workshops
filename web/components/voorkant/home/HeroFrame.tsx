"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* De .van-a rond de hero. Op brede schermen (vanaf 900 px) vult de hero de
   rest van het venster, tussen 540 en 900 px hoog, zoals het ontwerpscript. */
export function HeroFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pag = ref.current;
    const hero = pag?.querySelector<HTMLElement>(".home-a-hero");
    if (!pag || !hero) return;
    const height = () => {
      if (window.innerWidth < 900) {
        pag.style.removeProperty("--home-a-hero");
        return;
      }
      const top = hero.getBoundingClientRect().top + window.scrollY;
      const h = Math.max(540, Math.min(900, window.innerHeight - top));
      pag.style.setProperty("--home-a-hero", `${h}px`);
    };
    height();
    window.addEventListener("resize", height);
    return () => window.removeEventListener("resize", height);
  }, []);
  return (
    <div className="van-a" ref={ref}>
      {children}
    </div>
  );
}
