import { NextResponse } from "next/server";
import { isDirectusConfigured, directusUpdate, directusFetch, getBookingById } from "@/lib/directus";
import { mollieGetPayment } from "@/lib/mollie";

export const dynamic = "force-dynamic";

/* POST /api/webhooks/mollie
   Mollie roept dit aan bij elke statuswijziging van een betaling. De body
   is form-encoded en bevat alleen `id` — wij halen de betaling zelf op,
   dat is meteen de verificatie dat de melding klopt. */
export async function POST(request) {
  if (!isDirectusConfigured) {
    return NextResponse.json({ error: "Directus is niet geconfigureerd" }, { status: 503 });
  }

  const text = await request.text();
  const paymentId = new URLSearchParams(text).get("id");
  if (!paymentId) {
    return NextResponse.json({ error: "Geen payment id" }, { status: 400 });
  }

  const payment = await mollieGetPayment(paymentId);
  if (!payment) {
    /* Betaling niet gevonden — ack alsnog zodat Mollie niet blijft retryen. */
    return NextResponse.json({ ok: true });
  }

  const bookingId = payment.metadata?.booking_id;
  if (!bookingId) {
    return NextResponse.json({ ok: true });
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json({ ok: true });
  }

  const alreadyPaid = booking.payment_status === "paid";
  const updates = { payment_status: payment.status };

  if (payment.status === "paid") {
    updates.status = "confirmed";
    updates.paid_at = payment.paidAt || new Date().toISOString();

    /* Plekken boeken — alleen bij de overgang naar paid, zodat retries
       van Mollie niet dubbel tellen. */
    if (!alreadyPaid) {
      const sessionId = typeof booking.session === "string" ? booking.session : booking.session?.id;
      const seatsTaken = typeof booking.session === "object" ? booking.session?.seats_taken : null;
      if (sessionId) {
        let current = seatsTaken;
        if (current == null) {
          const fresh = await directusFetch(`/items/workshop_sessions/${sessionId}?fields=seats_taken`, { noCache: true });
          current = fresh?.seats_taken ?? 0;
        }
        await directusUpdate("workshop_sessions", sessionId, {
          seats_taken: current + (booking.participants || 1),
        });
      }
    }
  } else if (payment.status === "canceled") {
    updates.status = "cancelled_by_customer";
  } else if (payment.status === "expired" || payment.status === "failed") {
    updates.status = "expired";
  }

  await directusUpdate("bookings", booking.id, updates);
  return NextResponse.json({ ok: true });
}
