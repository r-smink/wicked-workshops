import "./globals.css";

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

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
