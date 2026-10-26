import "./globals.css";
import "./blocks.css";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/ThemeProvider";
import { DemoModeProvider } from "@/components/DemoModeProvider";
import { CookieConsentProvider } from "@/components/CookieConsent";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://wickedworkshops.nl";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Wicked Workshops - vind iets wicked om te doen",
    template: "%s | Wicked Workshops",
  },
  description:
    "Ontdek en boek unieke workshops en uitjes bij jou in de buurt. Van keramiek tot cocktails, voor een date, je vrienden of het hele team.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Wicked Workshops",
    title: "Wicked Workshops - vind iets wicked om te doen",
    description: "Ontdek en boek unieke workshops en uitjes bij jou in de buurt.",
  },
  robots: {
    // Zet dit op true zodra de site echt live gaat met echte data.
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#6C2BD9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `
  (function() {
    const saved = localStorage.getItem('ww-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && systemDark) || (saved === 'system' && systemDark);
    if (dark) document.documentElement.classList.add('dark');
  })();
`;

/* Google Consent Mode v2: alles wat niet noodzakelijk is staat standaard
   uit, vóórdat GTM (pas na toestemming, zie CookieConsent) laadt. Een
   eerder gemaakte keuze wordt meteen toegepast. */
const consentScript = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });
  try {
    var c = JSON.parse(localStorage.getItem('ww-consent') || 'null');
    if (c) gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
  } catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: consentScript }} />
      </head>
      <body className="ww">
        <ThemeProvider>
          <DemoModeProvider>
            <CookieConsentProvider>
              {children}
            </CookieConsentProvider>
          </DemoModeProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
