"use client";

/* ===========================================================================
   Kaart

   Laadt de Google Maps JavaScript API en tekent een prijspin per workshop.
   Zonder sleutel valt de component terug op het rasterpatroon uit het
   prototype, zodat de pagina blijft werken en de bouw niet stilvalt.

   Bewust geen npm-pakket eromheen: de loader is twintig regels en scheelt
   een afhankelijkheid die bij elke Maps-update meeversiebeheerd moet worden.
   =========================================================================== */
import { useEffect, useRef, useState } from "react";
import { tokens } from "@/lib/tokens";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

/* Eén promise voor de hele pagina: bij meerdere kaarten laadt het script
   toch maar een keer. */
let loader = null;

function loadMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("server"));
  if (window.google?.maps?.marker) return Promise.resolve(window.google.maps);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=marker&language=nl&region=NL&loading=async&callback=__wwMapsReady`;
    script.async = true;
    window.__wwMapsReady = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Google Maps kon niet laden"));
    document.head.appendChild(script);
  });

  return loader;
}

/**
 * @param {Array} markers  [{ slug, title, price, lat, lng }]
 * @param {string} activeSlug  pin die uitgelicht wordt (hover in de lijst)
 * @param {function} onSelect  aangeroepen bij klik op een pin
 * @param {object} center  { lat, lng }, standaard het midden van de markers
 */
export default function Map({ markers = [], activeSlug, onSelect, center, className, style }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const pinsRef = useRef(new globalThis.Map());
  const [failed, setFailed] = useState(false);

  const usable = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

  useEffect(() => {
    if (!KEY || !ref.current || usable.length === 0) return;
    let cancelled = false;

    loadMaps()
      .then((maps) => {
        if (cancelled || !ref.current) return;

        const bounds = new maps.LatLngBounds();
        usable.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));

        const map = new maps.Map(ref.current, {
          center: center || bounds.getCenter(),
          zoom: 13,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || undefined,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        mapRef.current = map;

        if (usable.length > 1) map.fitBounds(bounds, 48);

        usable.forEach((m) => {
          const el = document.createElement("button");
          el.className = "ww-map-pin";
          el.type = "button";
          el.textContent = `\u20AC${m.price}`;
          el.setAttribute("aria-label", `${m.title}, vanaf ${m.price} euro`);
          el.addEventListener("click", () => onSelect && onSelect(m.slug));

          const pin = new maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: m.lat, lng: m.lng },
            content: el,
          });
          pinsRef.current.set(m.slug, el);
        });
      })
      .catch((err) => {
        console.error(err.message);
        if (!cancelled) setFailed(true);
      });

    return () => { cancelled = true; };
    // markers bewust buiten de deps: opnieuw tekenen bij elke filterwijziging
    // laat de kaart springen. Verversen gebeurt via de key op de component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* De uitgelichte pin bijwerken zonder de kaart opnieuw te bouwen */
  useEffect(() => {
    pinsRef.current.forEach((el, slug) => {
      el.dataset.on = slug === activeSlug ? "true" : "false";
    });
  }, [activeSlug]);

  /* Geen sleutel of laden mislukt: het patroon uit het prototype, met de
     pinnen op geschatte posities zodat de pagina niet leeg oogt. */
  if (!KEY || failed || usable.length === 0) {
    return (
      <div className={className} style={style} aria-hidden="true">
        {markers.map((m, i) => (
          <span key={m.slug} className="ww-map-pin"
            style={{ left: `${m.x ?? 20 + ((i * 17) % 60)}%`, top: `${m.y ?? 25 + ((i * 23) % 55)}%` }}>
            {"\u20AC"}{m.price}
          </span>
        ))}
        <span style={{
          position: "absolute", left: 16, bottom: 16, background: "#fff", borderRadius: 12,
          padding: "8px 14px", fontSize: 13, fontWeight: 700, boxShadow: tokens.shadow.card,
        }}>
          {KEY ? "Kaart kon niet laden" : "Kaartweergave"}
        </span>
      </div>
    );
  }

  return <div ref={ref} className={className} style={style} role="application" aria-label="Kaart met workshops" />;
}
