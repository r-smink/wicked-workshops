"use client";

import { useState } from "react";
import { Icon, Photo, Badge, Rating } from "@/components/ui";

export function WorkshopCard({ w, go, showKm }) {
  const [fav, setFav] = useState(false);
  return (
    <article className="ww-wcard">
      <a onClick={() => go({ name: "workshop", workshop: w })} className="ww-wcard-img">
        <Photo icon={w.icon} ratio="4/3" style={{ height: "100%" }} />
        <span className="ww-wcard-badges">
          {w.badge && <Badge kind={w.badge} />}
          {w.spots != null && w.spots <= 3 && <Badge kind="spots" />}
        </span>
        <button
          className="ww-wcard-fav"
          data-active={fav ? "true" : "false"}
          aria-label={fav ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten"}
          onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
        >
          <Icon name="heart" size={18} fill={fav} />
        </button>
      </a>
      <div className="ww-wcard-body">
        <h3><a onClick={() => go({ name: "workshop", workshop: w })}>{w.title}</a></h3>
        <p className="ww-wcard-meta">
          {(showKm ? w.area : w.city)} · {w.duration}{showKm && w.km ? ` · ${w.km}` : ""}
          {w.groupSize ? ` · max. ${w.groupSize} personen` : ""}
        </p>
        <div className="ww-wcard-foot">
          <Rating value={w.rating} count={w.count} />
          <span className="ww-price">
            <span>vanaf</span>
            <b>{"\u20AC"}{w.price}</b>
          </span>
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ article, go }) {
  return (
    <article className="ww-acard" onClick={() => go({ name: "article", article })}>
      <div className="ww-acard-img">
        <Photo icon={article.icon} ratio="16/10" />
      </div>
      <div className="ww-acard-body">
        <span className="ww-eyebrow">{article.cat}</span>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <div className="ww-acard-foot">
          <span>{article.read}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  );
}
