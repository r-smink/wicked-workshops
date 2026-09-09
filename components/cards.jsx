"use client";

import { useState } from "react";
import { tokens } from "@/lib/tokens";
import { Icon, Photo, Badge, Rating } from "@/components/ui";

export function WorkshopCard({ w, go, showKm }) {
  const [fav, setFav] = useState(false);
  return (
    <article className="ww-wcard">
      <a onClick={() => go({ name: "workshop", workshop: w })} className="ww-wcard-img">
        <Photo icon={w.icon} ratio="4/3" style={{ height: "100%" }} />
        {w.badge && <span className="ww-wcard-badge"><Badge kind={w.badge} /></span>}
        <button className="ww-wcard-fav" aria-label="Bewaren"
          onClick={(e) => { e.stopPropagation(); setFav(!fav); }}>
          <Icon name="heart" size={18} fill={fav} style={fav ? { color: tokens.color.coral } : undefined} />
        </button>
      </a>
      <div className="ww-wcard-body">
        <h3><a onClick={() => go({ name: "workshop", workshop: w })}>{w.title}</a></h3>
        <p className="ww-meta">
          {(showKm ? w.area : w.city)} · {w.duration}{showKm && w.km ? ` · ${w.km}` : ""}
        </p>
        <div className="ww-wcard-foot">
          <Rating value={w.rating} count={w.count} />
          <span className="ww-price" style={{ textAlign: "right" }}>
            <span>vanaf</span><b>{"\u20AC"}{w.price}</b>
          </span>
        </div>
      </div>
    </article>
  );
}
