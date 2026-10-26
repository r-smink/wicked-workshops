"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { Button, Switch } from "@/components/ui";

/* ===========================================================================
   Cookietoestemming.

   Google Tag Manager laadt pas nadat de bezoeker toestemming heeft gegeven
   voor statistiek of marketing (art. 11.7a Telecommunicatiewet). Daarnaast
   zet het inline script in app/layout.jsx Google Consent Mode v2 standaard
   op "denied", en werken we die hier bij, zodat ook tags in GTM de keuze
   respecteren. Noodzakelijke opslag (inlogcookie, thema) valt hier buiten.

   Keuze staat in localStorage onder "ww-consent", met datum en versie als
   bewijs. Versie ophogen = iedereen krijgt de banner opnieuw.
   =========================================================================== */

export const CONSENT_KEY = "ww-consent";
const CONSENT_VERSION = 1;
const GTM_ID = "GTM-NM694S6Z";

const ConsentContext = createContext({ consent: null, openSettings: () => {} });

export function useConsent() {
  return useContext(ConsentContext);
}

function readConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return c && c.version === CONSENT_VERSION ? c : null;
  } catch {
    return null;
  }
}

/* Consent Mode verwacht een arguments-object, net als gtag() zelf. */
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

function pushConsent(c) {
  gtag("consent", "update", {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
  });
}

/* Bij intrekken: tracking-cookies opruimen. GTM is dan al geladen, dus we
   herladen de pagina zodat hij alleen terugkomt als er nog toestemming is. */
function clearTrackingCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  document.cookie.split(";").map((c) => c.split("=")[0].trim())
    .filter((name) => /^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name))
    .forEach((name) => domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }));
}

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    setConsent(readConsent());
    setMounted(true);
  }, []);

  function save(choice) {
    const withdrawn = consent && ((consent.analytics && !choice.analytics) || (consent.marketing && !choice.marketing));
    const next = { ...choice, version: CONSENT_VERSION, decided_at: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    pushConsent(next);
    setConsent(next);
    setSettingsOpen(false);
    if (withdrawn) {
      clearTrackingCookies();
      window.location.reload();
    }
  }

  function openSettings() {
    setDraft({ analytics: Boolean(consent?.analytics), marketing: Boolean(consent?.marketing) });
    setSettingsOpen(true);
  }

  const loadGtm = Boolean(consent && (consent.analytics || consent.marketing));
  const showBanner = mounted && (!consent || settingsOpen);

  return (
    <ConsentContext.Provider value={{ consent, openSettings }}>
      {children}
      {loadGtm && <GoogleTagManager gtmId={GTM_ID} />}
      {showBanner && (
        <div className="ww-consent" role="dialog" aria-live="polite" aria-label="Cookie-instellingen">
          <h3>Cookies</h3>
          {settingsOpen ? (
            <>
              <Switch on title="Noodzakelijk" note="Inloggen, je thema en deze keuze onthouden. Altijd aan." onChange={() => {}} />
              <Switch on={draft.analytics} onChange={(v) => setDraft({ ...draft, analytics: v })}
                title="Statistiek" note="Google Analytics: zien hoe de site wordt gebruikt." />
              <Switch on={draft.marketing} onChange={(v) => setDraft({ ...draft, marketing: v })}
                title="Marketing" note="Advertenties meten en relevanter maken." />
              <div className="ww-consent-actions">
                <Button variant="outline" onClick={() => save({ analytics: false, marketing: false })}>Alles weigeren</Button>
                <Button variant="primary" onClick={() => save(draft)}>Keuze opslaan</Button>
              </div>
            </>
          ) : (
            <>
              <p>
                We gebruiken noodzakelijke cookies om de site te laten werken. Met jouw toestemming plaatsen we ook
                cookies voor statistiek en marketing. Lees meer in onze <a href="/privacy">privacyverklaring</a>.
              </p>
              <div className="ww-consent-actions">
                <Button variant="outline" onClick={() => save({ analytics: false, marketing: false })}>Weigeren</Button>
                <Button variant="outline" onClick={openSettings}>Instellen</Button>
                <Button variant="primary" onClick={() => save({ analytics: true, marketing: true })}>Accepteren</Button>
              </div>
            </>
          )}
        </div>
      )}
    </ConsentContext.Provider>
  );
}
