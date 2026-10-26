/* Vertaling tussen de namen uit docs/03 en het live schema.

   Het live schema bestond al voor de publieke site. Waar docs/03 hetzelfde
   begrip een andere naam geeft, houden we de live naam (geen dubbele data)
   en vertalen we hier. Gebruik in nieuwe code de docs-namen via deze
   functies; zo staat de vertaling op 1 plek.

     docs/03                     live
     places                      cities
     workshop.place              workshops.city
     workshop.location_kind      workshops.format
     workshop.short_description  workshops.subtitle
     workshop.price_cents        workshops.price_per_person (decimal, euro's)
     workshop.review_count       workshops.rating_count
     workshop_images             workshop_media
     workshop.includes / faq     workshop_inclusions / workshop_faq
     session.capacity_max        workshop_sessions.capacity
     session.persons_booked      workshop_sessions.seats_taken
     booking.user                bookings.customer
     booking.email               bookings.guest_email
     booking.persons             bookings.participants
     booking.dietary_note        bookings.dietary_notes
     review.rating               reviews.rating_overall
     review.display_first_name   reviews.author_display_name
     saved_workshops             favorites
     provider.bio / photo        providers.bio_long / avatar */

import type { Booking, Workshop } from "./types";

/* ---------- workshopstatus ---------- */

export type WorkshopState = "draft" | "in_review" | "live" | "hidden";
type LiveWorkshopStatus = Workshop["status"];

const WORKSHOP_STATUS: Record<WorkshopState, LiveWorkshopStatus> = {
  draft: "draft",
  in_review: "pending_review",
  live: "published",
  hidden: "paused",
};

export function workshopStatusToLive(state: WorkshopState): LiveWorkshopStatus {
  return WORKSHOP_STATUS[state];
}

/* "archived" bestaat alleen live (door het team gearchiveerd): telt als weg. */
export function workshopStateFromLive(status: LiveWorkshopStatus): WorkshopState {
  switch (status) {
    case "pending_review":
      return "in_review";
    case "published":
      return "live";
    case "paused":
    case "archived":
      return "hidden";
    default:
      return "draft";
  }
}

/* ---------- plek van de workshop ---------- */

export type LocationKind = "own_place" | "participant_home" | "company" | "online" | "seeking";
type LiveFormat = NonNullable<Workshop["format"]>;

const LOCATION_KIND: Record<LocationKind, LiveFormat> = {
  own_place: "on_location",
  participant_home: "at_home",
  company: "at_office",
  online: "online",
  seeking: "seeking",
};

export const locationKindToLive = (kind: LocationKind): LiveFormat => LOCATION_KIND[kind];

export function locationKindFromLive(format: Workshop["format"]): LocationKind {
  const hit = (Object.keys(LOCATION_KIND) as LocationKind[]).find((k) => LOCATION_KIND[k] === format);
  return hit ?? "own_place";
}

/* ---------- niveau ---------- */

/* docs/03: none = geen ervaring nodig, some = wat ervaring. */
export type Level = "none" | "some";

export const levelFromLive = (level: Workshop["level"]): Level => (level === "advanced" ? "some" : "none");
export const levelToLive = (level: Level): NonNullable<Workshop["level"]> => (level === "some" ? "advanced" : "beginner");

/* ---------- aanmeldingen ---------- */

export type BookingState = "confirmed" | "cancelled" | "moved" | "session_cancelled";
type LiveBookingStatus = Booking["status"];

export function bookingStateFromLive(status: LiveBookingStatus): BookingState | null {
  switch (status) {
    case "confirmed":
    case "completed":
      return "confirmed";
    case "cancelled_by_customer":
      return "cancelled";
    case "moved":
      return "moved";
    case "session_cancelled":
    case "cancelled_by_provider":
      return "session_cancelled";
    default:
      /* pending, awaiting_payment, expired, refunded, no_show: van de oude betaalflow. */
      return null;
  }
}

export function bookingStateToLive(state: BookingState): LiveBookingStatus {
  return state === "cancelled" ? "cancelled_by_customer" : state;
}

/* ---------- geld ---------- */

/* price_per_person is een decimal in euro's en komt als string binnen. */
export function priceCents(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

/* ---------- aanbieder ---------- */

export type ProviderState = "active" | "paused";
export const providerStateFromLive = (status: string | null | undefined): ProviderState => (status === "paused" ? "paused" : "active");

/* "Femke D." (docs/10): voornaam plus initiaal, zonder punt als er geen initiaal is. */
export function participantLabel(firstName: string | null | undefined, lastInitial: string | null | undefined): string {
  const name = (firstName || "").trim() || "Deelnemer";
  const initial = (lastInitial || "").trim().charAt(0).toUpperCase();
  return initial ? `${name} ${initial}.` : name;
}
