import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* opp.js leest de sleutels bij het laden. Daarom per test de omgeving
   zetten en de module opnieuw importeren. */
async function loadOpp(env: Record<string, string> = {}) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("./opp");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("oppTransactionBody", () => {
  it("bouwt products en total_price in centen, met commissie en escrow", async () => {
    const { oppTransactionBody } = await loadOpp();
    const body = oppTransactionBody({
      merchantUid: "mer_123",
      productName: "Keramiek voor beginners",
      unitCents: 4500,
      quantity: 2,
      partnerFeeCents: 1350,
      returnUrl: "https://www.wickedworkshops.nl/boeking/terug?code=WW-ABC",
      notifyUrl: "https://www.wickedworkshops.nl/api/webhooks/opp",
      metadata: { booking_code: "WW-ABC" },
      escrowUntil: new Date("2030-11-20T15:00:00Z"),
    });
    expect(body.products).toEqual([{ name: "Keramiek voor beginners", price: 4500, quantity: 2 }]);
    expect(body.total_price).toBe(9000);
    expect(body.partner_fee).toBe(1350);
    expect(body.escrow).toBe(true);
    expect(body.escrow_date).toBe("2030-11-20 16:00:00");
    expect(body).not.toHaveProperty("amount");
  });

  it("laat partner_fee en escrow weg als ze er niet zijn", async () => {
    const { oppTransactionBody } = await loadOpp();
    const body = oppTransactionBody({
      merchantUid: "mer_1", productName: "X", unitCents: 501, quantity: 1, partnerFeeCents: 0,
      returnUrl: "https://a.nl", notifyUrl: "https://a.nl/n", metadata: {}, escrowUntil: null,
    });
    expect(body).not.toHaveProperty("partner_fee");
    expect(body).not.toHaveProperty("escrow");
  });
});

describe("oppEscrowDate", () => {
  it("schrijft Nederlandse tijd, ook in de zomer", async () => {
    const { oppEscrowDate } = await loadOpp();
    const now = Date.parse("2026-01-01T00:00:00Z");
    expect(oppEscrowDate(new Date("2026-07-01T10:00:00Z"), now)).toBe("2026-07-01 12:00:00");
    expect(oppEscrowDate(new Date("2026-12-01T10:00:00Z"), now)).toBe("2026-12-01 11:00:00");
  });

  it("ligt minstens 15 minuten in de toekomst", async () => {
    const { oppEscrowDate } = await loadOpp();
    const now = Date.parse("2026-11-04T10:00:00Z");
    expect(oppEscrowDate(new Date(now - 60_000), now)).toBe("2026-11-04 11:20:00");
  });
});

describe("oppUpdateTransaction", () => {
  it("stuurt alleen escrow_date, minstens 15 minuten vooruit", async () => {
    const { oppEscrowUpdateBody } = await loadOpp();
    const now = Date.parse("2026-11-04T10:00:00Z");
    expect(oppEscrowUpdateBody(new Date("2026-11-30T09:00:00Z"), now)).toEqual({ escrow_date: "2026-11-30 10:00:00" });
    expect(oppEscrowUpdateBody(new Date(now), now)).toEqual({ escrow_date: "2026-11-04 11:20:00" });
  });

  it("post naar /transactions/{uid} met de sleutel van de omgeving", async () => {
    const { oppUpdateTransaction } = await loadOpp({ OPP_SANDBOX_API_KEY: "sk_test" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ uid: "tra_1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await oppUpdateTransaction("sandbox", "tra_1", { escrowDate: new Date("2030-01-01T12:00:00Z") });
    expect(result).toEqual({ uid: "tra_1" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api-sandbox.onlinebetaalplatform.nl/v1/transactions/tra_1");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ escrow_date: "2030-01-01 13:00:00" });
    expect(init.headers.Authorization).toBe("Bearer sk_test");
    vi.unstubAllGlobals();
  });
});

describe("oppPaymentStatus", () => {
  it("telt completed en reserved (escrow) als betaald", async () => {
    const { oppPaymentStatus } = await loadOpp();
    expect(oppPaymentStatus("completed")).toBe("paid");
    expect(oppPaymentStatus("reserved")).toBe("paid");
    expect(oppPaymentStatus("created")).toBe("open");
    expect(oppPaymentStatus("cancelled")).toBe("canceled");
    expect(oppPaymentStatus("chargeback")).toBe("refunded");
    expect(oppPaymentStatus("iets")).toBeNull();
  });
});

describe("oppVerifyNotification", () => {
  /* Letterlijk het voorbeeld uit de OPP-documentatie ("How to validate
     webhook signatures"), met hun mock-geheim. */
  const rawBody = JSON.stringify({
    uid: "not_0a1b2c3d4e5f",
    type: "transaction.status.changed",
    created: 1750248000,
    object_uid: "tra_1122334455aa",
    object_type: "transaction",
    object_url: "https://api-sandbox.onlinebetaalplatform.nl/v1/transactions/tra_1122334455aa",
  }, null, 2);
  const headers = new Headers({
    host: "platform.example.com",
    date: "Wed, 18 Jun 2026 12:00:00 GMT",
    digest: "SHA-256=ekIgbtcCIcaC2JaFkgX7+Wn1NCRk85cyvL13085dy/w=",
    signature: 'keyId="nsc_0123456789ab",algorithm="hmac-sha256",headers="(request-target) host date digest",signature="M/e1at0/heaBZwW3WQZE/TlL7nSDqbvz3xlFtswXLN8="',
  });

  beforeEach(() => vi.unstubAllEnvs());

  it("herkent een echte notificatie en de omgeving", async () => {
    const { oppVerifyNotification } = await loadOpp({ OPP_SANDBOX_NOTIFY_SECRET: "demo_notification_secret_change_me" });
    expect(oppVerifyNotification({ rawBody, headers, path: "/notify" })).toBe("sandbox");
  });

  it("weigert een aangepaste body", async () => {
    const { oppVerifyNotification } = await loadOpp({ OPP_SANDBOX_NOTIFY_SECRET: "demo_notification_secret_change_me" });
    expect(oppVerifyNotification({ rawBody: rawBody.replace("tra_1122334455aa", "tra_ander"), headers, path: "/notify" })).toBeNull();
  });

  it("weigert een ander pad of een verkeerd geheim", async () => {
    const good = await loadOpp({ OPP_SANDBOX_NOTIFY_SECRET: "demo_notification_secret_change_me" });
    expect(good.oppVerifyNotification({ rawBody, headers, path: "/api/webhooks/opp" })).toBeNull();
    const bad = await loadOpp({ OPP_SANDBOX_NOTIFY_SECRET: "verkeerd" });
    expect(bad.oppVerifyNotification({ rawBody, headers, path: "/notify" })).toBeNull();
  });

  it("weigert zonder handtekening", async () => {
    const { oppVerifyNotification } = await loadOpp({ OPP_SANDBOX_NOTIFY_SECRET: "demo_notification_secret_change_me" });
    expect(oppVerifyNotification({ rawBody, headers: new Headers({ host: "platform.example.com" }), path: "/notify" })).toBeNull();
  });
});
