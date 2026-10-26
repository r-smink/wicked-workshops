import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/shell/SiteShell";
import type { HeaderAccount } from "@/components/shell/Header";
import { REFERENCE_SHELL } from "@/lib/shell-fixture";
import { devRoutesEnabled } from "@/lib/dev-routes";

export const metadata: Metadata = { title: "Shell", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ACCOUNTS: Record<string, HeaderAccount> = {
  deelnemer: { initial: "S", label: "Mijn account", href: "/mijn-account" },
  workshopgever: { initial: "L", label: "Mijn dashboard", href: "/workshopgever" },
};

type Props = { searchParams: Promise<{ ingelogd?: string; fixture?: string }> };

/* Lege pagina met alleen de shell, voor de visuele vergelijking met
   reference/pages/*.html (tests/e2e/shell.spec.ts).
   ?ingelogd=deelnemer|workshopgever  ingelogde header
   ?fixture=ref                       voorbeelddata uit de referentie */
export default async function ShellPage({ searchParams }: Props) {
  if (!devRoutesEnabled()) notFound();
  const { ingelogd, fixture } = await searchParams;
  const account = ingelogd ? ACCOUNTS[ingelogd] ?? null : null;
  return (
    <SiteShell account={account} data={fixture === "ref" ? REFERENCE_SHELL : undefined}>
      <div className="wrap" style={{ minHeight: 480 }} />
    </SiteShell>
  );
}
