import { SiteShell } from "@/components/shell/SiteShell";

/* Publieke layout (server): de gedeelde shell uit components/shell, met
   aankondiging, header, megamenu en footer volgens reference/. */
export default async function PublicLayout({ children }) {
  return <SiteShell>{children}</SiteShell>;
}
