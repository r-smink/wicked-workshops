import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { ClaimAccount } from "@/components/pages/AccountForms";
import { loadBookingByCode } from "@/lib/bookings/load";
import { tokenMatches } from "@/lib/bookings/access";
import { when } from "@/lib/mail/notify";

export const metadata = { title: "Kies een wachtwoord", robots: { index: false } };

/* "Maak mijn account" uit de bevestigingsmail van een aanmelding (docs/06
   scherm 4). De beheerlink (code en t) bewijst het e-mailadres. */
export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string; t?: string }> }) {
  const { code = "", t = "" } = await searchParams;
  const booking = code ? await loadBookingByCode(code) : null;
  if (!booking || !tokenMatches(booking.id, booking.access_token, t) || !booking.guest_email) {
    return (
      <PublicLayout>
        <div className="ww-wrap" style={{ maxWidth: 560, padding: "48px 20px" }}>
          <h1>Deze link werkt niet meer</h1>
          <p>Maak je account via <Link href="/account-maken">Maak een account</Link>. Gebruik het e-mailadres van je aanmelding, dan staat die er meteen in.</p>
        </div>
      </PublicLayout>
    );
  }
  const s = booking.session;
  const standing = s.min_participants && s.state !== "confirmed" ? `${s.seats_taken ?? 0} van ${s.min_participants} nodig` : null;
  return (
    <PublicLayout>
      <ClaimAccount
        code={booking.booking_code}
        token={t}
        email={booking.guest_email.trim().toLowerCase()}
        booking={{ when: when(s.starts_at), title: booking.workshop.title, standing }}
      />
    </PublicLayout>
  );
}
