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
  title: "", category: "", occasions: [],
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
};

export const WIZ_REQUIRED = [
  ["title", "Titel"], ["category", "Categorie"], ["intro", "Korte omschrijving"],
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
  { key: "payouts", label: "Uitbetalingen", icon: "euro" },
  { key: "profile", label: "Profiel", icon: "user" },
];

export const DASH_TITLES = {
  overview: ["Hoi Marco", "Hier staat je week in een oogopslag."],
  workshops: ["Workshops", "Beheer je aanbod en publiceer nieuwe workshops."],
  agenda: ["Agenda", "Voeg datums toe zodat mensen kunnen boeken."],
  bookings: ["Boekingen", "Wie komt er wanneer, en wat is er betaald."],
  reviews: ["Reviews", "Reageren houdt je responstijd laag en je profiel sterk."],
  payouts: ["Uitbetalingen", "Wat er binnenkomt en wanneer."],
  profile: ["Profiel", "Je gegevens, je openbare profiel en je uitbetaling."],
  wizard: ["Nieuwe workshop", "Zes stappen en je staat online."],
};

export const MOBILE_CITIES = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag"];
