/* Rechtenmatrix uit docs/03 als test, tegen een draaiende lokale Directus
   met schema en seed (npm run dev, npm run migrate, npm run seed).

   De test maakt eigen gebruikers en data met een unieke achtervoegsel en
   ruimt ze daarna op. Elke gebruiker krijgt een statisch token, zodat we
   precies als die gebruiker vragen stellen. */
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BASE, api, query } from "../scripts/api.mjs";

const run = randomBytes(4).toString("hex");
const ids = {};
const tokens = {};

/* Vraag als een bepaalde gebruiker (of uitgelogd als token null). */
async function as(who, method, path, body) {
  const token = who === "public" ? null : tokens[who];
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, data: json?.data, errors: json?.errors };
}
const read = async (who, collection, params = {}) => as(who, "GET", `/items/${collection}${query({ limit: -1, ...params })}`);
const idsOf = (rows) => (rows ?? []).map((r) => r.id);

async function role(name) {
  const [r] = await api("GET", `/roles${query({ filter: { name: { _eq: name } } })}`);
  if (!r) throw new Error(`Rol ${name} ontbreekt. Draai eerst npm run seed.`);
  return r.id;
}

beforeAll(async () => {
  const ping = await fetch(`${BASE}/server/ping`).catch(() => null);
  if (!ping?.ok) throw new Error(`Directus draait niet op ${BASE}. Start hem met npm run dev.`);

  const member = await role("Member");
  const team = await role("Team");
  for (const [key, r] of [["sanne", member], ["luca", member], ["bram", member], ["teamlid", team]]) {
    tokens[key] = `test-${key}-${run}-${randomBytes(12).toString("hex")}`;
    const user = await api("POST", "/users", { email: `${key}-${run}@test.wickedworkshops.nl`, first_name: key, role: r, token: tokens[key], status: "active" });
    ids[key] = user.id;
  }

  const luca = await api("POST", "/items/providers", { user: ids.luca, display_name: `Luca ${run}`, first_name: "Luca", slug: `luca-${run}`, status: "published", kvk_number: "12345678", address: "Geheimstraat 1" });
  const bram = await api("POST", "/items/providers", { user: ids.bram, display_name: `Bram ${run}`, first_name: "Bram", slug: `bram-${run}`, status: "published" });
  ids.lucaProvider = luca.id;
  ids.bramProvider = bram.id;

  ids.lucaDecl = (await api("POST", "/items/provider_declarations", { provider: luca.id, kind: "private", first_name: "Luca", last_name: "Rossi", birth_date: "1990-01-01", home_address: "Thuisweg 2", phone: "0612345678" })).id;
  ids.bramDecl = (await api("POST", "/items/provider_declarations", { provider: bram.id, kind: "private", last_name: "Bakker" })).id;

  const ws = (provider, status, title) => api("POST", "/items/workshops", { provider, status, title, slug: `${title.toLowerCase().replace(/\s+/g, "-")}-${run}`, duration_minutes: 180, address: "Geheimstraat 1", postal_code: "3500 AA", lat: 52.1, lng: 5.1, review_note: "intern" });
  ids.lucaLive = (await ws(luca.id, "published", "Pasta live")).id;
  ids.lucaDraft = (await ws(luca.id, "draft", "Pasta concept")).id;
  ids.bramLive = (await ws(bram.id, "published", "Brood live")).id;

  ids.lucaPrivate = (await api("POST", "/items/workshop_private", { workshop: ids.lucaLive, address: "Geheimstraat 1" })).id;

  const day = 24 * 3600_000;
  const at = (d) => new Date(Date.now() + d * day).toISOString();
  const session = (workshop, extra) => api("POST", "/items/workshop_sessions", { workshop, starts_at: at(20), capacity: 8, ...extra });
  ids.lucaOpen = (await session(ids.lucaLive, { min_participants: 4, decision_at: at(19) })).id;
  ids.lucaLocked = (await session(ids.lucaLive, { min_participants: 2, decision_at: at(19) })).id;
  await api("PATCH", `/items/workshop_sessions/${ids.lucaLocked}`, { state: "confirmed", confirmed_at: new Date().toISOString() });
  ids.lucaCancel = (await session(ids.lucaLive, { starts_at: at(30) })).id;
  ids.lucaDraftSession = (await session(ids.lucaDraft, {})).id;
  ids.bramSession = (await session(ids.bramLive, {})).id;

  const booking = (session, extra) => api("POST", "/items/bookings", { session, booking_code: `T${run}${randomBytes(3).toString("hex")}`, status: "confirmed", participants: 2, first_name: "Sanne", last_initial: "B", guest_name: "Sanne de Boer", guest_email: `sanne-${run}@test.wickedworkshops.nl`, dietary_notes: "Notenallergie", ...extra });
  ids.sanneAtLuca = (await booking(ids.lucaOpen, { customer: ids.sanne })).id;
  ids.guestAtLuca = (await booking(ids.lucaOpen, { first_name: "Femke", last_initial: "D", guest_name: "Femke Dekker", guest_email: `femke-${run}@test.wickedworkshops.nl` })).id;
  ids.sanneAtBram = (await booking(ids.bramSession, { customer: ids.sanne })).id;

  ids.reviewPublished = (await api("POST", "/items/reviews", { workshop: ids.lucaLive, provider: luca.id, booking: ids.sanneAtLuca, user: ids.sanne, author_display_name: "Sanne", rating_overall: 5, body: "Top", status: "published" })).id;
  ids.reviewPending = (await api("POST", "/items/reviews", { workshop: ids.lucaLive, provider: luca.id, booking: ids.guestAtLuca, rating_overall: 2, body: "Nog nakijken", status: "pending" })).id;

  ids.venueHidden = (await api("POST", "/items/venue_listings", { owner: ids.bram, name: `Keuken ${run}`, status: "published", visible: false })).id;
  ids.venueVisible = (await api("POST", "/items/venue_listings", { owner: ids.bram, name: `Atelier ${run}`, status: "published", visible: true })).id;
  ids.venueDraft = (await api("POST", "/items/venue_listings", { owner: ids.bram, name: `Zaal ${run}`, status: "draft", visible: true })).id;
}, 60_000);

afterAll(async () => {
  const del = async (collection, keys) => {
    const list = keys.filter(Boolean);
    if (list.length) await api("DELETE", collection === "users" ? "/users" : `/items/${collection}`, list).catch((e) => console.warn(e.message));
  };
  await del("favorites", ids.favorites ?? []);
  await del("reviews", [ids.reviewPublished, ids.reviewPending]);
  await del("bookings", [ids.sanneAtLuca, ids.guestAtLuca, ids.sanneAtBram]);
  await del("workshop_sessions", [ids.lucaOpen, ids.lucaLocked, ids.lucaCancel, ids.lucaDraftSession, ids.bramSession, ...(ids.extraSessions ?? [])]);
  await del("workshops", [ids.lucaLive, ids.lucaDraft, ids.bramLive]);
  await del("venue_listings", [ids.venueHidden, ids.venueVisible, ids.venueDraft]);
  await del("providers", [ids.lucaProvider, ids.bramProvider]);
  await del("users", [ids.sanne, ids.luca, ids.bram, ids.teamlid]);
}, 60_000);

/* ---------------------------------------------------------------------- */

describe("uitgelogd", () => {
  it("leest referentiedata", async () => {
    for (const c of ["categories", "occasions", "cities", "cancellation_policies"]) {
      const res = await read("public", c, { limit: 1 });
      expect(res.status, c).toBe(200);
      expect(res.data.length, c).toBe(1);
    }
  });

  it("houdt wat de bestaande site al mocht lezen", async () => {
    for (const c of ["pages", "articles", "location_pages", "redirects"]) {
      expect((await read("public", c, { limit: 1 })).status, c).toBe(200);
    }
    expect((await as("public", "GET", "/files?limit=1")).status).toBe(200);
  });

  it("ziet alleen live workshops, zonder adres of interne velden", async () => {
    const res = await read("public", "workshops", { filter: { id: { _in: [ids.lucaLive, ids.lucaDraft] } }, fields: "*" });
    expect(res.status).toBe(200);
    expect(idsOf(res.data)).toEqual([ids.lucaLive]);
    for (const f of ["address", "postal_code", "lat", "lng", "review_note", "submitted_at", "user_created"]) expect(res.data[0]).not.toHaveProperty(f);
    expect((await read("public", "workshops", { fields: "address" })).status).toBe(403);
  });

  it("ziet geen adres, geen verklaring, geen aanmeldingen", async () => {
    for (const c of ["workshop_private", "provider_declarations", "bookings", "session_offers", "favorites", "follows", "venue_contact_requests"]) {
      expect((await read("public", c)).status, c).toBe(403);
    }
  });

  it("ziet datums alleen bij live workshops", async () => {
    const res = await read("public", "workshop_sessions", { filter: { workshop: { _in: [ids.lucaLive, ids.lucaDraft] } } });
    expect(res.status).toBe(200);
    expect(idsOf(res.data)).toContain(ids.lucaOpen);
    expect(idsOf(res.data)).not.toContain(ids.lucaDraftSession);
  });

  it("ziet van een workshopgever alleen publieke velden", async () => {
    const res = await read("public", "providers", { filter: { id: { _eq: ids.lucaProvider } }, fields: "*" });
    expect(res.data).toHaveLength(1);
    for (const f of ["user", "kvk_number", "address", "postal_code", "has_location"]) expect(res.data[0]).not.toHaveProperty(f);
  });

  it("ziet alleen gepubliceerde reviews, zonder koppeling naar de deelnemer", async () => {
    const res = await read("public", "reviews", { filter: { workshop: { _eq: ids.lucaLive } }, fields: "*" });
    expect(idsOf(res.data)).toEqual([ids.reviewPublished]);
    for (const f of ["user", "booking", "provider_reply"]) expect(res.data[0]).not.toHaveProperty(f);
  });

  it("ziet alleen zichtbare, gepubliceerde ruimtes, zonder eigenaar", async () => {
    const res = await read("public", "venue_listings", { filter: { owner: { _eq: ids.bram } }, fields: "*" });
    expect(res.status).toBe(403); /* filteren op eigenaar mag niet */
    const all = await read("public", "venue_listings", { filter: { id: { _in: [ids.venueHidden, ids.venueVisible, ids.venueDraft] } }, fields: "*" });
    expect(idsOf(all.data)).toEqual([ids.venueVisible]);
    expect(all.data[0]).not.toHaveProperty("owner");
  });
});

describe("deelnemer (Sanne)", () => {
  it("ziet haar eigen aanmeldingen, met e-mailadres", async () => {
    const res = await read("sanne", "bookings", { fields: "id,guest_email,first_name" });
    expect(res.status).toBe(200);
    expect(idsOf(res.data).sort()).toEqual([ids.sanneAtLuca, ids.sanneAtBram].sort());
    expect(res.data.every((b) => b.guest_email)).toBe(true);
    expect(res.data.find((b) => b.id === ids.sanneAtLuca)).not.toHaveProperty("access_token");
  });

  it("ziet geen aanmeldingen van anderen", async () => {
    const res = await read("sanne", "bookings", { filter: { id: { _eq: ids.guestAtLuca } } });
    expect(res.data ?? []).toHaveLength(0);
  });

  it("ziet geen adres, geen verklaring en geen concepten van een ander", async () => {
    expect((await read("sanne", "workshop_private")).data ?? []).toHaveLength(0);
    expect((await read("sanne", "provider_declarations")).data ?? []).toHaveLength(0);
    const ws = await read("sanne", "workshops", { filter: { id: { _in: [ids.lucaLive, ids.lucaDraft] } } });
    expect(idsOf(ws.data)).toEqual([ids.lucaLive]);
  });

  it("kan andermans workshop niet wijzigen", async () => {
    const res = await as("sanne", "PATCH", `/items/workshops/${ids.lucaLive}`, { title: "Gekaapt" });
    expect(res.status).toBe(403);
  });

  it("leest en wijzigt alleen haar eigen account", async () => {
    const me = await as("sanne", "GET", "/users/me?fields=id,email,notify_tips");
    expect(me.data.id).toBe(ids.sanne);
    expect((await as("sanne", "PATCH", "/users/me", { notify_tips: true })).status).toBe(200);
    expect((await as("sanne", "PATCH", "/users/me", { role: null })).status).toBe(403);
    const other = await as("sanne", "GET", `/users/${ids.luca}`);
    expect(other.status).toBe(403);
  });

  it("bewaart een workshop voor zichzelf, niet voor een ander, en niet dubbel", async () => {
    const ok = await as("sanne", "POST", "/items/favorites", { workshop: ids.lucaLive });
    expect(ok.status).toBe(200);
    expect(ok.data.user).toBe(ids.sanne);
    ids.favorites = [ok.data.id];
    expect((await as("sanne", "POST", "/items/favorites", { workshop: ids.lucaLive })).status).toBe(400);
    expect((await as("sanne", "POST", "/items/favorites", { workshop: ids.bramLive, user: ids.luca })).status).toBe(400);
    expect((await read("luca", "favorites")).data ?? []).toHaveLength(0);
  });

  it("schrijft geen review rechtstreeks (alleen via de server)", async () => {
    const res = await as("sanne", "POST", "/items/reviews", { workshop: ids.lucaLive, rating_overall: 5, status: "published" });
    expect(res.status).toBe(403);
  });
});

describe("workshopgever (Luca)", () => {
  it("ziet bij aanmeldingen op eigen datums alleen voornaam, initiaal, personen, dieetwens", async () => {
    const res = await read("luca", "bookings", { filter: { session: { _eq: ids.lucaOpen } }, fields: "*" });
    expect(res.status).toBe(200);
    expect(idsOf(res.data).sort()).toEqual([ids.sanneAtLuca, ids.guestAtLuca].sort());
    for (const b of res.data) {
      expect(b.first_name).toBeTruthy();
      expect(b.participants).toBe(2);
      expect(b.dietary_notes).toBe("Notenallergie");
      for (const f of ["guest_email", "guest_name", "guest_phone", "customer", "access_token", "booking_code"]) expect(b[f] ?? null, f).toBeNull();
    }
    const email = await read("luca", "bookings", { filter: { session: { _eq: ids.lucaOpen } }, fields: "guest_email" });
    expect(email.status === 403 || email.data.every((b) => b.guest_email == null)).toBe(true);
  });

  it("ziet geen aanmeldingen bij een andere workshopgever", async () => {
    expect((await read("luca", "bookings", { filter: { id: { _eq: ids.sanneAtBram } } })).data ?? []).toHaveLength(0);
  });

  it("ziet zijn eigen verklaring en adres, niet die van een ander", async () => {
    expect(idsOf((await read("luca", "provider_declarations")).data)).toEqual([ids.lucaDecl]);
    expect(idsOf((await read("luca", "workshop_private")).data)).toEqual([ids.lucaPrivate]);
    expect((await read("bram", "workshop_private")).data ?? []).toHaveLength(0);
  });

  it("wijzigt zijn eigen workshop, maar zet hem niet zelf live", async () => {
    expect((await as("luca", "PATCH", `/items/workshops/${ids.lucaDraft}`, { title: "Pasta, nieuw" })).status).toBe(200);
    expect((await as("luca", "PATCH", `/items/workshops/${ids.lucaDraft}`, { status: "published" })).status).toBe(400);
    const sent = await as("luca", "PATCH", `/items/workshops/${ids.lucaDraft}?fields=status,submitted_at`, { status: "pending_review" });
    expect(sent.status).toBe(200);
    expect(sent.data.submitted_at).toBeTruthy();
    expect((await as("luca", "PATCH", `/items/workshops/${ids.lucaDraft}`, { review_note: "zelf goedgekeurd" })).status).toBe(403);
  });

  it("haalt een live workshop weg en zet hem terug", async () => {
    expect((await as("luca", "PATCH", `/items/workshops/${ids.lucaLive}`, { status: "paused" })).status).toBe(200);
    expect((await as("luca", "PATCH", `/items/workshops/${ids.lucaLive}`, { status: "published" })).status).toBe(200);
  });

  it("maakt geen workshop of adres aan bij een andere workshopgever", async () => {
    expect((await as("luca", "POST", "/items/workshops", { provider: ids.bramProvider, title: "Kaping", slug: `kaping-${run}` })).status).toBe(403);
    expect((await as("luca", "POST", "/items/workshop_private", { workshop: ids.bramLive, address: "x" })).status).toBe(403);
    expect((await as("luca", "PATCH", `/items/workshop_private/${ids.lucaPrivate}`, { workshop: ids.bramLive })).status).toBe(403);
  });

  it("kan een datum die doorgaat niet verschuiven, wel annuleren", async () => {
    const later = new Date(Date.now() + 25 * 24 * 3600_000).toISOString();
    expect((await as("luca", "PATCH", `/items/workshop_sessions/${ids.lucaLocked}`, { starts_at: later })).status).toBe(400);
    expect((await as("luca", "PATCH", `/items/workshop_sessions/${ids.lucaLocked}`, { capacity: 12 })).status).toBe(400);
    expect((await as("luca", "PATCH", `/items/workshop_sessions/${ids.lucaOpen}`, { state: "confirmed" })).status).toBe(400);
    const cancel = await as("luca", "PATCH", `/items/workshop_sessions/${ids.lucaLocked}?fields=state,closed_at`, { state: "cancelled_by_provider" });
    expect(cancel.status).toBe(200);
    expect(cancel.data.closed_at).toBeTruthy();
  });

  it("maakt een datum met de regels uit docs/05", async () => {
    const start = new Date(Date.now() + 40 * 24 * 3600_000);
    const bad = await as("luca", "POST", "/items/workshop_sessions", { workshop: ids.lucaLive, starts_at: start.toISOString(), capacity: 4, min_participants: 6, decision_at: new Date(start.getTime() - 3600_000).toISOString() });
    expect(bad.status).toBe(400);
    const noMin = await as("luca", "POST", "/items/workshop_sessions?fields=id,state,ends_at", { workshop: ids.lucaLive, starts_at: start.toISOString(), capacity: 6 });
    expect(noMin.status).toBe(200);
    ids.extraSessions = [noMin.data.id];
    expect(noMin.data.state).toBe("confirmed");
    expect(Date.parse(noMin.data.ends_at) - start.getTime()).toBe(180 * 60_000);
    expect((await as("luca", "POST", "/items/workshop_sessions", { workshop: ids.bramLive, starts_at: start.toISOString(), capacity: 6 })).status).toBe(403);
  });

  it("verwijdert geen datum met aanmeldingen", async () => {
    expect((await as("luca", "DELETE", `/items/workshop_sessions/${ids.lucaOpen}`)).status).toBe(400);
  });
});

describe("ruimte-eigenaar (Bram)", () => {
  it("ziet en beheert zijn eigen ruimtes, ook verborgen", async () => {
    const res = await read("bram", "venue_listings", { filter: { owner: { _eq: ids.bram } } });
    expect(idsOf(res.data).sort()).toEqual([ids.venueHidden, ids.venueVisible, ids.venueDraft].sort());
    expect((await as("bram", "PATCH", `/items/venue_listings/${ids.venueHidden}`, { visible: true })).status).toBe(200);
    expect((await as("luca", "PATCH", `/items/venue_listings/${ids.venueDraft}`, { name: "x" })).status).toBe(403);
  });

  it("maakt geen ruimte op naam van een ander", async () => {
    expect((await as("luca", "POST", "/items/venue_listings", { owner: ids.bram, name: "x" })).status).toBe(400);
  });
});

describe("team", () => {
  it("ziet verklaringen, adressen en aanmeldingen met e-mailadres", async () => {
    expect(idsOf((await read("teamlid", "provider_declarations", { filter: { id: { _in: [ids.lucaDecl, ids.bramDecl] } } })).data).length).toBe(2);
    expect(idsOf((await read("teamlid", "workshop_private", { filter: { id: { _eq: ids.lucaPrivate } } })).data)).toEqual([ids.lucaPrivate]);
    const b = await read("teamlid", "bookings", { filter: { id: { _eq: ids.guestAtLuca } }, fields: "guest_email" });
    expect(b.data[0].guest_email).toContain("femke");
  });

  it("zet een workshop live, maar geeft zichzelf geen andere rol", async () => {
    expect((await as("teamlid", "PATCH", `/items/workshops/${ids.lucaDraft}`, { status: "published" })).status).toBe(200);
    expect((await as("teamlid", "PATCH", `/users/${ids.sanne}`, { role: null })).status).toBe(403);
    expect((await as("teamlid", "PATCH", `/users/${ids.teamlid}`, { role: null })).status).toBe(403);
  });

  it("leest bewaarde workshops, maar wijzigt ze niet", async () => {
    expect((await read("teamlid", "favorites")).status).toBe(200);
    expect((await as("teamlid", "POST", "/items/favorites", { user: ids.sanne, workshop: ids.bramLive })).status).toBe(403);
  });
});
