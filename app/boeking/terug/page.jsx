import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { getBookingByCode } from "@/lib/directus";
import { mollieGetPayment, mollieCheckoutUrl, isMollieConfigured } from "@/lib/mollie";

export const dynamic = "force-dynamic";
export const metadata = { title: "Je boeking" };

const DAY_FMT = { weekday: "long", day: "numeric", month: "long" };
const TIME_FMT = { hour: "2-digit", minute: "2-digit" };

function sessionLabel(startsAt) {
  if (!startsAt) return "";
  const d = new Date(startsAt);
  const day = d.toLocaleDateString("nl-NL", DAY_FMT);
  const time = d.toLocaleTimeString("nl-NL", TIME_FMT);
  return `${day.charAt(0).toUpperCase() + day.slice(1)} om ${time}`;
}

/* Terugkeerpagina vanuit Mollie. Toont de boekingsstatus op basis van de
   booking_code uit de redirect-URL. De webhook zet de status meestal al
   goed voordat de bezoeker hier landt. */
export default async function Page({ searchParams }) {
  const { code } = await searchParams;
  const booking = code ? await getBookingByCode(code) : null;

  /* Als de betaling nog "open" staat, bieden we de betaallink opnieuw aan. */
  let retryUrl = null;
  if (booking?.status === "awaiting_payment" && booking.payment_id && isMollieConfigured) {
    const payment = await mollieGetPayment(booking.payment_id);
    if (payment && payment.status === "open") {
      retryUrl = mollieCheckoutUrl(payment);
    }
  }

  const workshopTitle = booking?.workshop?.title || "je workshop";
  const when = sessionLabel(booking?.session?.starts_at);

  return (
    <PublicLayout>
      <div className="ww-wrap">
        <section className="ww-hero" style={{ maxWidth: 640 }}>
          {!booking ? (
            <>
              <h1>Boeking niet gevonden</h1>
              <p>We konden deze boeking niet terugvinden. Klopt de link?</p>
            </>
          ) : booking.status === "confirmed" ? (
            <>
              <h1>Je boeking is bevestigd</h1>
              <p>
                Leuk {booking.guest_name?.split(" ")[0] || ""} — je plek voor{" "}
                <strong>{workshopTitle}</strong> is vastgelegd.
                {when ? ` ${when}.` : ""} Je ontvangt de bevestiging per e-mail.
              </p>
            </>
          ) : booking.status === "pending" ? (
            <>
              <h1>Aanvraag verstuurd</h1>
              <p>
                Je aanvraag voor <strong>{workshopTitle}</strong> ligt bij de aanbieder.
                Zodra die bevestigt, ontvang je een betaallink per e-mail.
              </p>
            </>
          ) : booking.status === "awaiting_payment" ? (
            <>
              <h1>Betaling nog niet afgerond</h1>
              <p>
                Je boeking voor <strong>{workshopTitle}</strong> is aangemaakt, maar de
                betaling is nog niet voltooid.
              </p>
            </>
          ) : (
            <>
              <h1>Deze boeking is niet meer actief</h1>
              <p>
                De boeking voor <strong>{workshopTitle}</strong> is geannuleerd of verlopen.
              </p>
            </>
          )}

          {booking && (
            <p style={{ marginTop: 14, fontSize: 14.5 }}>
              Boeking <strong>{booking.booking_code}</strong>
              {booking.participants ? ` · ${booking.participants} ${booking.participants === 1 ? "persoon" : "personen"}` : ""}
              {booking.total ? ` · € ${Number(booking.total).toFixed(2).replace(".", ",")}` : ""}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            {retryUrl ? (
              <a className="ww-btn ww-btn--primary ww-btn--lg" href={retryUrl}>
                Betaling afronden
              </a>
            ) : null}
            {booking?.workshop?.slug ? (
              <Link className="ww-btn ww-btn--outline ww-btn--lg" href={`/workshop/${booking.workshop.slug}`}>
                Terug naar de workshop
              </Link>
            ) : (
              <Link className="ww-btn ww-btn--outline ww-btn--lg" href="/">
                Terug naar home
              </Link>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
