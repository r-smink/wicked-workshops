"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "./Logo";
import { Megamenu } from "./Megamenu";
import { MobileMenu } from "./MobileMenu";
import type { ShellData } from "@/lib/shell-data";

export type HeaderAccount = {
  initial: string;
  label: "Mijn account" | "Mijn dashboard";
  href: string;
};

type HeaderProps = {
  menu: Omit<ShellData, "announce">;
  /* Vanaf de server meegegeven (ingelogde pagina's). Ontbreekt het, dan
     zoekt de header het zelf op, zodat publieke pagina's statisch blijven. */
  account?: HeaderAccount | null;
};

export const NAV_LINKS = [
  { href: "/zoeken", label: "Ontdek", icon: "compass" },
  { href: "/inspiratie", label: "Inspiratie", icon: "spark" },
  { href: "/bedrijven", label: "Voor bedrijven", icon: "people" },
  { href: "/cadeaubon", label: "Cadeaubon", icon: "gift" },
] as const;

type MeResponse = { user: { first_name?: string; email?: string; is_provider?: boolean } | null };

function useAccount(given: HeaderAccount | null | undefined): HeaderAccount | null {
  const [account, setAccount] = useState<HeaderAccount | null>(given ?? null);
  useEffect(() => {
    if (given !== undefined) return;
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
      .then((data) => {
        const u = data?.user;
        if (cancelled || !u) return;
        const name = u.first_name || u.email || "?";
        setAccount({
          initial: name.charAt(0).toUpperCase(),
          label: u.is_provider ? "Mijn dashboard" : "Mijn account",
          /* Tot fase 3 en 5 gaan beide naar het bestaande dashboard. */
          href: "/dashboard",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [given]);
  return given !== undefined ? given : account;
}

/* Header (.head) uit de referentie: logo, zoekveld, menu met megamenu,
   knoppen of account, en de burger voor smalle schermen. */
export function Header({ menu, account: givenAccount }: HeaderProps) {
  const account = useAccount(givenAccount);
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const uid = useId();
  const menuId = `menu-${uid}`;
  const searchId = `q-${uid}`;

  /* Sluiten bij navigeren, Escape en klik buiten de header. */
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [megaOpen]);

  return (
    <header className="head" ref={headerRef}>
      <Link className="logo" href="/" aria-label="Wicked Workshops, naar de homepage">
        <LogoMark />
      </Link>

      <form className="head-search" role="search" action="/zoeken" method="get">
        <Icon name="search" size={19} style={{ color: "var(--text-3)" }} />
        <label htmlFor={searchId} className="sr-only">Zoek een workshop</label>
        <input id={searchId} name="q" type="search" placeholder="Keramiek in Utrecht…" />
        <button type="submit" aria-label="Zoeken"><Icon name="arrow" size={17} /></button>
      </form>

      <nav className="nav" aria-label="Hoofdmenu">
        <button type="button" aria-expanded={megaOpen} aria-controls={menuId} onClick={(e) => { e.stopPropagation(); setMegaOpen((o) => !o); }}>
          <Icon name="grid" size={19} />
          Categorieën
          <Icon name="chev" size={15} style={{ color: "var(--text-3)" }} />
        </button>
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={pathname?.startsWith(l.href) ? "page" : undefined}>
            <Icon name={l.icon} size={19} />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="head-end">
        {account ? (
          <Link className="head-acc" href={account.href}>
            <span className="head-av" aria-hidden="true">{account.initial}</span>
            <span className="head-acc-t">{account.label}</span>
          </Link>
        ) : (
          <>
            <ButtonLink variant="line" size="sm" href="/word-workshopgever">Word workshopgever</ButtonLink>
            <ButtonLink size="sm" href="/inloggen">Inloggen</ButtonLink>
          </>
        )}
        <button className="burger" type="button" aria-label={mobileOpen ? "Menu sluiten" : "Menu openen"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
          <Icon name="burger" size={22} />
        </button>
      </div>

      <Megamenu id={menuId} open={megaOpen} menu={menu} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} menu={menu} loggedIn={Boolean(account)} />
    </header>
  );
}
