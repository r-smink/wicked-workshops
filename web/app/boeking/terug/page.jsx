import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { getBookingByCode, bookingLocation } from "@/lib/directus";
import { cancellationLong } from "@/lib/cancellation";
import { getPayment, isPaymentConfigured } from "@/lib/payment";
import { getPlatformSettings } from "@/lib/directus/settings";

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

/* Terugkeerpagina na betaling (OPP of Mollie). Toont de boekingsstatus
   op basis van de booking_code uit de redirect-URL. De webhook zet de
   status meestal al goed voordat de bezoeker hier landt. */
export default async function Page({ searchParams }) {
  const { code } = await searchParams;
  const booking = code ? await getBookingByCode(code) : null;
  const settings = await getPlatformSettings();

  /* Als de betaling nog "open" staat, bieden we de betaallink opnieuw aan. */
  let retryUrl = null;
  const paymentUid = booking?.opp_transaction_uid || booking?.payment_id;
  if (booking?.status === "awaiting_payment" && paymentUid && isPaymentConfigured(settings.paymentProvider)) {
    const payment = await getPayment(settings.paymentProvider, paymentUid);
    if (payment && (payment.status === "open" || payment.status === "pending")) {
      retryUrl = payment.redirect_url || payment._links?.checkout?.href || null;
    }
  }

  const workshopTitle = booking?.workshop?.title || "je workshop";
  const when = sessionLabel(booking?.session?.starts_at);
  /* Het exacte lesadres alleen voor bevestigde deelnemers. */
  const location = booking?.status === "confirmed" ? bookingLocation(booking) : null;
  const deadline = booking?.cancellation_deadline ? sessionLabel(booking.cancellation_deadline) : "";

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

          {location && (
            <div className="ww-sidecard" style={{ marginTop: 20 }}>
              <h3>Waar</h3>
              {location.name && <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{location.name}</p>}
              <p style={{ margin: 0 }}>
                {location.address}
                {(location.postal_code || location.city) && <br />}
                {[location.postal_code, location.city].filter(Boolean).join(" ")}
              </p>
              <p className="ww-meta" style={{ marginTop: 10, fontSize: 13 }}>
                Dit adres is alleen voor deelnemers. Deel het niet verder.
              </p>
            </div>
          )}

          {booking?.status === "confirmed" && booking.workshop?.cancellation_policy && (
            <p style={{ marginTop: 14, fontSize: 14.5 }}>
              Annuleren: {cancellationLong(booking.workshop.cancellation_policy).toLowerCase()}
              {deadline ? ` (kosteloos tot ${deadline.charAt(0).toLowerCase() + deadline.slice(1)})` : ""}.
            </p>
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
