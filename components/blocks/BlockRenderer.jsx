"use client";

import { BLOCKS } from "@/components/blocks/registry";
import { renderBlock as renderLegacyBlock } from "@/components/pages/StaticPage";

/* ===========================================================================
   BlockRenderer — rendert page_blocks op volgorde (sort), per `type` het
   juiste blok. Nieuwe bloktypes uit de export staan in BLOCKS; de veertien
   oorspronkelijke contentblokken komen uit StaticPage.
   De registry staat in components/blocks/registry.js.

   `core` is het vaste scherm van een sjabloon (WorkshopPage, ListingPage,
   ...). Het komt op de plek van het blok `page_core`. Staat dat blok er
   niet in, dan komt het scherm bovenaan.
   =========================================================================== */
export default function BlockRenderer({ blocks = [], core = null }) {
  const sorted = [...blocks].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const hasCore = sorted.some((b) => b.type === "page_core");
  return (
    <div className="wb-page">
      {!hasCore && core}
      {sorted.map((block, i) => {
        const key = block.id || `${block.type}-${i}`;
        if (block.type === "page_core") return <div key={key} className="wb-core">{core}</div>;
        const Block = BLOCKS[block.type];
        if (Block) return <Block key={key} block={block} />;
        return <div key={key} className="ww-wrap">{renderLegacyBlock(block, i)}</div>;
      })}
    </div>
  );
}
