import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import BookingManage, { type ManageView } from "@/components/pages/BookingManage";
import { currentUser } from "@/lib/guard";
import { canAccessBooking } from "@/lib/bookings/access";
import { loadBookingByCode, loadWorkshopSessions, locationOf, paidCents, providerName, unitPriceOf } from "@/lib/bookings/load";
import { openComplaint, pendingOffer } from "@/lib/bookings/actions";
import { getPlatformSettings } from "@/lib/directus/settings";
import {
  canCancel, canReview, cancellationQuote, complaintWindowOpen, escrowUntilFor, rescheduleTargets, resolvePolicy,
} from "@/lib/rules/booking-rules";
import { normalizeSession, sessionStanding } from "@/lib/session-standing";
import { when } from "@/lib/mail/notify";

export const dynamic = "force-dynamic";
export const metadata = { title: "Je aanmelding", robots: { index: false, follow: false } };

const STATUS: Record<string, string> = {
  confirmed: "Je bent aangemeld",
  completed: "Afgerond",
  awaiting_payment: "Wacht op betaling",
  cancelled_by_customer: "Geannuleerd",
  session_cancelled: "Deze datum gaat niet door",
  moved: "Verzet naar een andere datum",
  refunded: "Terugbetaald",
  expired: "Verlopen",
  no_show: "Niet verschenen",
};

/* Beheerpagina van één aanmelding. Bereikbaar met de link uit de mails
   (?code=&t=) of ingelogd als de klant. Zonder geldige toegang tonen we
   hetzelfde als bij een onbekende code. */
export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string; t?: string }> }) {
  const { code = "", t = "" } = await searchParams;
  const booking = code ? await loadBookingByCode(code) : null;
  const user = booking ? await currentUser() : null;

  if (!booking || !canAccessBooking(booking, { token: t, userId: user?.id ?? null })) {
    return (
      <PublicLayout>
        <div className="ww-wrap" style={{ maxWidth: 640, padding: "48px 20px" }}>
          <h1>Aanmelding niet gevonden</h1>
          <p>We konden deze aanmelding niet openen. Gebruik de knop in je bevestigingsmail, of log in met het account waarmee je boekte.</p>
          <Link className="ww-btn ww-btn--outline ww-btn--lg" href="/">Terug naar home</Link>
        </div>
      </PublicLayout>
    );
  }

  const settings = await getPlatformSettings({ fresh: true });
  const now = Date.now();
  const policy = resolvePolicy(booking.workshop.cancellation_policy);
  const quote = cancellationQuote({
    policy, startsAt: booking.session.starts_at, paidCents: paidCents(booking), now, pilotFullRefund: settings.pilotFullRefundOnCancel,
  });

  const offer = booking.status === "session_cancelled" ? await pendingOffer(booking.id) : null;
  const movable = canCancel(booking, now) || Boolean(offer);
  const sessions = movable ? await loadWorkshopSessions(booking.workshop.id) : [];
  const targets = movable
    ? rescheduleTargets(sessions, { currentId: booking.session.id, participants: booking.participants, unitPrice: unitPriceOf(booking), now })
    : [];
  const offered = offer ? sessions.find((s) => s.id === offer.offered_session) ?? null : null;

  const complaintOpen = complaintWindowOpen(booking, { now, delayHours: settings.settlementDelayHours });
  const existingComplaint = complaintOpen || booking.status === "no_show" ? await openComplaint(booking.id) : null;
  const showLocation = ["confirmed", "completed"].includes(booking.status);
  const location = showLocation ? locationOf(booking) : null;
  const escrowUntil = booking.escrow_until || escrowUntilFor(booking.session.ends_at, booking.session.starts_at, settings.settlementDelayHours);

  const view: ManageView = {
    code: booking.booking_code,
    token: t,
    statusLabel: STATUS[booking.status] ?? booking.status,
    status: booking.status,
    workshopTitle: booking.workshop.title,
    workshopSlug: booking.workshop.slug,
    providerName: providerName(booking),
    when: when(booking.session.starts_at),
    participants: booking.participants,
    total: Number(booking.total || 0),
    testMode: booking.payment_env === "sandbox",
    location: location
      ? { name: location.name ?? null, address: location.address, postal: [location.postal_code, location.city].filter(Boolean).join(" ") }
      : null,
    refundStatus: booking.refund_status,
    refundAmount: booking.refund_amount ? Number(booking.refund_amount) : null,
    cancel: canCancel(booking, now)
      ? {
        free: quote.free,
        freeUntil: quote.freeUntil ? when(quote.freeUntil) : null,
        feePercent: policy.penalty_percent_after ?? 0,
        refund: quote.refundCents / 100,
        pilot: settings.pilotFullRefundOnCancel,
      }
      : null,
    targets: targets.map((s) => ({
      id: s.id,
      when: when(s.starts_at),
      standing: sessionStanding(normalizeSession(s), now).label as string,
    })),
    offer: offer && offered
      ? { sessionId: offered.id, when: when(offered.starts_at), expires: when(offer.expires_at) }
      : offer ? { sessionId: null, when: "", expires: when(offer.expires_at) } : null,
    complaint: complaintOpen
      ? { open: !existingComplaint, until: when(escrowUntil) }
      : null,
    complaintPending: Boolean(existingComplaint),
    review: canReview(booking, now),
  };

  return (
    <PublicLayout>
      <BookingManage view={view} />
    </PublicLayout>
  );
}
