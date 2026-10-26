import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const ANNOUNCE_DEFAULT = {
  highlight: "Ook van makers zonder bedrijf.",
  text: "Geen btw-nummer nodig om te beginnen.",
};

type AnnounceProps = {
  /* Vetgedrukt deel; blijft op mobiel staan. */
  highlight?: string;
  /* Tweede zin; valt op smalle schermen weg (.hide-sm). */
  text?: string;
  href?: string | null;
};

/* Aankondigingsbalk (.announce). Tekst komt uit Directus-instellingen,
   met de tekst uit het ontwerp als standaard. */
export function Announce({ highlight = ANNOUNCE_DEFAULT.highlight, text = ANNOUNCE_DEFAULT.text, href = null }: AnnounceProps) {
  const body = (
    <>
      <Icon name="hand" size={16} />
      <span>
        <b>{highlight}</b>
        {text ? <> <span className="hide-sm">{text}</span></> : null}
      </span>
    </>
  );
  return href ? (
    <Link className="announce" href={href}>{body}</Link>
  ) : (
    <div className="announce">{body}</div>
  );
}
