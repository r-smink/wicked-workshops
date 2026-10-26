/* Gegenereerd door scripts/directus-types.mjs uit directus/schema/snapshot.yaml.
   Niet met de hand wijzigen: draai `npm run directus:types`. */

import type { DirectusFile as SdkDirectusFile, DirectusRole as SdkDirectusRole, DirectusFolder as SdkDirectusFolder } from "@directus/sdk";

export interface AgeRating {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number | null;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  filter_group: "accessibility" | "travel" | "extra" | null;
  sort: number | null;
}

export interface ArticleAuthor {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  name: string;
  role: string | null;
  bio: string | null;
  avatar: string | DirectusFile | null;
}

export interface ArticleFaq {
  id: string;
  question: string;
  answer: string;
  sort: number | null;
  article: string | Article | null;
}

export interface Article {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "published" | "archived";
  title: string;
  slug: string;
  excerpt: string | null;
  short_answer: string | null;
  body: string | null;
  toc: unknown | null;
  reading_time: number | null;
  category: string | Category | null;
  author: string | ArticleAuthor | null;
  hero: string | DirectusFile | null;
  faq: Array<string | ArticleFaq>;
  related_workshops: Array<number | ArticlesWorkshop>;
  related_articles: Array<number | ArticlesRelated>;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
}

export interface ArticlesRelated {
  id: number;
  sort: number | null;
  article_id: string | Article | null;
  related_article_id: string | Article | null;
}

export interface ArticlesWorkshop {
  id: number;
  sort: number | null;
  article_id: string | Article | null;
  workshop_id: string | Workshop | null;
}

export interface Booking {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "pending" | "awaiting_payment" | "confirmed" | "completed" | "cancelled_by_customer" | "cancelled_by_provider" | "moved" | "session_cancelled" | "expired" | "refunded" | "no_show";
  booking_code: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  participants: number;
  dietary_notes: string | null;
  question: string | null;
  cancellation_deadline: string | null;
  cancelled_at: string | null;
  cancelled_by: "customer" | "provider" | "wicked" | null;
  refund_amount: string | null;
  review_requested_at: string | null;
  session: string | WorkshopSession;
  workshop: string | Workshop | null;
  provider: string | Provider | null;
  customer: string | DirectusUser | null;
  payout: string | Payout | null;
  unit_price: string | null;
  subtotal: string | null;
  service_fee: string | null;
  discount: string | null;
  total: string | null;
  giftcard: string | Giftcard | null;
  payment_id: string | null;
  payment_status: "open" | "pending" | "paid" | "failed" | "expired" | "canceled" | "refunded" | null;
  paid_at: string | null;
  hold_expires_at: string | null;
  access_token: string | null;
  moved_from: string | Booking | null;
  cancel_fee_percent: number | null;
  first_name: string | null;
  last_initial: string | null;
}

export interface BusinessRequest {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "new" | "in_progress" | "quoted" | "won" | "lost";
  company: string;
  contact_name: string;
  email: string;
  phone: string | null;
  participants: number | null;
  preferred_date: string | null;
  budget_indication: string | null;
  message: string | null;
  source: string | null;
  city: string | City | null;
  workshop: string | Workshop | null;
  provider: string | Provider | null;
  assigned_to: string | DirectusUser | null;
}

export interface CancellationPolicy {
  key: string;
  name: string | null;
  description: string | null;
  free_until_hours_before: number | null;
  penalty_percent_after: number | null;
  reschedule_free: boolean;
  sort: number | null;
}

export interface Category {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "published" | "archived";
  name: string;
  slug: string;
  icon: string | null;
  intro: string | null;
  seo_text: string | null;
  featured_in_menu: boolean;
  workshop_count: number | null;
  sort: number | null;
  parent: string | Category | null;
  image: string | DirectusFile | null;
  children: Array<string | Category>;
  display_name: string | null;
  title: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
  commission_percent: number | null;
}

export interface City {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "published" | "archived";
  name: string;
  slug: string;
  province: string | null;
  lat: number | null;
  lng: number | null;
  intro: string | null;
  seo_text: string | null;
  is_top: boolean;
  workshop_count: number | null;
  sort: number | null;
  image: string | DirectusFile | null;
  title: string | null;
  display_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
  cbs_code: string | null;
  municipality: string | null;
}

export interface DietaryOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number | null;
}

export interface Favorite {
  id: string;
  date_created: string | null;
  user: string | DirectusUser;
  workshop: string | Workshop;
}

export interface Follow {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUser | null;
  user_updated: string | DirectusUser | null;
  user: string | DirectusUser | null;
  provider: string | Provider | null;
}

export interface FormSubmission {
  id: string;
  date_created: string | null;
  status: "new" | "done" | "archived";
  form: "contact" | "maker_signup" | "venue_search" | "venue_offer" | "follow" | "business" | null;
  email: string | null;
  name: string | null;
  source_page: string | null;
  data: unknown | null;
}

export interface Giftcard {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "pending_payment" | "active" | "partially_used" | "used" | "expired" | "cancelled";
  code: string;
  initial_amount: string;
  remaining_amount: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  message: string | null;
  deliver_at: string | null;
  valid_until: string | null;
  payment_id: string | null;
  workshop: string | Workshop | null;
}

export interface InclusionType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number | null;
}

export interface Language {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort: number | null;
}

export interface LocationPageFaq {
  id: string;
  question: string;
  answer: string;
  sort: number | null;
  location_page: string | LocationPage | null;
}

export interface LocationPage {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "published" | "archived";
  h1: string;
  intro: string | null;
  seo_text: string | null;
  related_links: unknown | null;
  min_results: number | null;
  category: string | Category;
  city: string | City;
  faq: Array<string | LocationPageFaq>;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
}

export interface NewsletterSubscriber {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  email: string;
  source: string | null;
  confirmed: boolean;
  confirmed_at: string | null;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  subtitle: string | null;
  sort: number | null;
}

export interface PageBlock {
  id: number;
  type: "hero" | "text" | "text_image" | "two_columns" | "steps" | "ticks" | "features" | "quotes" | "cards" | "cta" | "image_banner" | "gallery" | "faq" | "video" | "page_hero" | "workshop_list" | "category_grid" | "city_grid" | "venue_list" | "steps_rail" | "threshold_explainer" | "pilot_banner" | "feature_split" | "link_cards" | "review_list" | "faq_list" | "pricing_example" | "cancellation_policy" | "form" | "link_columns" | "cta_band" | "page_core" | null;
  sort: number | null;
  title: string | null;
  body: string | null;
  items: unknown | null;
  cta_label: string | null;
  cta_to: string | null;
  style: "default" | "cloud" | "ink" | "coral" | null;
  page: string | Page | null;
  image: string | DirectusFile | null;
  column_left: string | null;
  column_right: string | null;
  video_url: string | null;
  video_file: string | DirectusFile | null;
  eyebrow: string | null;
  variant: "split" | "overlay" | "centered" | "search" | "grid" | "rail" | "dates" | "agenda" | "tiles" | "list" | "numbered" | "timeline" | "cards" | "interactive" | "legend" | "image-right" | "image-left" | "single" | null;
  image_alt: string | null;
  cta_secondary_label: string | null;
  cta_secondary_to: string | null;
  source: "featured" | "upcoming" | "context" | "category" | "manual" | "latest" | "venues" | null;
  item_limit: number | null;
  filter_category: string | Category | null;
  filter_city: string | City | null;
  form: "contact" | "maker_signup" | "venue_search" | "venue_offer" | "follow" | "business" | null;
  anchor: string | null;
  padding_top: "none" | "sm" | "md" | "lg" | null;
  padding_bottom: "none" | "sm" | "md" | "lg" | null;
  hidden: boolean | null;
  settings: unknown | null;
  workshops: Array<number | PageBlocksWorkshop>;
}

export interface PageBlocksWorkshop {
  id: number;
  page_blocks_id: number | PageBlock | null;
  workshops_id: string | Workshop | null;
  sort: number | null;
}

export interface Page {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "published" | "archived";
  title: string;
  slug: string;
  body: string | null;
  blocks: Array<number | PageBlock>;
  menu_label: string | null;
  menu_location: "" | "header" | "footer" | "both" | null;
  menu_order: number | null;
  page_type: "content" | "home" | "cat" | "detail" | "aanbieder" | "account" | "maker" | "locatie" | "hulp" | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
}

export interface Payout {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "scheduled" | "paid" | "failed";
  period_start: string | null;
  period_end: string | null;
  gross_amount: string | null;
  commission_amount: string | null;
  net_amount: string | null;
  mollie_payout_id: string | null;
  provider: string | Provider;
  bookings: Array<string | Booking>;
}

export interface PlatformSetting {
  id: number;
  min_hours_decision_before_start: number | null;
  enforce_min_decision_lead: boolean;
  reminder_hours_before_decision: unknown | null;
  decision_default_time: string | null;
  pilot_no_payments: boolean;
  require_iban_in_pilot: boolean;
  offer_min_hours_ahead: number | null;
  offer_expires_days_before: number | null;
  feature_auth_social: boolean;
  feature_venues: boolean;
}

export interface ProviderDeclaration {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUser | null;
  user_updated: string | DirectusUser | null;
  provider: string | Provider | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  home_address: string | null;
  email: string | null;
  phone: string | null;
  kind: "private" | "business" | null;
  kvk_number: string | null;
  trade_name: string | null;
  iban: string | null;
  declared_adult: boolean;
  declared_info_correct: boolean;
  declared_risks: boolean;
  declared_qualifications: boolean;
  declared_safe: boolean;
  declared_reachable: boolean;
  declared_incidents: boolean;
  accepted_terms_version: string | null;
  signed_at: string | null;
  ip: string | null;
}

export interface ProviderMedia {
  id: string;
  alt: string | null;
  sort: number | null;
  provider: string | Provider | null;
  file: string | DirectusFile;
}

export interface Provider {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "pending_review" | "published" | "paused" | "archived";
  slug: string;
  display_name: string;
  profession: string | null;
  bio_short: string | null;
  bio_long: string | null;
  neighbourhood: string | null;
  location_name: string | null;
  address: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  active_since: string | null;
  verified: boolean;
  verified_at: string | null;
  accepts_groups: boolean;
  max_group_size: number | null;
  response_time_minutes: number | null;
  rating_avg: string | null;
  rating_count: number | null;
  participants_count: number | null;
  workshops_count: number | null;
  is_top_rated: boolean;
  user: string | DirectusUser | null;
  avatar: string | DirectusFile | null;
  cover: string | DirectusFile | null;
  city: string | City | null;
  gallery: Array<string | ProviderMedia>;
  workshops: Array<string | Workshop>;
  languages: Array<number | ProvidersLanguage>;
  name: string | null;
  title: string | null;
  details: unknown | null;
  kvk_number: string | null;
  vat_number: string | null;
  mollie_connect_id: string | null;
  payout_iban_last4: string | null;
  commission_rate: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
  first_name: string | null;
  area_label: string | null;
  kind: "private" | "business" | null;
  has_location: "own" | "need" | "unknown" | null;
  onboarded_at: string | null;
}

export interface ProvidersLanguage {
  id: number;
  sort: number | null;
  provider_id: string | Provider | null;
  language_id: string | Language | null;
}

export interface Redirect {
  id: string;
  source: string;
  target: string;
  code: "301" | "302" | null;
  active: boolean;
}

export interface Review {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "pending" | "published" | "rejected";
  author_display_name: string | null;
  rating_overall: number;
  rating_atmosphere: number | null;
  rating_explanation: number | null;
  rating_value: number | null;
  body: string | null;
  provider_reply: string | null;
  provider_replied_at: string | null;
  published_at: string | null;
  booking: string | Booking;
  workshop: string | Workshop;
  provider: string | Provider;
  user: string | DirectusUser | null;
}

export interface SessionOffer {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUser | null;
  user_updated: string | DirectusUser | null;
  booking: string | Booking | null;
  offered_session: string | WorkshopSession | null;
  status: "pending" | "accepted" | "declined" | "expired" | null;
  expires_at: string | null;
  responded_at: string | null;
}

export interface Setting {
  id: string;
  service_fee_percentage: string | null;
  default_commission_rate: string | null;
  default_cancellation_policy: "flexible_48h" | "moderate_7d" | "strict" | null;
  giftcard_validity_months: number | null;
  hold_minutes: number | null;
  support_email: string | null;
  support_phone: string | null;
  social_links: unknown | null;
  announcement_bar: string | null;
  default_seo_image: string | DirectusFile | null;
  announcement_highlight: string | null;
  announcement_link: string | null;
}

export interface VenueContactRequest {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUser | null;
  user_updated: string | DirectusUser | null;
  listing: string | VenueListing | null;
  from_user: string | DirectusUser | null;
  message: string | null;
  share_email: boolean;
  status: "new" | "forwarded" | "closed" | null;
}

export interface VenueListingImage {
  id: string;
  listing: string | VenueListing | null;
  file: string | DirectusFile | null;
  alt: string | null;
  sort: number | null;
}

export interface VenueListing {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUser | null;
  user_updated: string | DirectusUser | null;
  owner: string | DirectusUser | null;
  visible: boolean;
  status: "draft" | "published" | null;
  name: string | null;
  place: string | City | null;
  neighbourhood: string | null;
  kind: "kitchen" | "atelier" | "hall" | "outdoor" | null;
  capacity: number | null;
  amenities: unknown | null;
  description: string | null;
  availability: unknown | null;
  images: Array<string | VenueListingImage>;
}

export interface Venue {
  id: string;
  status: "draft" | "published" | "archived" | null;
  date_created: string | null;
  date_updated: string | null;
  name: string | null;
  slug: string | null;
  description: string | null;
  address: string | null;
  postal_code: string | null;
  neighbourhood: string | null;
  lat: number | null;
  lng: number | null;
  max_capacity: number | null;
  price_per_hour: string | null;
  surface_m2: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  amenities: unknown | null;
  photos: unknown | null;
  city: string | City | null;
}

export interface WorkshopFaq {
  id: string;
  question: string;
  answer: string;
  sort: number | null;
  workshop: string | Workshop | null;
}

export interface WorkshopInclusion {
  id: string;
  text: string;
  sort: number | null;
  workshop: string | Workshop | null;
}

export interface WorkshopMedia {
  id: string;
  alt: string | null;
  sort: number | null;
  workshop: string | Workshop | null;
  file: string | DirectusFile;
}

export interface WorkshopPrivate {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | DirectusUser | null;
  user_updated: string | DirectusUser | null;
  workshop: string | Workshop | null;
  address: string | null;
  postal_code: string | null;
}

export interface WorkshopSession {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "open" | "full" | "cancelled" | "completed";
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  seats_taken: number | null;
  price_override: string | null;
  is_private: boolean;
  booking_deadline_hours: number | null;
  cancellation_reason: string | null;
  workshop: string | Workshop;
  bookings: Array<string | Booking>;
  min_participants: number | null;
  decision_at: string | null;
  goes_ahead: boolean | null;
  state: "open" | "confirmed" | "not_happening" | "cancelled_by_provider" | null;
  confirmed_at: string | null;
  closed_at: string | null;
}

export interface Workshop {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  user_created: string | null;
  user_updated: string | null;
  status: "draft" | "pending_review" | "published" | "paused" | "archived";
  published_at: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  intro: string | null;
  description: string | null;
  featured: boolean;
  provider: string | Provider;
  category: string | Category | null;
  media: Array<string | WorkshopMedia>;
  inclusions: Array<string | WorkshopInclusion>;
  faq: Array<string | WorkshopFaq>;
  sessions: Array<string | WorkshopSession>;
  reviews: Array<string | Review>;
  secondary_categories: Array<number | WorkshopsCategory>;
  occasions: Array<number | WorkshopsOccasion>;
  name: string | null;
  display_name: string | null;
  duration_minutes: number | null;
  level: "beginner" | "advanced" | "all_levels" | null;
  min_participants: number | null;
  max_participants: number | null;
  format: "on_location" | "at_home" | "at_office" | "online" | "seeking" | null;
  age_rating: string | AgeRating | null;
  languages: Array<number | WorkshopsLanguage>;
  dietary_options: Array<number | WorkshopsDietaryOption>;
  amenities: Array<number | WorkshopsAmenity>;
  inclusion_types: Array<number | WorkshopsInclusionType>;
  price_per_person: string | null;
  price_from: string | null;
  private_booking_available: boolean;
  private_price: string | null;
  group_quote_from: number | null;
  cancellation_policy: string | CancellationPolicy | null;
  instant_bookable: boolean;
  giftcard_eligible: boolean;
  location_inherits_provider: boolean;
  location_name: string | null;
  address: string | null;
  postal_code: string | null;
  neighbourhood: string | null;
  lat: number | null;
  lng: number | null;
  address_visibility: "after_booking" | "public" | null;
  city: string | City | null;
  rating_avg: string | null;
  rating_count: number | null;
  rating_atmosphere: string | null;
  rating_explanation: string | null;
  rating_value: string | null;
  participants_count: number | null;
  badge: "none" | "new" | "top_rated" | "almost_full" | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | DirectusFile | null;
  accessibility: string | null;
  submitted_at: string | null;
  review_note: string | null;
  next_session_at: string | null;
}

export interface WorkshopsAmenity {
  id: number;
  sort: number | null;
  workshop_id: string | Workshop | null;
  amenity_id: string | Amenity | null;
}

export interface WorkshopsCategory {
  id: number;
  sort: number | null;
  workshop_id: string | Workshop | null;
  category_id: string | Category | null;
}

export interface WorkshopsDietaryOption {
  id: number;
  sort: number | null;
  workshop_id: string | Workshop | null;
  dietary_option_id: string | DietaryOption | null;
}

export interface WorkshopsInclusionType {
  id: number;
  sort: number | null;
  workshop_id: string | Workshop | null;
  inclusion_type_id: string | InclusionType | null;
}

export interface WorkshopsLanguage {
  id: number;
  sort: number | null;
  workshop_id: string | Workshop | null;
  language_id: string | Language | null;
}

export interface WorkshopsOccasion {
  id: number;
  sort: number | null;
  workshop_id: string | Workshop | null;
  occasion_id: string | Occasion | null;
}

/** Eigen velden op directus_users; de standaardvelden komen uit @directus/sdk. */
export interface DirectusUser {
  email_verified_at?: string | null;
  last_context?: "participant" | "provider" | "venue" | null;
  notify_reminder_decision?: boolean;
  notify_new_session_followed?: boolean;
  notify_saved_almost_full?: boolean;
  notify_tips?: boolean;
}

export type DirectusFile = SdkDirectusFile<Schema>;
export type DirectusRole = SdkDirectusRole<Schema>;
export type DirectusFolder = SdkDirectusFolder<Schema>;

export interface Schema {
  age_ratings: AgeRating[];
  amenities: Amenity[];
  article_authors: ArticleAuthor[];
  article_faq: ArticleFaq[];
  articles: Article[];
  articles_related: ArticlesRelated[];
  articles_workshops: ArticlesWorkshop[];
  bookings: Booking[];
  business_requests: BusinessRequest[];
  cancellation_policies: CancellationPolicy[];
  categories: Category[];
  cities: City[];
  dietary_options: DietaryOption[];
  favorites: Favorite[];
  follows: Follow[];
  form_submissions: FormSubmission[];
  giftcards: Giftcard[];
  inclusion_types: InclusionType[];
  languages: Language[];
  location_page_faq: LocationPageFaq[];
  location_pages: LocationPage[];
  newsletter_subscribers: NewsletterSubscriber[];
  occasions: Occasion[];
  page_blocks: PageBlock[];
  page_blocks_workshops: PageBlocksWorkshop[];
  pages: Page[];
  payouts: Payout[];
  platform_settings: PlatformSetting;
  provider_declarations: ProviderDeclaration[];
  provider_media: ProviderMedia[];
  providers: Provider[];
  providers_languages: ProvidersLanguage[];
  redirects: Redirect[];
  reviews: Review[];
  session_offers: SessionOffer[];
  settings: Setting;
  venue_contact_requests: VenueContactRequest[];
  venue_listing_images: VenueListingImage[];
  venue_listings: VenueListing[];
  venues: Venue[];
  workshop_faq: WorkshopFaq[];
  workshop_inclusions: WorkshopInclusion[];
  workshop_media: WorkshopMedia[];
  workshop_private: WorkshopPrivate[];
  workshop_sessions: WorkshopSession[];
  workshops: Workshop[];
  workshops_amenities: WorkshopsAmenity[];
  workshops_categories: WorkshopsCategory[];
  workshops_dietary_options: WorkshopsDietaryOption[];
  workshops_inclusion_types: WorkshopsInclusionType[];
  workshops_languages: WorkshopsLanguage[];
  workshops_occasions: WorkshopsOccasion[];
  directus_users: DirectusUser[];
}
