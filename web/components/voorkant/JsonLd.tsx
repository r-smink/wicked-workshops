import { ldJson } from "@/lib/voorkant/seo";

type Json = Record<string, unknown>;

/* Gestructureerde data als <script type="application/ld+json">. Lege items
   (null) vallen weg. */
export function JsonLd({ data }: { data: (Json | null)[] | Json | null }) {
  const list = (Array.isArray(data) ? data : [data]).filter((d): d is Json => Boolean(d));
  if (!list.length) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(list.length === 1 ? list[0]! : list) }} />;
}
