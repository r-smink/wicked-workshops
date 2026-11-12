import type { SessionView, WorkshopCard } from "@/lib/voorkant/data";
import { euro, plekken, rating, standAttr } from "@/lib/voorkant/format";

/* Kleine stukken die de kaarten op de homepage delen. */

export const SIZES = "(max-width: 860px) 100vw, 50vw";

/* Beeld uit Directus loopt via /api/proxy; dat laten we ongemoeid. */
export const unoptimized = (src: string) => src.startsWith("/api/");

/* "Utrecht, Wittevrouwen · 2 uur" */
export function whereLine(w: WorkshopCard): string {
  const place = [w.city?.name, w.neighbourhood].filter(Boolean).join(", ");
  return [place, w.duration].filter(Boolean).join(" · ");
}

/* "+2 datums" naast de getoonde datum, of niets. */
export function moreDates(w: WorkshopCard): string | null {
  const n = w.sessions.length - 1;
  return n > 0 ? `+${n} ${n === 1 ? "datum" : "datums"}` : null;
}

/* Wat er onder de stand staat: plekken, beslismoment of de volgende datum. */
export function standSub(w: WorkshopCard, s: SessionView): string | null {
  const attr = standAttr(s.stand);
  if (attr === "vol") {
    const next = w.sessions.find((o) => o.startsAt > s.startsAt && o.stand !== "vol");
    return next ? `volgende: ${next.day}, ${next.start}` : null;
  }
  if (attr === "open" && s.decisionLabel) return `beslismoment ${s.decisionLabel}`;
  return `nog ${plekken(s.free)}`;
}

export function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href="#i-arrow" />
    </svg>
  );
}

export function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href="#i-check" />
    </svg>
  );
}

export function Rate({ w }: { w: WorkshopCard }) {
  if (w.rating == null || !w.ratingCount) return null;
  return (
    <span className="rate">
      <span className="stars" aria-hidden="true">
        ★
      </span>
      {rating(w.rating)} <small>({w.ratingCount})</small>
    </span>
  );
}

export function Price({ w }: { w: WorkshopCard }) {
  if (w.price == null) return null;
  return (
    <span className="wk-price">
      <small>per persoon</small>
      <b>€{euro(w.price)}</b>
    </span>
  );
}

export const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
