/* Opmaak van alle mails (docs/05 §11): onderwerp, voornaam-aanhef, 1 knop,
   waar nodig een veiligheidsregel. Plat HTML met inline stijl, plus een
   platte-tekstvariant. Geen afbeeldingen, zodat de mail ook zonder
   geladen plaatjes leesbaar is. */

export type Mail = { subject: string; text: string; html: string };

export type Block =
  | { p: string }
  | { box: string[]; title?: string }
  | { button: { label: string; url: string } }
  | { small: string };

const BRAND = "#1d1d1b";
const ACCENT = "#c8442f";

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function greeting(firstName?: string | null): string {
  const name = String(firstName || "").trim().split(/\s+/)[0];
  return name ? `Hoi ${name},` : "Hoi,";
}

/* Bouwt HTML en tekst uit dezelfde blokken, zodat ze niet uit elkaar lopen. */
export function render(subject: string, firstName: string | null | undefined, blocks: Block[]): Mail {
  const hello = greeting(firstName);
  const textParts: string[] = [hello, ""];
  const htmlParts: string[] = [`<p style="margin:0 0 16px">${esc(hello)}</p>`];

  for (const block of blocks) {
    if ("p" in block) {
      textParts.push(block.p, "");
      htmlParts.push(`<p style="margin:0 0 16px">${esc(block.p)}</p>`);
    } else if ("box" in block) {
      if (block.title) textParts.push(block.title.toUpperCase());
      textParts.push(...block.box, "");
      htmlParts.push(
        `<div style="margin:0 0 20px;padding:14px 16px;border:1px solid #e3ded6;border-radius:10px;background:#faf8f5">` +
          (block.title ? `<p style="margin:0 0 6px;font-weight:700">${esc(block.title)}</p>` : "") +
          block.box.map((line) => `<p style="margin:0 0 4px">${esc(line)}</p>`).join("") +
          `</div>`,
      );
    } else if ("button" in block) {
      textParts.push(`${block.button.label}: ${block.button.url}`, "");
      htmlParts.push(
        `<p style="margin:8px 0 24px"><a href="${esc(block.button.url)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:${ACCENT};color:#fff;font-weight:700;text-decoration:none">${esc(block.button.label)}</a></p>`,
      );
    } else if ("small" in block) {
      textParts.push(block.small, "");
      htmlParts.push(`<p style="margin:0 0 12px;font-size:13px;color:#6b665f">${esc(block.small)}</p>`);
    }
  }

  textParts.push("Groet,", "Wicked Workshops");
  htmlParts.push(`<p style="margin:24px 0 0">Groet,<br>Wicked Workshops</p>`);

  const html =
    `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>${esc(subject)}</title></head>` +
    `<body style="margin:0;padding:24px;background:#f3efe9;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:${BRAND}">` +
    `<div style="max-width:560px;margin:0 auto;padding:28px;background:#fff;border-radius:14px">` +
    htmlParts.join("") +
    `</div></body></html>`;

  return { subject, text: textParts.join("\n"), html };
}
