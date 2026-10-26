import BuilderPage, { builderPageMetadata } from "@/components/BuilderPage";

export const revalidate = 60;

/* Builderpagina: blokken uit Directus (pages, slug "word-workshopgever"), met de
   startinhoud uit lib/page-templates.json zolang er niets gepubliceerd is. */
export function generateMetadata() {
  return builderPageMetadata("word-workshopgever");
}

export default function Page() {
  return <BuilderPage slug="word-workshopgever" />;
}
