"use client";

import { useState, useEffect, useRef } from "react";
import { tokens } from "@/lib/tokens";
import { useGo } from "@/lib/use-go";
import { useAuth } from "@/lib/use-auth";
import { CATEGORIES, OCCASIONS, MOBILE_CITIES } from "@/lib/mock-data";
import { Icon, Logo, Wordmark, Button, Chip, Avatar } from "@/components/ui";

export function useIsMobile(query = "(max-width: 767px)") {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/* Tekst die op mobiel inklapt, zoals de "Lees meer" blokken in de wireframes */
export function ReadMore({ children, label = "Lees meer" }) {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  if (!mobile) return <>{children}</>;
  return (
    <>
      <div className={open ? undefined : "ww-clamp"}>{children}</div>
      <button className="ww-more" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Minder" : label}
        <Icon name="down" size={16} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
    </>
  );
}

/* De zijlade vervangt op mobiel het mega-menu */
export function MobileMenu({ go, onClose }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const nav = (to) => { onClose(); go(to); };
  const handleLogout = async () => { await logout(); onClose(); window.location.href = "/"; };

  return (
    <div className="ww-drawer-wrap" role="dialog" aria-label="Menu">
      <div className="ww-drawer-bg" onClick={onClose} />
      <nav className="ww-mdrawer">
        <div className="ww-mdrawer-top">
          <a className="ww-logo" onClick={() => nav({ name: "home" })}><Logo size={28} /><Wordmark size={17} /></a>
          <button className="ww-iconbtn" aria-label="Sluiten" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="ww-mdrawer-body">
          <div className="ww-msearch">
            <Icon name="search" size={19} style={{ color: tokens.color.brand, flex: "none" }} />
            <input placeholder="Waar heb je zin in?" aria-label="Zoeken" />
          </div>

          <h4>Categorieen</h4>
          {CATEGORIES.map((c) => (
            <button className="ww-mrow" key={c.slug} onClick={() => nav({ name: "listing", category: c })}>
              <span className="ww-mega-ico"><Icon name={c.icon} size={18} /></span>
              <span style={{ flex: 1 }}><strong>{c.name}</strong><span>{c.count} workshops</span></span>
              <Icon name="right" size={17} style={{ color: tokens.color.slate }} />
            </button>
          ))}

          <h4>Voor welke gelegenheid</h4>
          <div className="ww-tagpick">
            {OCCASIONS.map((o) => (
              <Chip key={o.name} onClick={() => nav({ name: "listing" })}>
                <Icon name={o.icon} size={15} />{o.name}
              </Chip>
            ))}
          </div>

          <h4>Populaire steden</h4>
          <div className="ww-tagpick">
            {MOBILE_CITIES.map((c) => <Chip key={c} soft onClick={() => nav({ name: "listing" })}>{c}</Chip>)}
            <Chip soft onClick={() => nav({ name: "listing" })}>Alle steden</Chip>
          </div>

          <h4>Meer</h4>
          {[["Voor bedrijven", { name: "business" }], ["Cadeaubon", { name: "giftcard" }],
            ["Inspiratie", { name: "blog" }], ["Over ons", null]].map(([l, to]) => (
            <button className="ww-mrow" key={l} onClick={() => (to ? nav(to) : onClose())}>
              <span style={{ flex: 1 }}><strong>{l}</strong></span>
              <Icon name="right" size={17} style={{ color: tokens.color.slate }} />
            </button>
          ))}
        </div>

        <div className="ww-mdrawer-foot">
          {user ? (
            <>
              <Button variant="outline" block icon="user" onClick={() => nav({ name: "dashboard" })}>
                Mijn profiel
              </Button>
              <Button variant="ghost" block onClick={handleLogout}>Uitloggen</Button>
            </>
          ) : (
            <>
              <Button variant="outline" block onClick={() => nav({ name: "auth", tab: "provider" })}>
                Word workshopgever
              </Button>
              <Button variant="primary" block onClick={() => nav({ name: "auth", tab: "visitor" })}>
                Inloggen
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

/* Gedeelde navigatie */
export function Header() {
  const go = useGo();
  const { user, logout } = useAuth();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const mobile = useIsMobile("(max-width: 1023px)");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMega(false); };
    const esc = (e) => { if (e.key === "Escape") setMega(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <header className="ww-header" ref={ref}>
      <div className="ww-wrap ww-header-in">
        <a className="ww-logo" onClick={() => go({ name: "home" })}><Logo /><Wordmark /></a>

        <nav className="ww-nav">
          <button data-on={mega ? "true" : "false"} onClick={() => setMega(!mega)}
            aria-expanded={mega} aria-haspopup="true">
            Categorieen <Icon name="down" size={15} />
          </button>
          <a onClick={() => go({ name: "listing" })}>Ontdek</a>
          <a onClick={() => go({ name: "blog" })}>Inspiratie</a>
          <a onClick={() => go({ name: "business" })}>Voor bedrijven</a>
          <a onClick={() => go({ name: "giftcard" })}>Cadeaubon</a>
        </nav>

        <div className="ww-head-acts">
          {user ? (
            <>
              <button className="ww-btn ww-btn--ghost" onClick={() => go({ name: "dashboard" })}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={`${user.first_name} ${user.last_name}`.trim() || user.email} size={26} />
                  Mijn profiel
                </span>
              </button>
              <Button variant="outline" onClick={async () => { await logout(); window.location.href = "/"; }}>
                Uitloggen
              </Button>
            </>
          ) : (
            <>
              <button className="ww-btn ww-btn--ghost" onClick={() => go({ name: "auth", tab: "provider" })}>
                Word workshopgever
              </button>
              <Button variant="outline" onClick={() => go({ name: "auth", tab: "visitor" })}>Inloggen</Button>
            </>
          )}
        </div>

        <div className="ww-mob-acts">
          <button className="ww-iconbtn" aria-label="Zoeken" onClick={() => go({ name: "listing" })}>
            <Icon name="search" />
          </button>
          <button className="ww-iconbtn" aria-label="Menu" onClick={() => setDrawer(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {mega && !mobile && (
        <div className="ww-mega">
          <div className="ww-wrap ww-mega-in">
            <div>
              <p className="ww-eyebrow" style={{ marginBottom: 14 }}>Alle categorieen</p>
              <div className="ww-mega-grid">
                {CATEGORIES.map((c) => (
                  <a key={c.slug} className="ww-mega-item"
                    onClick={() => { setMega(false); go({ name: "listing", category: c }); }}>
                    <span className="ww-mega-ico"><Icon name={c.icon} size={19} /></span>
                    <span><strong>{c.name}</strong><span>{c.count} workshops</span></span>
                  </a>
                ))}
              </div>
            </div>
            <div className="ww-mega-side">
              <p className="ww-eyebrow" style={{ marginBottom: 14 }}>Voor welke gelegenheid</p>
              <div className="ww-occ-list">
                {OCCASIONS.map((o) => (
                  <a key={o.name} className="ww-occ" onClick={() => { setMega(false); go({ name: "listing" }); }}>
                    <Icon name={o.icon} size={17} />{o.name}
                  </a>
                ))}
              </div>
              <div className="ww-surprise">
                <strong style={{ fontSize: 15 }}>Nog geen idee?</strong>
                <p>Laat je verrassen met een workshop die bij je past.</p>
                <button className="ww-btn ww-btn--coral" style={{ marginTop: 14, height: 42 }}
                  onClick={() => { setMega(false); go({ name: "workshop" }); }}>
                  Verras me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {drawer && <MobileMenu go={go} onClose={() => setDrawer(false)} />}
    </header>
  );
}

export function BottomNav({ route }) {
  const go = useGo();
  const { user } = useAuth();
  const items = [
    { key: "home", label: "Ontdek", icon: "compass", to: { name: "home" } },
    { key: "listing", label: "Zoeken", icon: "search", to: { name: "listing" } },
    { key: "fav", label: "Favorieten", icon: "heart", to: { name: "listing" } },
    { key: "profile", label: "Profiel", icon: "user", to: user ? { name: "dashboard" } : { name: "auth", tab: "visitor" } },
  ];
  return (
    <nav className="ww-bottom">
      {items.map((i) => (
        <button key={i.key} data-on={route === i.key ? "true" : "false"} onClick={() => go(i.to)}>
          <Icon name={i.icon} size={21} />{i.label}
        </button>
      ))}
    </nav>
  );
}

export function Footer() {
  const go = useGo();
  const { user } = useAuth();
  const cols = [
    ["Ontdekken", [["Categorieen", { name: "listing" }], ["Inspiratie", { name: "blog" }],
      ["Cadeaubon", { name: "giftcard" }], ["Voor bedrijven", { name: "business" }]]],
    ["Aanbieders", user
      ? [["Mijn dashboard", { name: "dashboard" }], ["Voorbeeldprofiel", { name: "provider" }]]
      : [["Word workshopgever", { name: "auth", tab: "provider" }],
        ["Voorbeeldprofiel", { name: "provider" }], ["Inloggen", { name: "auth", tab: "provider" }]]],
    ["Wicked", [["Over ons", null], ["Contact", null], ["Help", null]]],
  ];
  return (
    <footer className="ww-footer">
      <div className="ww-wrap">
        <div className="ww-foot-grid">
          <div>
            <a className="ww-logo" style={{ marginBottom: 12 }} onClick={() => go({ name: "home" })}>
              <Logo size={30} /><Wordmark />
            </a>
            <p style={{ fontSize: 14.5, color: tokens.color.slate, maxWidth: 320 }}>
              Iets buitengewoons, dichtbij. Het platform voor workshops en unieke uitjes in Nederland.
            </p>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <h4>{title}</h4>
              <ul>{links.map(([l, to]) => (
                <li key={l}><a onClick={() => to && go(to)}>{l}</a></li>
              ))}</ul>
            </div>
          ))}
        </div>
        <div className="ww-foot-bot">
          <span>2026 Wicked Workshops</span>
          <span>Prototype op basis van de brand guide v1.0</span>
        </div>
      </div>
    </footer>
  );
}
