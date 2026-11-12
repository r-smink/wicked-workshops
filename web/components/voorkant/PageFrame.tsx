import type { ReactNode } from "react";
import { getShellData } from "@/lib/shell-data";
import { Announce } from "@/components/shell/Announce";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";

export type PageId = "home" | "cat" | "detail" | "aanbieder" | "maker" | "locatie" | "hulp" | "contact" | "inloggen";

/* Kader van een pagina uit het ontwerp: dezelfde wrapper (.page met
   data-concept en het id) als in wicked-handoff/design/index.html, zodat de
   ontwerp-CSS (styles/voorkant.css) 1 op 1 geldt. Kop, megamenu en voet zijn
   de gedeelde shell-componenten. */
export async function PageFrame({ id, children }: { id: PageId; children: ReactNode }) {
  const { announce, ...menu } = await getShellData();
  return (
    <div className="page" data-concept="def" id={`p-${id}`}>
      {announce ? <Announce {...announce} /> : <Announce />}
      <Header menu={menu} />
      <main id="inhoud">{children}</main>
      <Footer />
    </div>
  );
}
