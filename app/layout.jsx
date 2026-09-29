import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleTagManager } from '@next/third-parties/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import { DemoModeProvider } from "@/components/DemoModeProvider";

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

export default function RootLayout({ children }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <GoogleTagManager gtmId="GTM-NM694S6Z" />
      <body className="ww">
        <ThemeProvider>
          <DemoModeProvider>
            {children}
          </DemoModeProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
