"use client";

import { useEffect } from "react";
import { apply } from "@directus/visual-editing";

/* ===========================================================================
   VisualEditing — brug naar de Directus Visual Editor.

   Rendert niets zichtbaars. De library scant het DOM op [data-directus]
   attributen en verbindt ze via postMessage met de Directus-app zodra de
   pagina in de Visual Editor-iframe staat. Buiten die iframe doet apply()
   niets (hij returnt undefined), dus dit is veilig om altijd te laden.

   directusUrl komt als prop binnen vanuit een server-component, zodat er
   geen NEXT_PUBLIC_-envvar nodig is.
   =========================================================================== */
export default function VisualEditing({ directusUrl }) {
  useEffect(() => {
    if (!directusUrl) return;
    let controls;
    apply({ directusUrl }).then((c) => { controls = c; }).catch(() => {});
    return () => controls?.remove?.();
  }, [directusUrl]);
  return null;
}
