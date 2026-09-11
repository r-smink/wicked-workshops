/* ===========================================================================
   Mock-data voor het prototype.

   Zodra Directus is aangesloten, haal je deze gegevens via lib/directus.js
   op en geef je ze als props mee aan de pagina-componenten. Tot die tijd vallen
   de componenten terug op deze vaste voorbeelddata (verzonnen aanbod en
   verzonnen reviews, zie README).
   =========================================================================== */

export const CATEGORIES = [
  { name: "Koken & bakken", slug: "koken-en-bakken", icon: "fork", count: "140+" },
  { name: "Keramiek & klei", slug: "keramiek-en-klei", icon: "bowl", count: "90+" },
  { name: "Schilderen & kunst", slug: "schilderen-en-kunst", icon: "palette", count: "75+" },
  { name: "Drinks & proeverijen", slug: "drinks-en-proeverijen", icon: "glass", count: "60+" },
  { name: "Bloemen & groen", slug: "bloemen-en-groen", icon: "flower", count: "45+" },
  { name: "Ambacht & maken", slug: "ambacht-en-maken", icon: "hammer", count: "120+" },
  { name: "Fotografie & media", slug: "fotografie-en-media", icon: "camera", count: "38+" },
  { name: "Dans, muziek & theater", slug: "dans-muziek-en-theater", icon: "music", count: "40+" },
  { name: "Wellness & beauty", slug: "wellness-en-beauty", icon: "spa", count: "55+" },
  { name: "Actief & buiten", slug: "actief-en-buiten", icon: "hike", count: "30+" },
  { name: "Niche & onverwacht", slug: "niche-en-onverwacht", icon: "spark", count: "28+" },
  { name: "Duurzaam & repair", slug: "duurzaam-en-repair", icon: "recycle", count: "20+" },
];

export const OCCASIONS = [
  { name: "Date", sub: "Met z'n tweeen", icon: "heart" },
  { name: "Vrienden", sub: "Gezellig samen", icon: "users" },
  { name: "Teamuitje", sub: "Voor bedrijven", icon: "shield" },
  { name: "Kinderfeestje", sub: "Voor de kids", icon: "spark" },
  { name: "Vrijgezellenfeest", sub: "Onvergetelijk", icon: "glass" },
  { name: "Cadeau", sub: "Geef beleving", icon: "gift" },
];

export const FEATURED = [
  { slug: "italiaans-koken-met-marco", title: "Italiaans koken met Marco", city: "Utrecht", duration: "3 uur", rating: 4.9, count: 312, price: 45, badge: "top_rated", icon: "fork" },
  { slug: "draai-je-eigen-keramiek", title: "Draai je eigen keramiek", city: "Amsterdam", duration: "2,5 uur", rating: 4.8, count: 198, price: 39, badge: "new", icon: "bowl" },
  { slug: "cocktails-shaken", title: "Cocktails shaken met een mixoloog", city: "Rotterdam", duration: "2 uur", rating: 4.9, count: 146, price: 42, badge: "almost_full", icon: "glass" },
  { slug: "bloemschikken-beginners", title: "Bloemschikken voor beginners", city: "Den Haag", duration: "2 uur", rating: 4.7, count: 88, price: 35, icon: "flower" },
];

export const LISTING = [
  { slug: "italiaans-koken-met-marco", title: "Italiaans koken met Marco", area: "Wittevrouwen", duration: "3 uur", km: "1,2 km", rating: 4.9, count: 312, price: 45, badge: "top_rated", icon: "fork", x: 42, y: 38 },
  { slug: "sushi-workshop-beginners", title: "Sushi workshop voor beginners", area: "Centrum", duration: "2,5 uur", km: "2,0 km", rating: 4.8, count: 207, price: 49, icon: "bowl", x: 62, y: 24 },
  { slug: "taarten-decoreren", title: "Taarten decoreren als een pro", area: "Lombok", duration: "3 uur", km: "3,1 km", rating: 4.7, count: 64, price: 39, badge: "new", icon: "spark", x: 26, y: 56 },
  { slug: "zuurdesembrood-bakken", title: "Zuurdesembrood bakken", area: "Tuindorp", duration: "4 uur", km: "4,0 km", rating: 4.9, count: 51, price: 55, icon: "fork", x: 70, y: 62 },
  { slug: "pizza-houtoven", title: "Pizza maken met houtoven", area: "Leidsche Rijn", duration: "2,5 uur", km: "5,3 km", rating: 4.8, count: 129, price: 42, icon: "fork", x: 16, y: 30 },
  { slug: "thais-koken", title: "Thais koken workshop", area: "Centrum", duration: "3 uur", km: "2,1 km", rating: 4.7, count: 96, price: 47, icon: "bowl", x: 54, y: 74 },
];

export const FILTER_GROUPS = [
  { key: "wanneer", label: "Wanneer", options: ["Vandaag", "Dit weekend", "Deze maand", "Doordeweeks", "Kies datum"] },
  { key: "prijs", label: "Prijs per persoon", type: "range" },
  { key: "afstand", label: "Afstand", options: ["5 km", "10 km", "25 km", "50 km", "Heel NL"] },
  { key: "type", label: "Type workshop", options: ["Op locatie", "Bij jou thuis", "Op kantoor", "Online"] },
  { key: "duur", label: "Duur", options: ["Tot 2 uur", "2 tot 4 uur", "Hele dag", "Meerdere dagen"] },
  { key: "groep", label: "Groepsgrootte", options: ["Voor 2", "Kleine groep", "Grote groep", "Teamuitje (10+)"] },
  { key: "gelegenheid", label: "Geschikt voor", options: ["Date", "Vrienden", "Teamuitje", "Kinderfeestje", "Vrijgezellenfeest", "Familie"] },
  { key: "niveau", label: "Niveau", options: ["Beginner", "Gevorderd", "Alle niveaus"] },
  { key: "taal", label: "Taal", options: ["Nederlands", "Engels"] },
  { key: "leeftijd", label: "Geschikt voor leeftijd", options: ["Kindvriendelijk", "16+", "18+"] },
  { key: "dieet", label: "Dieetwensen", options: ["Vegetarisch", "Vegan", "Glutenvrij", "Halal"] },
  { key: "inbegrepen", label: "Inbegrepen", options: ["Materiaal", "Hapjes & drankjes", "Mee naar huis"] },
  { key: "score", label: "Beoordeling", options: ["4,5+ sterren", "4,0+ sterren"] },
  { key: "aanbieder", label: "Aanbieder", options: ["Geverifieerd", "Topbeoordeeld", "Nieuw talent"] },
  { key: "extra", label: "Extra's", options: ["Gratis annuleren", "Direct boekbaar", "Cadeaubon"] },
  { key: "bereikbaar", label: "Bereikbaarheid", options: ["Rolstoeltoegankelijk", "Gratis parkeren", "Goed met OV"] },
];

export const SESSIONS = [
  { id: 1, day: "Zaterdag 8 augustus", time: "14:00 tot 17:00", seats: 4 },
  { id: 2, day: "Woensdag 12 augustus", time: "19:00 tot 22:00", seats: 2 },
  { id: 3, day: "Zaterdag 15 augustus", time: "14:00 tot 17:00", seats: 8 },
];

export const REVIEWS = [
  { name: "Sanne", when: "juli 2026", body: "De pasta was heerlijk en Marco maakt er echt een feestje van. Perfect voor een date." },
  { name: "Mark", when: "juni 2026", body: "Met het hele team geweest, van begin tot eind goed geregeld. Aanrader als teamuitje." },
  { name: "Iris", when: "juni 2026", body: "Leuke sfeer, duidelijke uitleg en je leert echt iets. De tiramisu maak ik nu elke week." },
  { name: "Thomas", when: "mei 2026", body: "Als verrassing cadeau gekregen en het was een topavond. Alles tot in de puntjes verzorgd." },
];

export const FAQ = [
  ["Wat als ik moet annuleren?", "Je kunt tot 48 uur van tevoren gratis annuleren, daarna betaal je 50 procent. Verzetten naar een andere datum kan altijd kosteloos."],
  ["Kan ik alleen komen?", "Zeker, je sluit aan bij de groep en werkt samen met een andere deelnemer."],
  ["Moet ik iets meenemen?", "Nee, alles is aanwezig. Kom in makkelijke kleding, een schort krijg je van Marco."],
  ["Is er parkeergelegenheid?", "Betaald parkeren op straat. De studio is 5 minuten lopen van Utrecht CS, dus met het OV kom je het makkelijkst."],
];

export const MARCO_WORKSHOPS = [
  { title: "Italiaans koken met Marco", meta: "3 uur · 4 tot 12 pers.", rating: 4.9, count: 312, price: 45, next: "za 8 aug", badge: "top_rated", icon: "fork" },
  { title: "Verse pasta masterclass", meta: "2,5 uur · 4 tot 10 pers.", rating: 4.8, count: 76, price: 55, next: "di 11 aug", icon: "bowl" },
  { title: "Tiramisu & dolci workshop", meta: "2 uur · 4 tot 12 pers.", rating: 4.9, count: 24, price: 39, next: "zo 16 aug", icon: "spark" },
];

export const MARCO_REVIEWS = [
  { name: "Sanne", when: "juli 2026", ws: "Italiaans koken", body: "Marco maakt er echt een feestje van. Je proeft de liefde voor het vak in alles." },
  { name: "Thomas", when: "juni 2026", ws: "Pasta masterclass", body: "Dacht dat ik pasta kon maken. Bleek van niet. Nu wel, dankzij Marco." },
  { name: "Iris", when: "mei 2026", ws: "Tiramisu & dolci", body: "Gezellige avond met vriendinnen en het resultaat was verrassend goed." },
  { name: "Mark", when: "juni 2026", ws: "Italiaans koken", body: "Als teamuitje geboekt met tien collega's. Alles was perfect geregeld." },
];

export const ART_CATEGORIES = ["Alles", "Koken", "Inspiratie", "Cadeau", "Ambacht", "Teamuitjes"];

export const ARTICLES = [
  { slug: "zelf-sushi-rollen", cat: "Koken", title: "Zelf sushi rollen: de technieken uit een workshop", read: "5 min lezen",
    date: "3 aug 2026", icon: "bowl", lead: true,
    excerpt: "Met de juiste rijst, een beetje techniek en wat oefening rol je thuis binnen een uur je eerste maki. Dit is wat je in een workshop leert." },
  { slug: "wat-te-doen-dit-weekend", cat: "Inspiratie", title: "Wat te doen dit weekend: 25 verse ideeen", read: "4 min lezen",
    date: "1 aug 2026", icon: "spark",
    excerpt: "Van glasblazen tot een wijnproeverij. Vijfentwintig uitjes die je zo kunt boeken." },
  { slug: "origineel-cadeau-geven", cat: "Cadeau", title: "Origineel cadeau nodig? Geef een beleving", read: "3 min lezen",
    date: "28 jul 2026", icon: "gift",
    excerpt: "Waarom een middag samen iets maken langer blijft hangen dan het zoveelste cadeaubonnetje." },
  { slug: "thuis-ramen-maken", cat: "Koken", title: "Thuis ramen maken zoals in Japan", read: "6 min lezen",
    date: "24 jul 2026", icon: "bowl",
    excerpt: "De bouillon is het werk, de rest is montage. Zo pak je het aan zonder drie dagen in de keuken te staan." },
  { slug: "teamuitje-dat-blijft-hangen", cat: "Teamuitjes", title: "Een teamuitje dat wel blijft hangen", read: "5 min lezen",
    date: "19 jul 2026", icon: "users",
    excerpt: "Waarom samen iets maken beter werkt dan het zoveelste escape room-bezoek, en waar je op let bij het kiezen." },
  { slug: "draaien-op-de-schijf", cat: "Ambacht", title: "Draaien op de pottenbakkersschijf: wat je eerste les oplevert", read: "4 min lezen",
    date: "15 jul 2026", icon: "bowl",
    excerpt: "Een scheve kom en heel veel plezier. Wat je realistisch leert in twee en een half uur klei." },
  { slug: "origineel-date-idee", cat: "Inspiratie", title: "Origineel date-idee: samen koken", read: "4 min lezen",
    date: "11 jul 2026", icon: "heart",
    excerpt: "Praten gaat makkelijker met je handen in het deeg. Zeven workshops die werken als eerste of vijftigste date." },
  { slug: "workshop-cadeau-geven", cat: "Cadeau", title: "Een workshop cadeau geven: zo werkt het", read: "3 min lezen",
    date: "6 jul 2026", icon: "gift",
    excerpt: "Bon kopen, datum laten kiezen, klaar. In drie stappen uitgelegd, inclusief de kleine lettertjes." },
  { slug: "zilver-smeden", cat: "Ambacht", title: "Zilver smeden: van plaatje naar ring in een dag", read: "7 min lezen",
    date: "2 jul 2026", icon: "spark",
    excerpt: "Zagen, vijlen, solderen en polijsten. Een dag lang ambacht, en je gaat naar huis met iets dat je zelf hebt gemaakt." },
];

export const ART_SECTIONS = [
  { id: "rijst", n: 1, h: "De rijst is het halve werk" },
  { id: "rollen", n: 2, h: "Rollen zonder knoeien" },
  { id: "thuis", n: 3, h: "Dit heb je thuis nodig" },
  { id: "vragen", n: 4, h: "Veelgestelde vragen" },
];

export const ART_FAQ = [
  ["Is zelf sushi maken goedkoper dan bestellen?", "Ja, zeker als je voor meer personen maakt. De basisspullen kosten eenmalig zo'n 15 euro en de ingredienten per persoon een paar euro."],
  ["Kan ik sushi maken zonder rauwe vis?", "Absoluut. Komkommer, avocado, omelet of gerookte zalm werken net zo goed en zijn makkelijker te bewaren."],
  ["Hoe lang duurt het om het te leren?", "Na een workshop van 2,5 uur rol je zelfstandig maki en california rolls. Nigiri en sashimi vragen meer oefening."],
];

export const PROFILE_LANGS = ["Nederlands", "Engels", "Duits", "Frans", "Spaans", "Italiaans"];
export const PROFILE_CITIES = ["Utrecht", "Amsterdam", "Rotterdam", "Den Haag", "Eindhoven", "Groningen", "Amersfoort", "Haarlem"];

export const REQUIRED = [
  ["first_name", "Voornaam"], ["last_name", "Achternaam"], ["email", "E-mailadres"],
  ["phone", "Telefoonnummer"], ["street", "Straat"], ["house_number", "Huisnummer"],
  ["postal_code", "Postcode"], ["residence", "Woonplaats"],
  ["display_name", "Naam op je profiel"], ["profession", "Vakgebied"],
  ["bio_short", "Korte introductie"], ["bio_long", "Over jou"],
  ["city", "Stad"], ["iban", "Rekeningnummer"], ["account_holder", "Tenaamstelling"],
];

export const EMPTY_PROFILE = {
  first_name: "", last_name: "", email: "", phone: "", birth_date: "",
  street: "", house_number: "", addition: "", postal_code: "", residence: "", country: "Nederland",
  company_name: "", kvk_number: "", vat_number: "", vat_liable: true, kor: false,
  display_name: "", profession: "", bio_short: "", bio_long: "", languages: ["Nederlands"],
  active_since: "", website: "", instagram: "",
  city: "", neighbourhood: "", location_name: "", location_same: true,
  location_street: "", location_postal: "",
  wheelchair: false, parking: false, transit: false,
  accepts_groups: true, max_group_size: "12",
  iban: "", account_holder: "", terms: false,
};

export const MARCO_PROFILE = {
  ...EMPTY_PROFILE,
  id: "57626c22-6a10-43f5-b7aa-3d0741db4e4e",
  slug: "marco-rossi-kok",
  first_name: "Marco", last_name: "Rossi", email: "marco@kookstudiodepan.nl", phone: "06 12 34 56 78",
  street: "Poortstraat", house_number: "14", postal_code: "3572 HH", residence: "Utrecht",
  company_name: "Kookstudio De Pan", kvk_number: "62817394", vat_number: "NL003456789B12",
  display_name: "Marco Rossi", profession: "Italiaanse kok",
  bio_short: "Italiaanse kookworkshops in een echte kookstudio in Wittevrouwen.",
  bio_long: "Opgegroeid in de keuken van mijn nonna in Bologna, inmiddels tien jaar in Utrecht.",
  languages: ["Nederlands", "Italiaans", "Engels"], active_since: "2019",
  city: "Utrecht", neighbourhood: "Wittevrouwen", location_name: "Kookstudio De Pan",
  wheelchair: true, transit: true, accepts_groups: true, max_group_size: "12",
  iban: "NL91 INGB 0002 4453 21", account_holder: "M. Rossi", terms: true,
};

export const WIZ_STEPS = [
  ["Basis", "Titel, categorie en waarvoor het geschikt is"],
  ["Inhoud", "Wat deelnemers gaan doen en wat erbij zit"],
  ["Praktisch", "Duur, groepsgrootte, niveau en voorzieningen"],
  ["Beeld", "Foto's van de workshop"],
  ["Prijs", "Prijs, annuleren en groepen"],
  ["Datums", "Wanneer mensen kunnen boeken"],
];

export const WIZ_CATEGORIES = [
  "Koken & bakken", "Keramiek & klei", "Schilderen & kunst", "Drinks & proeverijen",
  "Bloemen & groen", "Ambacht & maken", "Fotografie & media", "Dans, muziek & theater",
  "Wellness & beauty", "Actief & buiten", "Niche & onverwacht", "Duurzaam & repair",
];
export const WIZ_OCCASIONS = ["Date", "Vrienden", "Teamuitje", "Kinderfeestje", "Vrijgezellenfeest", "Cadeau", "Familie"];
export const WIZ_DIET = ["Vegetarisch", "Vegan", "Glutenvrij", "Halal"];
export const WIZ_INCLUSION_TYPES = ["Materiaal inbegrepen", "Hapjes & drankjes", "Mee naar huis", "Recepten of handleiding"];

export const EMPTY_WORKSHOP = {
  title: "", category: "", city: "", occasions: [],
  intro: "", description: "",
  inclusions: [""], inclusion_types: [], faq: [{ q: "", a: "" }],
  duration: "", level: "beginner", languages: ["Nederlands"],
  min_participants: "4", max_participants: "12", format: "on_location",
  diet: [], age_rating: "Alle leeftijden",
  wheelchair: false, parking: false, transit: false,
  media: [null, null, null, null, null, null],
  price: "", cancellation: "flexible_48h", instant: true, giftcard: true,
  group_quote: true, group_from: "10",
  sessions: [{ date: "", time: "14:00", capacity: "12" }],
  recurring: { enabled: false, weekday: 1, weeks: 8, time: "14:00", capacity: "12" },
};

export const WIZ_REQUIRED = [
  ["title", "Titel"], ["category", "Categorie"], ["city", "Stad"], ["intro", "Korte omschrijving"],
  ["description", "Beschrijving"], ["duration", "Duur"], ["price", "Prijs per persoon"],
];

export const SIDE_COPY = {
  visitor: {
    h: "Bewaar wat je leuk vindt, boek in twee tikken",
    p: "Met een account zie je je boekingen terug, bewaar je favorieten en schrijf je reviews.",
    list: ["Al je boekingen op een plek", "Favorieten bewaren voor later", "Gratis annuleren tot 48 uur vooraf"],
  },
  provider: {
    h: "Deel je vak, bepaal je eigen prijs",
    p: "Van thuiskok tot keramist. Zet je workshop online en bereik heel Nederland.",
    list: ["Je eerste workshop staat binnen een dag online", "Jij bepaalt datums, prijs en groepsgrootte", "Uitbetaling na afloop, zonder gedoe"],
  },
};

export const DASH_SESSIONS = [
  { date: "za 8 aug", time: "14:00", ws: "Italiaans koken met Marco", booked: 8, cap: 12 },
  { date: "di 11 aug", time: "19:00", ws: "Verse pasta masterclass", booked: 10, cap: 10 },
  { date: "wo 12 aug", time: "19:00", ws: "Italiaans koken met Marco", booked: 10, cap: 12 },
  { date: "za 15 aug", time: "14:00", ws: "Italiaans koken met Marco", booked: 4, cap: 12 },
  { date: "zo 16 aug", time: "13:00", ws: "Tiramisu & dolci workshop", booked: 2, cap: 12 },
];

export const DASH_BOOKINGS = [
  { code: "WW-8F2K4M", name: "Sanne de Vries", ws: "Italiaans koken", date: "za 8 aug", people: 2, total: 90, status: "confirmed" },
  { code: "WW-3QN7XZ", name: "Mark Janssen", ws: "Verse pasta", date: "di 11 aug", people: 6, total: 330, status: "confirmed" },
  { code: "WW-9LD2PT", name: "Iris Bakker", ws: "Italiaans koken", date: "wo 12 aug", people: 2, total: 90, status: "confirmed" },
  { code: "WW-5RB8HC", name: "Thomas Vos", ws: "Tiramisu & dolci", date: "zo 16 aug", people: 4, total: 156, status: "pending" },
  { code: "WW-1XK6VD", name: "Noor el Amrani", ws: "Italiaans koken", date: "za 1 aug", people: 2, total: 90, status: "completed" },
];

export const STATUS_LABEL = {
  confirmed: ["ww-badge--live", "Bevestigd"],
  pending: ["ww-badge--paused", "Wacht op betaling"],
  completed: ["ww-badge--draft", "Afgerond"],
};

export const DASH_WORKSHOPS = [
  { title: "Italiaans koken met Marco", status: "live", rating: 4.9, count: 312, price: 45, sessions: 3, icon: "fork" },
  { title: "Verse pasta masterclass", status: "live", rating: 4.8, count: 76, price: 55, sessions: 1, icon: "bowl" },
  { title: "Tiramisu & dolci workshop", status: "live", rating: 4.9, count: 24, price: 39, sessions: 1, icon: "spark" },
  { title: "Wijnproeverij Italiaans", status: "draft", rating: null, count: 0, price: 35, sessions: 0, icon: "glass" },
];

export const DASH_NAV = [
  { key: "overview", label: "Overzicht", icon: "grid" },
  { key: "workshops", label: "Workshops", icon: "spark" },
  { key: "agenda", label: "Agenda", icon: "calendar" },
  { key: "bookings", label: "Boekingen", icon: "book", dot: 1 },
  { key: "reviews", label: "Reviews", icon: "star", dot: 2 },
  { key: "locaties", label: "Locaties", icon: "place" },
  { key: "payouts", label: "Uitbetalingen", icon: "euro" },
  { key: "profile", label: "Profiel", icon: "user" },
];

export const DASH_TITLES = {
  overview: ["Hoi Marco", "Hier staat je week in een oogopslag."],
  workshops: ["Workshops", "Beheer je aanbod en publiceer nieuwe workshops."],
  agenda: ["Agenda", "Voeg datums toe zodat mensen kunnen boeken."],
  bookings: ["Boekingen", "Wie komt er wanneer, en wat is er betaald."],
  reviews: ["Reviews", "Reageren houdt je responstijd laag en je profiel sterk."],
  locaties: ["Locaties", "Verhuur je ruimte of vind een plek"],
  payouts: ["Uitbetalingen", "Wat er binnenkomt en wanneer."],
  profile: ["Profiel", "Je gegevens, je openbare profiel en je uitbetaling."],
  wizard: ["Nieuwe workshop", "Zes stappen en je staat online."],
  "venue-form": ["Locatie toevoegen", "Verhuur je ruimte aan workshopgevers."],
};

export const MOBILE_CITIES = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag"];

export const WIZ_VENUE_STEPS = [
  ["Basics", "Naam, stad en beschrijving"],
  ["Ruimte", "Capaciteit, oppervlak en prijs"],
  ["Voorzieningen", "Wat is er aanwezig"],
  ["Contact", "Hoe bereiken ze je"],
];

export const EMPTY_VENUE = {
  name: "", slug: "", description: "", city: "", address: "", postal_code: "",
  neighbourhood: "", lat: "", lng: "", max_capacity: "", price_per_hour: "",
  surface_m2: "", contact_name: "", contact_email: "", contact_phone: "",
  amenities: [],
};

export const VENUE_AMENITIES = [
  "Keuken", "Oven", "Koelkast", "Audio/Speakers", "Projector", "WiFi",
  "Parkeerplek", "Rolstoeltoegankelijk", "Sanitair", "Verwarming",
];

export const DASH_VENUES = [
  { id: "1", name: "Kookstudio De Pan", city: "Utrecht", max_capacity: 12, price_per_hour: 45, status: "draft" },
];

/* ===========================================================================
   Statische pagina's (bedrijven, cadeaubon).

   Worden gebruikt als fallback zolang de `pages`-collectie in Directus nog
   niet is ingericht. De structuur sluit aan bij mapPage() in lib/directus.js:
   een hero, een optionele intro en een lijst secties met een layout-hint.
   =========================================================================== */
export const BUSINESS_PAGE = {
  slug: "bedrijven",
  title: "Voor bedrijven",
  hero_title: "Iets wicked met het hele team",
  hero_subtitle: "Van teamuitje tot personeelsfeest. Wij regelen de workshop, de facturatie en alles ertussenin.",
  hero_image: null,
  intro: "Geen gedoe met offertes, coördinatie of facturen. Eén contactpunt, één factuur met btw, en een beleving die je collega's nog lang nabespreken.",
  sections: [
    { layout: "steps", title: "Zo werkt het", items: [
      ["Aanvraag", "Vertel ons wat je zoekt: groepsgrootte, budget, datum. Binnen één werkdag krijg je een voorstel op maat."],
      ["Kiezen", "We stellen twee of drie workshops voor die bij jullie passen. Jullie kiezen, wij boeken."],
      ["Beleven", "De workshopgever ontvangt jullie op locatie of komt op kantoor. Wij handelen de facturatie af."],
    ]},
    { layout: "ticks", title: "Waarom Wicked voor je team", items: [
      "Voorstel binnen 1 werkdag",
      "Factuur met btw, geen gedoe met declaraties",
      "Van 5 tot 500 personen",
      "Op locatie of bij jullie op kantoor",
      "Eén contactpunt van aanvraag tot aftercare",
    ]},
    { layout: "quote", title: "Wat bedrijven zeggen", items: [
      ["Mark Janssen", "HR, Acme B.V.", "Met 40 collega's kookworkshop gedaan. Alles tot in de puntjes geregeld, wij hoefden niets te doen."],
      ["Lotte de Boer", "Office Manager, Nimbus", "Eén mailtje en het stond. De factuur was netjes, de workshop een succes. Volgend jaar weer."],
      ["Sven Bakker", "Team Lead, Pixel", "Escape room was uit, dit was een veel beter alternatief. Iedereen was enthousiast."],
    ]},
    { layout: "cta", title: "Klaar voor een teamuitje dat wél blijft hangen?", body: "Vraag een voorstel aan en hoor binnen één werkdag van ons.", cta_label: "Vraag een teamuitje aan", cta_to: { name: "home" } },
  ],
  seo_title: "Workshops voor bedrijven en teamuitjes | Wicked Workshops",
  seo_description: "Van 5 tot 500 personen. Eén contactpunt, één factuur met btw. Voorstel binnen 1 werkdag.",
};

export const GIFTCARD_PAGE = {
  slug: "cadeaubon",
  title: "Cadeaubon",
  hero_title: "Geef een beleving cadeau",
  hero_subtitle: "De ontvanger kiest zelf de workshop en de datum. Een cadeau dat echt blijft hangen.",
  hero_image: null,
  intro: "Geen cadeaubonnetje dat in de la verdwijnt. Met de Wicked cadeaubon kiest de ontvanger zelf uit honderden workshops in heel Nederland.",
  sections: [
    { layout: "steps", title: "Zo werkt het", items: [
      ["Kies een bedrag", "Vanaf € 25 tot elk bedrag dat je wilt. Je koopt de bon online, betalen kan met iDEAL of creditcard."],
      ["Persoonlijk maken", "Schrijf een kaartje en kies of je de bon digitaal of per post stuurt. Direct te verzenden of op een datum naar keuze."],
      ["Ze kiezen zelf", "De ontvanger bladert door workshops, kiest een datum en boekt. Lukt een datum niet? Dan verzetten kosteloos."],
    ]},
    { layout: "ticks", title: "Waarom de Wicked cadeaubon", items: [
      "Geldig voor alle workshops op Wicked",
      "Eén jaar geldig, kosteloos verzetten",
      "Digitaal of per post, met persoonlijk kaartje",
      "Geen restbedrag, opwaarderen kan wel",
    ]},
    { layout: "quote", title: "Wat ontvangers zeggen", items: [
      ["Sanne de Vries", "Keramiek workshop, Utrecht", "Kreeg hem voor mijn verjaardag. Eindelijk eens iets wat ik echt wilde doen."],
      ["Iris Bakker", "Cocktailworkshop, Rotterdam", "Het kaartje was persoonlijk en de workshop was een avond om niet te vergeten."],
      ["Thomas Visser", "Bloemschikken, Den Haag", "Kon zelf kiezen wanneer. Heerlijk om geen datum opgedrongen te krijgen."],
    ]},
    { layout: "cta", title: "Klaar om een beleving te geven?", body: "Bestel de Wicked cadeaubon in een paar minuten.", cta_label: "Cadeaubon bestellen", cta_to: { name: "home" } },
  ],
  seo_title: "Wicked cadeaubon — geef een workshop cadeau | Wicked Workshops",
  seo_description: "De ontvanger kiest zelf de workshop en de datum. Eén jaar geldig, kosteloos verzetten.",
};

/* ===========================================================================
   SEO-landingspagina's.

   Aparte collectie in Directus (`seo_pages`) voor zoekmachine-gerichte
   pagina's zoals "keramiek-amsterdam" of "koken-utrecht". De structuur
   sluit aan bij mapSeoPage() in lib/directus.js en hergebruikt de
   sectie-blokken uit StaticPage (steps, ticks, quote, cta, text).

   Zonder Directus tonen we een voorbeeldpagina zodat de route werkt.
   =========================================================================== */
export const SEO_PAGES = [
  {
    slug: "keramiek-amsterdam",
    title: "Keramiek workshops in Amsterdam",
    hero_title: "Keramiek workshops in Amsterdam",
    hero_subtitle: "Draai je eigen kom, leer pottenbakken of maak een sculptuur. Van beginners tot gevorderden.",
    hero_image: null,
    intro: "Amsterdam barst van creatieve studio's waar je aan de schijf kunt draaien of met klei kunt werken. Hier vind je de leukste keramiekworkshops in de stad.",
    sections: [
      { layout: "steps", title: "Zo werkt het", items: [
        ["Kies een workshop", "Filter op datum, locatie en prijs. Van een proefles van twee uur tot een meerdaagse cursus."],
        ["Boek direct", "Reserveer online, bevestigd in een minuut. Betalen met iDEAL of creditcard."],
        ["Maak iets moois", "Kom langs in de studio, krijg uitleg en ga naar huis met je eigen werk."],
      ]},
      { layout: "ticks", title: "Waarom keramiek in Amsterdam", items: [
        "Studio's in heel de stad, van Centrum tot Noord",
        "Van proefles tot meerdaagse cursus",
        "Materiaal en afbraander altijd inbegrepen",
        "Geschikt voor beginners en gevorderden",
      ]},
      { layout: "quote", title: "Wat deelnemers zeggen", items: [
        ["Sanne de Vries", "Keramiek workshop, Amsterdam", "Eindelijk een rechte kom gemaakt. De docent had eindeloos geduld."],
        ["Mark Janssen", "Pottenbakken, Amsterdam Noord", "Heerlijk ontspannen middag. De studio was prachtig en het resultaat mag er zijn."],
        ["Iris Bakker", "Klei sculpturen, Amsterdam West", "Wist niet dat ik zo creatief was. Ga zeker nog een keer terug."],
      ]},
      { layout: "cta", title: "Klaar om met klei aan de slag te gaan?", body: "Bekijk alle keramiekworkshops in Amsterdam en boek direct.", cta_label: "Bekijk keramiekworkshops", cta_to: { name: "listing", category: { slug: "keramiek-en-klei" } } },
    ],
    seo_title: "Keramiek workshops Amsterdam — pottenbakken & klei | Wicked Workshops",
    seo_description: "Draai je eigen kom of leer pottenbakken in Amsterdam. Van beginners tot gevorderden. Direct boekbaar.",
  },
];
