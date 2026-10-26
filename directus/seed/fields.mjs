/* Welke velden publiek (of voor een workshopgever) zichtbaar zijn.

   Elk veld van deze collections staat hier in precies 1 lijst: publiek of
   prive. Komt er een veld bij dat nergens staat, dan stopt de seed met een
   fout. Zo lekt een nieuw veld nooit per ongeluk: iemand moet kiezen. */
import { api } from "../scripts/api.mjs";

const CLASSIFIED = {
  workshops: {
    public: [
      "id", "date_created", "date_updated", "status", "published_at", "slug", "title", "subtitle", "intro", "description",
      "duration_minutes", "level", "min_participants", "max_participants", "format", "price_per_person", "price_from",
      "private_booking_available", "private_price", "group_quote_from", "cancellation_policy", "instant_bookable",
      "giftcard_eligible", "location_inherits_provider", "location_name", "neighbourhood", "address_visibility",
      "rating_avg", "rating_count", "rating_atmosphere", "rating_explanation", "rating_value", "participants_count",
      "badge", "featured", "seo_title", "seo_description", "provider", "category", "age_rating", "city", "seo_image",
      "name", "display_name", "accessibility", "next_session_at",
      "media", "inclusions", "faq", "sessions", "reviews", "secondary_categories", "occasions", "languages",
      "dietary_options", "amenities", "inclusion_types",
    ],
    /* Adres en exacte plek: alleen na aanmelding (docs/03, workshop_private). */
    private: ["user_created", "user_updated", "address", "postal_code", "lat", "lng", "submitted_at", "review_note"],
  },
  workshop_sessions: {
    public: [
      "id", "date_created", "date_updated", "status", "starts_at", "ends_at", "capacity", "seats_taken", "price_override",
      "is_private", "booking_deadline_hours", "workshop", "min_participants", "decision_at", "goes_ahead", "state",
      "confirmed_at", "closed_at",
    ],
    private: ["user_created", "user_updated", "cancellation_reason", "bookings"],
  },
  providers: {
    public: [
      "id", "date_created", "date_updated", "status", "slug", "display_name", "first_name", "profession", "bio_short",
      "bio_long", "neighbourhood", "area_label", "location_name", "active_since", "verified", "verified_at", "accepts_groups",
      "max_group_size", "response_time_minutes", "rating_avg", "rating_count", "participants_count", "workshops_count",
      "is_top_rated", "seo_title", "seo_description", "avatar", "cover", "city", "seo_image", "name", "title", "details",
      "kind", "gallery", "workshops", "languages",
    ],
    private: [
      "user_created", "user_updated", "user", "address", "postal_code", "lat", "lng", "kvk_number", "vat_number",
      "mollie_connect_id", "payout_iban_last4", "commission_rate", "has_location", "onboarded_at",
    ],
  },
  reviews: {
    public: [
      "id", "date_created", "status", "author_display_name", "rating_overall", "rating_atmosphere", "rating_explanation",
      "rating_value", "body", "published_at", "workshop", "provider",
    ],
    private: ["date_updated", "user_created", "user_updated", "provider_reply", "provider_replied_at", "booking", "user"],
  },
  venue_listings: {
    public: ["id", "date_created", "date_updated", "visible", "status", "name", "place", "neighbourhood", "kind", "capacity", "amenities", "description", "availability", "images"],
    private: ["user_created", "user_updated", "owner"],
  },
  /* Wat een workshopgever ziet van aanmeldingen op eigen datums (docs/10):
     voornaam en initiaal, personen, dieetwens, wanneer, stand. */
  bookings: {
    provider: ["id", "date_created", "status", "session", "first_name", "last_initial", "participants", "dietary_notes"],
    private: [
      "date_updated", "user_created", "user_updated", "booking_code", "guest_name", "guest_email", "guest_phone",
      "unit_price", "subtotal", "service_fee", "discount", "total", "question", "payment_id", "payment_status", "paid_at",
      "hold_expires_at", "cancellation_deadline", "cancelled_at", "cancelled_by", "refund_amount", "review_requested_at",
      "workshop", "provider", "customer", "giftcard", "payout", "access_token", "moved_from", "cancel_fee_percent",
    ],
  },
};

export const PUBLIC_FIELDS = {
  workshops: CLASSIFIED.workshops.public,
  workshop_sessions: CLASSIFIED.workshop_sessions.public,
  providers: CLASSIFIED.providers.public,
  reviews: CLASSIFIED.reviews.public,
  venue_listings: CLASSIFIED.venue_listings.public,
  bookings_provider: CLASSIFIED.bookings.provider,
  /* Eigen aanmelding: alles behalve het toegangstoken en interne koppelingen. */
  bookings_own: [...CLASSIFIED.bookings.provider, ...CLASSIFIED.bookings.private].filter(
    (f) => !["access_token", "payout", "user_created", "user_updated", "provider"].includes(f),
  ),
  reviews_own: [...CLASSIFIED.reviews.public, "booking", "user"],
};

export async function assertClassified() {
  const problems = [];
  for (const [collection, groups] of Object.entries(CLASSIFIED)) {
    const known = new Set(Object.values(groups).flat());
    const fields = (await api("GET", `/fields/${collection}`)).map((f) => f.field);
    const missing = fields.filter((f) => !known.has(f));
    const stale = [...known].filter((f) => !fields.includes(f));
    if (missing.length) problems.push(`${collection}: niet ingedeeld: ${missing.join(", ")}`);
    if (stale.length) problems.push(`${collection}: bestaat niet meer: ${stale.join(", ")}`);
  }
  if (problems.length) {
    throw new Error(`Velden niet ingedeeld in directus/seed/fields.mjs (publiek of prive):\n  ${problems.join("\n  ")}`);
  }
}
