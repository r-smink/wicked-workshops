"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useConsent } from "@/components/CookieConsent";

/* Toevoegingen in de footerbalk die niet in de referentie staan:
   weergave licht/donker (de site had al een donkere modus) en de
   cookie-instellingen achter de link "Cookies". */
export function ThemeSwitch() {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button type="button" className="foot-linkbtn foot-theme" onClick={() => setTheme(next)}>
      {resolved === "dark" ? "Lichte weergave" : "Donkere weergave"}
    </button>
  );
}

export function CookieSettingsLink() {
  const { openSettings } = useConsent();
  return (
    <button type="button" className="foot-linkbtn" onClick={openSettings}>
      Cookies
    </button>
  );
}
