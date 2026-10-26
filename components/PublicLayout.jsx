import PublicShell from "@/components/PublicShell";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getSiteSettings } from "@/lib/directus";

/* Publieke layout (server): haalt de aankondigingsbalk uit de
   settings-singleton en geeft hem aan de client-schil met header en footer. */
export default async function PublicLayout({ children }) {
  const settings = await getSiteSettings();
  return (
    <PublicShell
      announcement={
        settings.announcement ? (
          <AnnouncementBar
            text={settings.announcement}
            highlight={settings.announcementHighlight}
            href={settings.announcementLink}
          />
        ) : null
      }
    >
      {children}
    </PublicShell>
  );
}
