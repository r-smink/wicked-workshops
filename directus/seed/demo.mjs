/* Demo-data: de voorbeeldpersonen uit de prototypes (Sanne, Luca, Lotte,
   Mirjam, Noor) met hun workshops, datums, aanmeldingen en reviews.
   Alleen lokaal (seed.mjs weigert elders). Opnieuw draaien ruimt de vorige
   demo-data eerst op; alles hangt aan e-mailadressen op @voorbeeld.nl.

   De prototypes gaan uit van "vandaag" = maandag 9 november 2026. De datums
   hieronder zijn letterlijk overgenomen. Wat het ontwerp niet noemt (tijden,
   prijzen en namen bij Noor, Studio Stoom en de sushi-workshop, de namen
   achter "6 van 8") is aangevuld en staat als zodanig gemarkeerd. */
import { randomBytes } from "node:crypto";
import { api, query } from "../scripts/api.mjs";

const DOMAIN = "voorbeeld.nl";
const PASSWORD = "demo-wachtwoord";

/* "2026-11-14 15:00" in Amsterdamse tijd naar UTC (ISO). */
export function ams(local) {
  const [d, t = "00:00"] = local.split(" ");
  const guess = new Date(`${d}T${t}:00Z`);
  const shown = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(guess);
  const [h, m] = shown.split(":").map(Number);
  /* Verschil tussen Amsterdamse kloktijd en UTC, in minuten (60 of 120). */
  let offset = h * 60 + m - (guess.getUTCHours() * 60 + guess.getUTCMinutes());
  if (offset > 720) offset -= 1440;
  if (offset < -720) offset += 1440;
  return new Date(guess.getTime() - offset * 60_000).toISOString();
}

const token = () => randomBytes(32).toString("base64url");
const one = async (collection, filter, fields = "id") => (await api("GET", `/items/${collection}${query({ filter, fields, limit: 1 })}`))[0];
const create = (collection, body) => api("POST", `/items/${collection}`, body);
const ids = (rows) => rows.map((r) => r.id);

async function cleanup() {
  const users = await api("GET", `/users${query({ filter: { email: { _ends_with: `@${DOMAIN}` } }, fields: "id", limit: -1 })}`);
  const userIds = ids(users);
  const providers = userIds.length ? await api("GET", `/items/providers${query({ filter: { user: { _in: userIds } }, fields: "id", limit: -1 })}`) : [];
  const providerIds = ids(providers);
  const workshops = providerIds.length ? await api("GET", `/items/workshops${query({ filter: { provider: { _in: providerIds } }, fields: "id", limit: -1 })}`) : [];
  const workshopIds = ids(workshops);
  const sessions = workshopIds.length ? await api("GET", `/items/workshop_sessions${query({ filter: { workshop: { _in: workshopIds } }, fields: "id", limit: -1 })}`) : [];
  const bookings = sessions.length ? await api("GET", `/items/bookings${query({ filter: { session: { _in: ids(sessions) } }, fields: "id", limit: -1 })}`) : [];
  const del = async (collection, keys) => keys.length && api("DELETE", collection === "users" ? "/users" : `/items/${collection}`, keys);

  if (workshopIds.length) await del("reviews", ids(await api("GET", `/items/reviews${query({ filter: { workshop: { _in: workshopIds } }, fields: "id", limit: -1 })}`)));
  if (userIds.length) {
    await del("favorites", ids(await api("GET", `/items/favorites${query({ filter: { user: { _in: userIds } }, fields: "id", limit: -1 })}`)));
    await del("follows", ids(await api("GET", `/items/follows${query({ filter: { user: { _in: userIds } }, fields: "id", limit: -1 })}`)));
    await del("venue_listings", ids(await api("GET", `/items/venue_listings${query({ filter: { owner: { _in: userIds } }, fields: "id", limit: -1 })}`)));
  }
  await del("bookings", ids(bookings));
  await del("workshop_sessions", ids(sessions));
  await del("workshops", workshopIds);
  await del("providers", providerIds);
  await del("users", userIds);
}

export async function seedDemo() {
  await cleanup();

  const [role] = await api("GET", `/roles${query({ filter: { name: { _eq: "Member" } }, fields: "id" })}`);
  if (!role) throw new Error("Rol Member ontbreekt; draai eerst de gewone seed.");
  const memberRole = role.id;

  const cat = async (slug) => (await one("categories", { slug: { _eq: slug } })).id;
  const place = async (slug) => (await one("cities", { slug: { _eq: slug } })).id;
  const occasion = async (slug) => (await one("occasions", { slug: { _eq: slug } })).id;
  const utrecht = await place("utrecht");
  const hattem = await place("hattem");
  const koken = await cat("koken-en-bakken");

  /* ---------- gebruikers ---------- */
  const user = (key, first_name, extra = {}) =>
    api("POST", "/users", {
      email: `${key}@${DOMAIN}`, password: PASSWORD, first_name, role: memberRole, status: "active",
      email_verified_at: ams("2026-11-01 12:00"), ...extra,
    });
  const sanne = await user("sanne", "Sanne", { last_context: "participant", notify_saved_almost_full: false, notify_tips: false });
  const luca = await user("luca", "Luca", { last_context: "provider" });
  const lotte = await user("lotte", "Lotte", { last_context: "provider", email_verified_at: ams("2026-11-09 20:30") });
  const mirjam = await user("mirjam", "Mirjam", { last_context: "venue", email_verified_at: ams("2026-11-09 19:00") });
  const noor = await user("noor", "Noor", { last_context: "provider" });
  /* Aangevuld: het ontwerp noemt alleen "Studio Stoom" en een sushi-workshop zonder maker. */
  const stoom = await user("studio-stoom", "Studio Stoom", { last_context: "provider" });
  const sushi = await user("sushi-lombok", "Kenji", { last_context: "provider" });

  /* ---------- workshopgevers ---------- */
  const provider = (u, body) => create("providers", { user: u.id, status: "published", city: utrecht, ...body });
  const pLuca = await provider(luca, {
    first_name: "Luca", display_name: "Luca", slug: "luca", area_label: "Wittevrouwen, Utrecht", neighbourhood: "Wittevrouwen",
    kind: "private", has_location: "own", onboarded_at: ams("2026-11-03 10:00"), rating_avg: 4.9, rating_count: 389,
    bio_long: "Luca groeide op in Bologna en maakt al zijn hele leven pasta met de hand. Sinds 2024 kookt hij ook voor mensen die hij nog niet kent, in de keuken van zijn benedenwoning.",
  });
  const pNoor = await provider(noor, { first_name: "Noor", display_name: "Noor", slug: "noor", area_label: "Oudwijk, Utrecht", neighbourhood: "Oudwijk", kind: "private", onboarded_at: ams("2026-09-01 10:00") });
  const pStoom = await provider(stoom, { display_name: "Studio Stoom", slug: "studio-stoom", area_label: "Utrecht", kind: "business", onboarded_at: ams("2026-08-01 10:00") });
  const pSushi = await provider(sushi, { first_name: "Kenji", display_name: "Kenji", slug: "kenji", area_label: "Lombok, Utrecht", neighbourhood: "Lombok", kind: "business", rating_avg: 4.8, rating_count: 143 });
  /* Lotte is nieuw: profiel nog concept tot haar eerste workshop live staat. */
  const pLotte = await provider(lotte, { status: "draft", first_name: "Lotte", display_name: "Lotte", slug: "lotte", area_label: "Hattem", city: hattem, kind: "private", has_location: "own", onboarded_at: ams("2026-11-09 20:41") });

  const declaration = (p, first_name, signed) => create("provider_declarations", {
    provider: p.id, first_name, last_name: "Voorbeeld", kind: "private", email: `${first_name.toLowerCase()}@${DOMAIN}`,
    declared_adult: true, declared_info_correct: true, declared_risks: true, declared_qualifications: true,
    declared_safe: true, declared_reachable: true, declared_incidents: true, accepted_terms_version: "2026-11", signed_at: signed,
  });
  await declaration(pLuca, "Luca", ams("2026-11-03 10:00"));
  await declaration(pLotte, "Lotte", ams("2026-11-09 21:24"));

  /* ---------- workshops ---------- */
  const workshop = async (p, body, address) => {
    const w = await create("workshops", { provider: p.id, status: "published", category: koken, city: utrecht, duration_minutes: 180, format: "on_location", cancellation_policy: "basis", level: "beginner", ...body });
    if (address) await create("workshop_private", { workshop: w.id, ...address });
    return w;
  };
  const lucaAddress = { address: "Voorbeeldstraat 12", postal_code: "3581 AA" };
  const pasta = await workshop(pLuca, { title: "Italiaans koken met Luca: verse pasta", slug: "italiaans-koken-met-luca-verse-pasta", neighbourhood: "Wittevrouwen", price_per_person: 45, rating_avg: 4.9, rating_count: 312, published_at: ams("2026-09-01 10:00") }, lucaAddress);
  const ravioli = await workshop(pLuca, { title: "Ravioli vullen en vouwen", slug: "ravioli-vullen-en-vouwen", neighbourhood: "Wittevrouwen", price_per_person: 42, rating_avg: 4.9, rating_count: 51, published_at: ams("2026-09-01 10:00") }, lucaAddress);
  const wijn = await workshop(pLuca, { title: "Koken met wijn: ossobuco en risotto", slug: "koken-met-wijn-ossobuco-en-risotto", neighbourhood: "Wittevrouwen", price_per_person: 49, rating_avg: 4.8, rating_count: 26, published_at: ams("2026-09-01 10:00") }, lucaAddress);
  await workshop(pLuca, { status: "pending_review", title: "Focaccia en grissini bakken", slug: "focaccia-en-grissini-bakken", submitted_at: ams("2026-11-06 16:00") }, lucaAddress);
  await workshop(pLuca, { status: "draft", title: "Tortellini vouwen", slug: "tortellini-vouwen" });
  /* Aangevuld: prijs en duur van Noor en Studio Stoom staan niet in het ontwerp. */
  const handvormen = await workshop(pNoor, { title: "Handvormen voor beginners", slug: "handvormen-voor-beginners", category: await cat("keramiek-en-klei"), neighbourhood: "Oudwijk", duration_minutes: 150, price_per_person: 45 }, { address: "Voorbeeldlaan 3", postal_code: "3581 BB" });
  const dumplings = await workshop(pStoom, { title: "Dumplings vouwen en stomen", slug: "dumplings-vouwen-en-stomen", location_name: "Studio Stoom", price_per_person: 49 }, { address: "Voorbeeldkade 5", postal_code: "3511 CC" });
  const sushiWs = await workshop(pSushi, { title: "Sushi rollen voor beginners", slug: "sushi-rollen-voor-beginners", neighbourhood: "Lombok", price_per_person: 52, rating_avg: 4.8, rating_count: 143 }, { address: "Voorbeeldplein 7", postal_code: "3531 DD" });
  const kaarsen = await workshop(pLotte, {
    status: "pending_review", submitted_at: ams("2026-11-09 21:24"), title: "Kaarsen gieten van sojawas in Hattem", slug: "kaarsen-gieten-van-sojawas-in-hattem",
    category: await cat("ambacht-en-maken"), city: hattem, duration_minutes: 150, price_per_person: 39,
    subtitle: "Giet twee eigen kaarsen van sojawas, kies je geur en neem ze mee naar huis.",
    description: "Je begint met een kop koffie of thee en een korte uitleg over sojawas. Daarna smelt je de was, kies je een geur en giet je twee kaarsen in glazen potten.\n\nTerwijl de kaarsen opstijven, vertel ik hoe je thuis verder kunt. Je gaat naar huis met twee kaarsen en alles wat je weet om de volgende zelf te maken.",
    accessibility: "Begane grond, één drempel bij de voordeur",
  }, { address: "Voorbeeldstraat 8", postal_code: "8051 AA" });
  for (const [i, text] of ["Sojawas, lont en geurolie", "Twee glazen potten om mee naar huis te nemen", "Koffie en thee"].entries()) {
    await create("workshop_inclusions", { workshop: kaarsen.id, text, sort: i + 1 });
  }
  await create("workshop_faq", { workshop: kaarsen.id, question: "Moet ik iets meenemen?", answer: "Nee, alles ligt klaar. Draag kleren die tegen een vlekje kunnen.", sort: 1 });
  for (const slug of ["date", "vrienden", "vrijgezellenfeest"]) await create("workshops_occasions", { workshop_id: kaarsen.id, occasion_id: await occasion(slug) });

  /* ---------- datums en aanmeldingen ---------- */
  let code = 0;
  const booking = (session, first_name, last_initial, participants, registered, extra = {}) =>
    create("bookings", {
      session: session.id, workshop: session.workshop, provider: session.provider, status: "confirmed",
      booking_code: `DEMO-${String(++code).padStart(3, "0")}`, access_token: token(),
      first_name, last_initial, guest_name: `${first_name} ${last_initial}.`,
      guest_email: `${first_name.toLowerCase()}.${last_initial.toLowerCase()}@${DOMAIN}`,
      participants, dietary_notes: extra.dietary ?? null, customer: extra.customer ?? null,
    }).then(async (b) => {
      /* "Aangemeld" in het dashboard is date_created. */
      if (registered) await api("PATCH", `/items/bookings/${b.id}`, { date_created: ams(registered) });
      return b;
    });

  async function session(w, p, start, { hours = 3, capacity = 8, min = null, decision = null, confirmedAt, bookings = [] }) {
    const starts_at = ams(start);
    const ends_at = new Date(Date.parse(starts_at) + hours * 3600_000).toISOString();
    const persons = bookings.reduce((n, b) => n + b[2], 0);
    const reached = min == null || persons >= min;
    const s = await create("workshop_sessions", {
      workshop: w.id, starts_at, ends_at, capacity, min_participants: min, decision_at: decision ? ams(decision) : null,
      state: reached ? "confirmed" : "open", confirmed_at: reached ? (confirmedAt ? ams(confirmedAt) : ams("2026-10-01 10:00")) : null,
      seats_taken: persons, status: persons >= capacity ? "full" : "open", goes_ahead: reached,
    });
    const ctx = { ...s, workshop: w.id, provider: p.id };
    const made = [];
    for (const b of bookings) made.push(await booking(ctx, ...b));
    return { ...ctx, bookings: made };
  }

  /* Luca, adash-a scherm 2 (11 komende datums over 3 workshops). */
  await session(pasta, pLuca, "2026-11-14 15:00", { min: 4, decision: "2026-11-13 22:00", confirmedAt: "2026-11-05 18:00", bookings: [
    ["Femke", "D", 2, "2026-11-02 10:00"],
    ["Yusuf", "A", 1, "2026-11-04 10:00", { dietary: "Notenallergie" }],
    ["Iris", "L", 2, "2026-11-05 18:00", { dietary: "Lactosevrij" }],
  ] });
  const sanneDate = await session(pasta, pLuca, "2026-11-21 15:00", { min: 4, decision: "2026-11-20 22:00", bookings: [
    ["Sanne", "B", 1, "2026-11-09 14:05", { customer: sanne.id }],
  ] });
  /* Aangevuld: wie er achter "8 van 8" en "6 van 8" zit, staat niet in het ontwerp. */
  await session(pasta, pLuca, "2026-11-28 15:00", { bookings: [["Daan", "K", 2], ["Eva", "M", 2], ["Bas", "T", 2], ["Lieke", "V", 2]] });
  await session(pasta, pLuca, "2026-12-05 15:00", { bookings: [["Tom", "R", 2]] });
  await session(pasta, pLuca, "2026-12-12 15:00", { min: 4, decision: "2026-12-11 22:00", bookings: [["Merel", "S", 2], ["Joost", "H", 1]] });
  await session(pasta, pLuca, "2026-12-19 15:00", { min: 4, decision: "2026-12-18 22:00" });
  await session(ravioli, pLuca, "2026-11-25 18:30", { bookings: [["Sven", "J", 2], ["Noa", "P", 2], ["Ruben", "W", 2]] });
  await session(ravioli, pLuca, "2026-12-09 18:30", { min: 4, decision: "2026-12-08 22:00", bookings: [["Fleur", "G", 2]] });
  await session(ravioli, pLuca, "2026-12-16 18:30", {});
  await session(wijn, pLuca, "2026-12-04 18:30", { min: 4, decision: "2026-12-03 22:00", bookings: [["Anna", "B", 2]] });
  await session(wijn, pLuca, "2026-12-18 18:30", {});

  /* Voorbij, met de reviews uit adash-a scherm 5. */
  const reviewed = [
    [pasta, "2026-10-17 15:00", "Marloes", 5, "Luca vertelt over zijn oma terwijl je kneedt. Je vergeet dat je bij iemand thuis bent."],
    [ravioli, "2026-10-14 18:30", "Joris", 5, "Mijn ravioli zagen er niet uit, maar ze waren heerlijk. Hij lachte mee."],
    [wijn, "2026-10-09 18:30", "Anouk", 4, "Ossobuco die drie uur moet stoven, dus veel tijd om te praten. Een uur korter had ook gekund."],
  ];
  for (const [w, start, name, rating, body] of reviewed) {
    const s = await session(w, pLuca, start, { bookings: [[name, "X", 2]] });
    await create("reviews", {
      booking: s.bookings[0].id, workshop: w.id, provider: pLuca.id, author_display_name: name, rating_overall: rating, body,
      status: "published", published_at: new Date(Date.parse(s.starts_at) + 86_400_000).toISOString(),
    });
  }

  /* Sanne: morgen dumplings, eerder handvormen bij Noor (review nog te schrijven). */
  await session(dumplings, pStoom, "2026-11-10 19:00", { hours: 2.5, bookings: [["Sanne", "B", 2, "2026-10-20 12:00", { customer: sanne.id }]] });
  await session(handvormen, pNoor, "2026-10-31 14:00", { hours: 2.5, capacity: 6, bookings: [["Sanne", "B", 1, "2026-10-12 12:00", { customer: sanne.id }]] });
  await session(sushiWs, pSushi, "2026-11-13 19:00", { capacity: 10, bookings: [["Lars", "D", 3], ["Mila", "F", 2]] });
  /* Luca's wijn-datum vr 4 dec (2 van 4) en de nieuwe ravioli-datum wo 25 nov
     zijn wat Sanne ziet onder Bewaard en Volgen. */

  /* Lotte, wizard-a stap 5. */
  await session(kaarsen, pLotte, "2026-11-28 14:00", { hours: 2.5, capacity: 6, min: 3, decision: "2026-11-26 12:00" });
  await session(kaarsen, pLotte, "2026-12-12 14:00", { hours: 2.5, capacity: 6, min: 3, decision: "2026-12-10 12:00" });
  await session(kaarsen, pLotte, "2026-12-20 14:00", { hours: 2.5, capacity: 6 });

  /* Sanne: bewaard en volgen (ddash-b scherm 5). */
  await create("favorites", { user: sanne.id, workshop: sushiWs.id });
  await create("favorites", { user: sanne.id, workshop: wijn.id });
  await create("follows", { user: sanne.id, provider: pLuca.id });
  await create("follows", { user: sanne.id, provider: pNoor.id });

  /* Mirjam, lflow-a. */
  await create("venue_listings", {
    owner: mirjam.id, status: "published", visible: true, name: "Lichte keuken met groot eiland", place: utrecht, neighbourhood: "Lombok",
    kind: "kitchen", capacity: 10, amenities: ["Groot eiland", "Twee ovens", "Water"],
    availability: { mon: ["afternoon", "evening"], tue: ["afternoon", "evening"], thu: ["evening"] },
    description: "Woonkeuken op de begane grond met een eiland van vier meter. Twee ovens naast elkaar en daglicht van twee kanten. Aan het eiland is plek voor tien mensen.",
  });

  return {
    wachtwoord: PASSWORD,
    gebruikers: ["sanne", "luca", "lotte", "mirjam", "noor", "studio-stoom", "sushi-lombok"].map((k) => `${k}@${DOMAIN}`),
    sanneAanmelding: sanneDate.bookings[0].id,
  };
}
