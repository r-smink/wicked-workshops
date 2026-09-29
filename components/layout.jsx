"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGo } from "@/lib/use-go";
import { useAuth } from "@/lib/use-auth";
import { CATEGORIES, OCCASIONS, MOBILE_CITIES } from "@/lib/mock-data";
import { Icon, Logo, Wordmark, Button, Chip, Avatar, ThemeToggle } from "@/components/ui";

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

async function fetchMenu(location) {
  try {
    const res = await fetch(`/api/menu?location=${location}`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.items) ? json.items : [];
  } catch {
    return [];
  }
}

export function useMenu(location) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetchMenu(location).then(setItems);
  }, [location]);
  return items;
}

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

const MEGA_CITIES = [
  { name: "Amsterdam", count: 412 },
  { name: "Rotterdam", count: 286 },
  { name: "Utrecht", count: 198 },
  { name: "Den Haag", count: 156 },
  { name: "Eindhoven", count: 134 },
  { name: "Alle steden", count: 187, slug: "alle" },
];

export function MobileMenu({ go, onClose, menuItems = [] }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prevOverflow;
    };
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
            <Icon name="search" size={19} style={{ color: "var(--ww-brand)", flex: "none" }} />
            <input placeholder="Waar heb je zin in?" aria-label="Zoeken" />
          </div>

          <h4>Categorieen</h4>
          {CATEGORIES.map((c) => (
            <button className="ww-mrow" key={c.slug} onClick={() => nav({ name: "listing", category: c })}>
              <span className="ww-mega-ico"><Icon name={c.icon} size={18} /></span>
              <span style={{ flex: 1 }}><strong>{c.name}</strong><span>{c.count} workshops</span></span>
              <Icon name="right" size={17} style={{ color: "var(--ww-text-muted)" }} />
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

          {menuItems.length > 0 && (
            <>
              <h4>Meer</h4>
              {menuItems.map((item) => (
                <button className="ww-mrow" key={item.slug} onClick={() => nav({ name: "page", slug: item.slug })}>
                  <span style={{ flex: 1 }}><strong>{item.label}</strong></span>
                  <Icon name="right" size={17} style={{ color: "var(--ww-text-muted)" }} />
                </button>
              ))}
            </>
          )}
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

export function Header() {
  const go = useGo();
  const { user, logout } = useAuth();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState("");
  const mobile = useIsMobile("(max-width: 1023px)");
  const menuItems = useMenu("header");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMega(false); };
    const esc = (e) => { if (e.key === "Escape") setMega(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <>
      <div className="ww-topbar">
        Ook van makers zonder bedrijf. Geen btw-nummer nodig om te beginnen.
      </div>
      <header className="ww-header" ref={ref}>
        <div className="ww-wrap ww-header-in">
          <a className="ww-logo" onClick={() => go({ name: "home" })}><Logo /><Wordmark /></a>

          <div className="ww-search-head">
            <Icon name="search" size={18} style={{ color: "var(--ww-text-muted)", flex: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek een stad, workshop of aanbieder"
              aria-label="Zoek een stad, workshop of aanbieder"
            />
            <button className="ww-search-head-btn" aria-label="Zoeken" onClick={() => go({ name: "listing" })}>
              <Icon name="arrow" size={16} />
            </button>
          </div>

          <nav className="ww-nav">
            <button data-on={mega ? "true" : "false"} onClick={() => setMega(!mega)}
              aria-expanded={mega} aria-haspopup="true">
              Categorieen <Icon name="down" size={15} />
            </button>
            <a onClick={() => go({ name: "listing" })}>Ontdek</a>
            <a onClick={() => go({ name: "blog" })}>Inspiratie</a>
            <a onClick={() => go({ name: "business" })}>Voor bedrijven</a>
            <a onClick={() => go({ name: "giftcard" })}>Cadeaubon</a>
            {menuItems.map((item) => (
              <a key={item.slug} onClick={() => go({ name: "page", slug: item.slug })}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ww-head-acts">
            <ThemeToggle />
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
                <Button variant="primary" onClick={() => go({ name: "auth", tab: "visitor" })}>Inloggen</Button>
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
                <p className="ww-eyebrow" style={{ marginTop: 18, marginBottom: 10 }}>In welke plaats</p>
                <div className="ww-city-list">
                  {MEGA_CITIES.map((c) => (
                    <a key={c.name} className="ww-city" onClick={() => { setMega(false); go({ name: "listing" }); }}>
                      <span>{c.name}</span>
                      <span>{c.count}</span>
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

        {drawer && createPortal(<MobileMenu go={go} onClose={() => setDrawer(false)} menuItems={menuItems} />, document.body)}
      </header>
    </>
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
  const footerMenu = useMenu("footer");

  const pageLinks = footerMenu.length
    ? footerMenu.map((item) => [item.label, { name: "page", slug: item.slug }])
    : [["Over ons", null], ["Contact", null], ["Help", null]];

  return (
    <footer className="ww-footer">
      <div className="ww-wrap">
        <div className="ww-foot-grid">
          <div>
            <a className="ww-logo" style={{ marginBottom: 12 }} onClick={() => go({ name: "home" })}>
              <Logo size={30} /><Wordmark light />
            </a>
            <p>
              De Nederlandse marktplaats voor workshops en unieke uitjes. Ook voor wie net begint met lesgeven.
            </p>
          </div>
          <div>
            <h4>Ontdekken</h4>
            <ul>
              <li><a onClick={() => go({ name: "listing" })}>Alle workshops</a></li>
              <li><a onClick={() => go({ name: "listing" })}>Categorieen</a></li>
              <li><a onClick={() => go({ name: "listing" })}>Steden en plaatsen</a></li>
              <li><a onClick={() => go({ name: "blog" })}>Inspiratie</a></li>
              <li><a onClick={() => go({ name: "giftcard" })}>Cadeaubon</a></li>
            </ul>
          </div>
          <div>
            <h4>Workshopgevers</h4>
            <ul>
              <li><a onClick={() => go({ name: "auth", tab: "provider" })}>Word workshopgever</a></li>
              <li><a onClick={() => go({ name: "auth", tab: "provider" })}>Zo werkt het</a></li>
              <li><a onClick={() => go({ name: "provider" })}>Wat kost het</a></li>
              <li><a onClick={() => go(user ? { name: "dashboard" } : { name: "auth", tab: "visitor" })}>Inloggen op je dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4>Wicked Workshops</h4>
            <ul>
              {pageLinks.map(([l, to]) => (
                <li key={l}><a onClick={() => to && go(to)}>{l}</a></li>
              ))}
              <li><a onClick={() => go({ name: "business" })}>Voor bedrijven</a></li>
              <li><a onClick={() => go({ name: "blog" })}>Veelgestelde vragen</a></li>
              <li><a onClick={() => go({ name: "page", slug: "contact" })}>Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="ww-foot-bot">
          <span>&copy; 2026 Wicked Workshops</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a>Algemene voorwaarden</a>
            <a>Privacy</a>
            <a>Cookies</a>
          </div>
          <span>Bookingkosten &euro;0, altijd</span>
        </div>
      </div>
    </footer>
  );
}
