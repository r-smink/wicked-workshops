"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import type { ShellData } from "@/lib/shell-data";

const LINKS = [
  { href: "/zoeken", label: "Ontdek", icon: "compass" },
  { href: "/inspiratie", label: "Inspiratie", icon: "spark" },
  { href: "/bedrijven", label: "Voor bedrijven", icon: "people" },
  { href: "/cadeaubon", label: "Cadeaubon", icon: "gift" },
] as const;

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  menu: Omit<ShellData, "announce">;
  loggedIn: boolean;
};

/* Menu achter de burger (onder 1200px). De referentie toont alleen de
   knop; dit paneel gebruikt de stijl van het megamenu. Geen position:fixed,
   want dat werkt niet binnen .stage (container). */
export function MobileMenu({ open, onClose, menu, loggedIn }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className="mnav" hidden={!open}>
      <ul className="mnav-links">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href}><Icon name={l.icon} size={19} />{l.label}</Link>
          </li>
        ))}
      </ul>
      <p className="mm-kop">Categorieën</p>
      <div className="mnav-cats">
        {menu.categories.map((c) => (
          <Link key={c.slug} className="mm-cat" href={`/categorie/${c.slug}`}>
            <span className="mm-th">{c.image ? <img src={c.image} alt="" width={42} height={42} loading="lazy" /> : null}</span>
            <span><b>{c.name}</b></span>
          </Link>
        ))}
      </div>
      {!loggedIn && (
        <div className="mnav-acts">
          <ButtonLink variant="line" size="sm" href="/word-workshopgever">Word workshopgever</ButtonLink>
        </div>
      )}
    </div>
  );
}
