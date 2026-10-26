"use client";

import Link from "next/link";
import { Icon, Photo } from "@/components/ui";
import { useDemoMode } from "@/components/DemoModeProvider";
import { DEMO_CATEGORIES } from "@/lib/demo-data";
import { Section, SectionHead } from "@/components/blocks/shared";

const DEMO_IMAGE = Object.fromEntries(DEMO_CATEGORIES.map((c) => [c.slug, c.image]));

/* Categorieën. Varianten: tiles (beeldtegels), list (rij met klein beeld),
   rail (horizontaal scrollend). */
export default function CategoryGrid({ block }) {
  const { demoMode } = useDemoMode();
  const categories = block.data?.categories || [];
  const variant = block.variant || "tiles";
  if (!categories.length) return null;

  const image = (c) => c.image || (demoMode ? DEMO_IMAGE[c.slug] : null);
  /* Geen telling tonen als Directus er (nog) geen heeft, in plaats van "0+". */
  const count = (c) => (c.workshop_count > 0 ? `${c.workshop_count} workshops` : c.workshop_count == null && c.count && c.count !== "0+" ? `${c.count} workshops` : "");

  return (
    <Section block={block} className={`wb-cats wb-cats--${variant}`} fields="type,variant,title,body,item_limit,cta_label,cta_to">
      <SectionHead block={block} />
      {variant === "list" ? (
        <ul className="wb-catlist">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/categorie/${c.slug}`}>
                <span className="wb-catlist-th"><Photo src={image(c)} icon={c.icon} ratio="1/1" size={20} /></span>
                <span><b>{c.name}</b><span>{count(c)}</span></span>
                <Icon name="right" size={18} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={variant === "rail" ? "wb-rail wb-rail--cats" : "ww-catgrid wb-catgrid"}>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categorie/${c.slug}`} className="ww-catcard">
              <Photo src={image(c)} icon={c.icon} />
              <strong>{c.name}</strong>
              <span>{count(c)}</span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
