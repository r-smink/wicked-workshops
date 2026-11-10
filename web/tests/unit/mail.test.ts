import { afterEach, describe, expect, it, vi } from "vitest";
import * as T from "@/mail/templates";

const all = () => [
  T.bookingConfirmed({
    firstName: "Sanne de Vries", workshopTitle: "Verse pasta", providerName: "Luca", when: "za 21 nov, 15:00", day: "za 21 nov",
    participants: 1, totalCents: 4500, location: { name: "Keuken", address: "Straat 1", postal_code: "3581 AA", city: "Utrecht" },
    standing: "1 van 4 nodig, beslismoment vr 20 nov, 22:00", cancelText: "Annuleren kan.", manageUrl: "https://ww.test/b?code=WW-1&t=x",
    accountUrl: "https://ww.test/account-maken/wachtwoord?code=WW-1&t=x", testMode: true, bookingCode: "WW-1",
  }),
  T.bookingCancelled({ firstName: "Sanne", workshopTitle: "Verse pasta", when: "za 21 nov, 15:00", refundCents: 4500, manageUrl: null }),
  T.sessionNotHappening({ firstName: "Sanne", workshopTitle: "Verse pasta", when: "za 21 nov, 15:00", offer: { when: "za 5 dec, 15:00", expires: "za 28 nov, 15:00" }, manageUrl: "https://ww.test/b", refundCents: 0 }),
  T.sessionCancelled({ firstName: null, workshopTitle: "Verse pasta", when: "za 21 nov, 15:00", providerName: "Luca", reason: "ziek", offer: null, manageUrl: "https://ww.test/b", refundCents: 4500 }),
  T.reminderStart({ firstName: "Sanne", workshopTitle: "Verse pasta", when: "za 21 nov, 15:00", location: null, manageUrl: "https://ww.test/b" }),
  T.complaintTeam({ workshopTitle: "<script>x</script>", bookingCode: "WW-1", kind: "quality", description: "Niet goed", when: "za", adminUrl: "https://d.test" }),
  T.accountVerify({ firstName: "Sanne", url: "https://ww.test/v?token=a", intent: "participant" }),
  T.passwordReset({ url: "https://ww.test/r?token=a" }),
];

describe("mailtemplates", () => {
  it("hebben een onderwerp, aanhef, HTML en tekst, en geen gedachtestreepjes", () => {
    for (const mail of all()) {
      expect(mail.subject.length).toBeGreaterThan(3);
      expect(mail.text).toMatch(/^Hoi/);
      expect(mail.html).toContain("<!doctype html>");
      for (const part of [mail.subject, mail.text, mail.html]) expect(part).not.toMatch(/[–—]/);
    }
  });

  it("zet het adres, de beheerlink en het accountblok in de bevestiging", () => {
    const [mail] = all();
    expect(mail!.subject).toBe("Je bent aangemeld: za 21 nov bij Luca");
    expect(mail!.text).toContain("Hoi Sanne,");
    expect(mail!.text).toContain("Straat 1");
    expect(mail!.text).toContain("Bekijk of wijzig je aanmelding: https://ww.test/b?code=WW-1&t=x");
    expect(mail!.text).toContain("Maak mijn account");
    expect(mail!.text).toContain("Betaald is nog niet hetzelfde als doorgaan");
    expect(mail!.text).toContain("€ 45,00");
  });

  it("ontsnapt HTML in ingevulde tekst", () => {
    const team = all()[5]!;
    expect(team.html).not.toContain("<script>");
    expect(team.html).toContain("&lt;script&gt;");
  });
});

describe("sendMail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock("@/lib/mail/transport");
  });

  async function load(deliver: () => Promise<boolean>) {
    vi.resetModules();
    vi.stubEnv("DIRECTUS_URL", "http://directus.test");
    vi.stubEnv("DIRECTUS_STATIC_TOKEN", "tok");
    vi.doMock("@/lib/mail/transport", () => ({ deliver: vi.fn(deliver) }));
    return import("@/lib/mail/send");
  }
  const mail = { subject: "S", text: "t", html: "<p>h</p>" };

  it("verstuurt één keer: een tweede claim in mail_log faalt en er gaat niets uit", async () => {
    const deliver = vi.fn(async () => true);
    const { sendMail } = await load(deliver);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: "m1" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ errors: [{ message: "unique" }] }), { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendMail("booking_confirmed", "b1", "a@b.nl", mail)).toBe("sent");
    expect(await sendMail("booking_confirmed", "b1", "a@b.nl", mail)).toBe("duplicate");
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(body).toMatchObject({ kind: "booking_confirmed", ref_key: "b1", dedupe_key: "booking_confirmed:b1", recipient: "a@b.nl" });
  });

  it("geeft de claim terug als versturen mislukt, zodat de cron het opnieuw probeert", async () => {
    const { sendMail } = await load(async () => { throw new Error("smtp down"); });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: "m2" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendMail("reminder_start", "b2", "a@b.nl", mail)).toBe("failed");
    expect(fetchMock.mock.calls[1]![0]).toBe("http://directus.test/items/mail_log/m2");
    expect(fetchMock.mock.calls[1]![1].method).toBe("DELETE");
  });

  it("slaat over zonder ontvanger", async () => {
    const { sendMail } = await load(async () => true);
    expect(await sendMail("x", "y", "", mail)).toBe("skipped");
  });
});
