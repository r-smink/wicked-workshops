"use client";

import Link from "next/link";
import { Icon, Photo } from "@/components/ui";
import { useDemoMode } from "@/components/DemoModeProvider";
import { sessionStanding } from "@/lib/session-standing";

/* ===========================================================================
   Gedeelde onderdelen voor de page builder-blokken.
   =========================================================================== */

/* Visual Editor: maakt het blok bewerkbaar op de page_blocks-collectie.
   Startinhoud uit lib/page-templates.json heeft geen id en krijgt niets. */
export function blockAttr(block, fields, mode = "drawer") {
  if (!block?.id) return {};
  return { "data-directus": `collection:page_blocks;item:${block.id};fields:${fields};mode:${mode}` };
}

const STYLE_CLASS = { cloud: "wb-sec--cloud", ink: "wb-sec--ink", coral: "wb-sec--coral" };

/* Sectie-schil: achtergrond (style), ruimte boven/onder, anker. */
export function Section({ block, className = "", fields = "", children, bare = false }) {
  const cls = [
    "wb-sec",
    STYLE_CLASS[block.style] || "",
    block.padding_top ? `wb-pt-${block.padding_top}` : "",
    block.padding_bottom ? `wb-pb-${block.padding_bottom}` : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <section id={block.anchor || undefined} className={cls} {...blockAttr(block, fields || `type,title,body,style,variant`)}>
      {bare ? children : <div className="ww-wrap">{children}</div>}
    </section>
  );
}

export function isOnBand(block) {
  return block.style === "ink";
}

/* Kop van een sectie: eyebrow, titel, intro en optioneel een tekstlink rechts. */
export function SectionHead({ block, link = true, center = false, as: H = "h2" }) {
  if (!block.title && !block.body && !block.eyebrow) return null;
  return (
    <div className={`wb-head${center ? " wb-head--center" : ""}`}>
      <div>
        {block.eyebrow && <p className="ww-eyebrow">{block.eyebrow}</p>}
        {block.title && <H {...blockAttr(block, "title", "popover")}>{block.title}</H>}
        {block.body && <p className="wb-lead" {...blockAttr(block, "body", "popover")}>{block.body}</p>}
      </div>
      {link && block.cta_label && block.cta_to && (
        <TextLink to={block.cta_to}>{block.cta_label}</TextLink>
      )}
    </div>
  );
}

function isInternal(to) {
  return to.startsWith("/") || to.startsWith("#");
}

/* Link naar een interne route, anker of externe URL. */
export function SmartLink({ to, className, children, ...rest }) {
  if (!to) return <span className={className}>{children}</span>;
  if (isInternal(to)) return <Link href={to} className={className} {...rest}>{children}</Link>;
  return <a href={to} className={className} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
}

export function CtaButton({ to, label, variant = "primary", size = "lg", icon }) {
  if (!label || !to) return null;
  return (
    <SmartLink to={to} className={`ww-btn ww-btn--${variant} ww-btn--${size}`}>
      {label}
      {icon && <Icon name={icon} size={16} />}
    </SmartLink>
  );
}

export function TextLink({ to, children }) {
  return (
    <SmartLink to={to} className="wb-textlink">
      {children}
      <Icon name="arrow" size={16} />
    </SmartLink>
  );
}

/* Primaire en secundaire knop van een blok. Op een donkere band worden de
   varianten omgedraaid, zodat ze leesbaar blijven. */
export function Actions({ block, primary = "coral", center = false }) {
  const band = isOnBand(block);
  if (!block.cta_label && !block.cta_secondary_label) return null;
  return (
    <div className={`wb-actions${center ? " wb-actions--center" : ""}`}>
      <CtaButton to={block.cta_to} label={block.cta_label} variant={primary} />
      <CtaButton to={block.cta_secondary_to} label={block.cta_secondary_label} variant={band ? "inverse" : "outline"} />
    </div>
  );
}

/* Beeld met de bestaande placeholder. In demo-modus vult een tijdelijk
   conceptbeeld uit /public/demo de lege plek, net als op de rest van de site. */
export function BlockImage({ src, alt = "", ratio = "4/3", demo, icon = "spark", className = "" }) {
  const { demoMode } = useDemoMode();
  const url = src || (demoMode && demo ? `/demo/${demo}.jpg` : null);
  return (
    <div className={`wb-img ${className}`}>
      <Photo src={url} alt={alt} ratio={ratio} icon={icon} />
    </div>
  );
}

/* Stand van een datum als pil: "Gaat door", "3 van 4 nodig", "Vol". */
export function StandingPill({ session, standing: given, withDetail = true }) {
  const standing = given || sessionStanding(session);
  return (
    <span className={`wb-stand wb-stand--${standing.key}`}>
      <b>{standing.label}</b>
      {withDetail && standing.detail && <span>{standing.detail}</span>}
    </span>
  );
}

/* De plekkenrij: elke stip een plek, gevuld is aangemeld, het streepje
   staat na het minimum. */
export function SeatDots({ capacity, taken, min, label = true }) {
  if (!capacity) return null;
  const dots = Array.from({ length: Math.min(capacity, 24) }, (_, i) => i);
  return (
    <div className="wb-seats" role={label ? "img" : undefined}
      aria-label={label ? `${taken} van ${capacity} plekken bezet${min ? `, minimum ${min}` : ""}` : undefined}
      aria-hidden={label ? undefined : true}>
      {dots.map((i) => (
        <i key={i} data-on={i < taken ? "true" : "false"} data-min={min && i === min - 1 ? "true" : "false"} />
      ))}
    </div>
  );
}
