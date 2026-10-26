import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ShellData } from "@/lib/shell-data";

type MegamenuProps = {
  id: string;
  open: boolean;
  menu: Omit<ShellData, "announce">;
};

/* Megamenu (.mm): 12 categorieen met thumbnail en aantal, gelegenheden,
   plaatsen en "Verras me". Op smalle schermen verbergt de CSS het (de burger
   neemt het over). */
export function Megamenu({ id, open, menu }: MegamenuProps) {
  return (
    <div className="mm" id={id} hidden={!open}>
      <div className="mm-in">
        <div className="mm-cats">
          {menu.categories.map((c) => (
            <Link key={c.slug} className="mm-cat" href={`/categorie/${c.slug}`}>
              <span className="mm-th">{c.image ? <img src={c.image} alt="" width={42} height={42} loading="lazy" /> : null}</span>
              <span>
                <b>{c.name}</b>
                {c.count ? <span>{c.count} workshops</span> : null}
              </span>
            </Link>
          ))}
        </div>
        <div className="mm-side">
          <p className="mm-kop">Voor welke gelegenheid</p>
          <ul>
            {menu.occasions.map((o) => (
              <li key={o.slug}><Link href={`/zoeken?gelegenheid=${o.slug}`}>{o.name}</Link></li>
            ))}
          </ul>
          <p className="mm-kop">In welke plaats</p>
          <ul>
            {menu.places.map((p) => (
              <li key={p.slug}><Link href={`/zoeken?plaats=${p.slug}`}>{p.name}</Link></li>
            ))}
            <li><Link href="/zoeken">{menu.placeCount ? `Alle ${menu.placeCount}` : "Alle plaatsen"}</Link></li>
          </ul>
          <Link className="mm-verras" href="/zoeken?verras=1">
            <Icon name="spark" size={24} />
            <span><b>Verras me</b><span>Eén workshop, door ons gekozen</span></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
