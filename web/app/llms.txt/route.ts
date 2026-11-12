import { getCategories, getWorkshopCards } from "@/lib/voorkant/data";
import { routes } from "@/lib/routes";
import { abs } from "@/lib/voorkant/seo";
import { euro } from "@/lib/voorkant/format";

export const revalidate = 3600;

/* /llms.txt (llmstxt.org): korte, feitelijke wegwijzer voor taalmodellen. */
export async function GET() {
  const [cards, categories] = await Promise.all([getWorkshopCards({ limit: 200 }), getCategories()]);
  const lines = [
    "# Wicked Workshops",
    "",
    "> De Nederlandse marktplaats voor workshops en unieke uitjes, ook van makers zonder bedrijf. Boekingskosten voor deelnemers zijn altijd EUR 0. Tijdens de pilot betaal je niets voordat een datum doorgaat.",
    "",
    "Elke datum heeft een stand: open (minimum nog niet gehaald), gaat door (minimum gehaald of geen minimum), gaat niet door (minimum niet gehaald op het beslismoment, je krijgt een andere datum aangeboden) of vol.",
    "",
    "## Pagina's",
    `- [Workshops geven](${abs(routes.giver)}): zo word je workshopgever, met of zonder bedrijf`,
    `- [Ruimte gezocht](${abs(routes.room)}): ruimtes die vaak leeg staan, zoeken of aanbieden`,
    `- [Hulp](${abs(routes.help)}): boeken, het minimum en het beslismoment, annuleren, de pilot`,
    `- [Contact](${abs(routes.contact)})`,
    "",
    "## Categorieen",
    ...categories.map((c) => `- [${c.name}](${abs(routes.category(c.slug))})`),
    "",
    "## Workshops",
    ...cards.map((w) => `- [${w.title}](${abs(routes.workshop(w.slug))}): ${[w.city?.name, w.duration, w.price != null ? `EUR ${euro(w.price)} p.p.` : ""].filter(Boolean).join(", ")}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
