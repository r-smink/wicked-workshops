import type { ReactNode } from "react";
import { getShellData, type ShellData } from "@/lib/shell-data";
import { Announce } from "./Announce";
import { Header, type HeaderAccount } from "./Header";
import { Footer } from "./Footer";

type SiteShellProps = {
  children: ReactNode;
  /* Alleen op ingelogde pagina's meegeven; zie Header. */
  account?: HeaderAccount | null;
  /* Vaste data in plaats van Directus (alleen voor /dev/shell). */
  data?: ShellData;
};

/* De gedeelde shell (server): aankondiging, header met megamenu, inhoud en
   footer. Data komt uit Directus via lib/shell-data. */
export async function SiteShell({ children, account, data }: SiteShellProps) {
  const { announce, ...menu } = data ?? (await getShellData());
  return (
    <>
      {announce ? <Announce {...announce} /> : <Announce />}
      <Header menu={menu} account={account} />
      <main id="inhoud">{children}</main>
      <Footer />
    </>
  );
}
