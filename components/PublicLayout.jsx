"use client";

import { usePathname } from "next/navigation";
import { Header, Footer, BottomNav } from "@/components/layout";

/* De publieke schil (header + footer + mobiele onderste balk) voor alle
   routes die geen auth- of dashboard-scherm zijn. Die hebben hun eigen
   layout zonder deze navigatie. */
export default function PublicLayout({ children }) {
  const pathname = usePathname() || "/";
  const route = pathname === "/" ? "home" : pathname.startsWith("/zoeken") || pathname.startsWith("/categorie") ? "listing" : pathname.startsWith("/inspiratie") ? "blog" : "";
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BottomNav route={route} />
    </>
  );
}
