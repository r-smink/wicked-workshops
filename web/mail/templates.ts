/* Alle mailtemplates (docs/05 §11). Elke functie krijgt kant-en-klare
   gegevens (geformatteerde datums, URL's) en geeft { subject, text, html }.
   Geen data ophalen hier: dat doet lib/mail/notify.ts. */

import { render, type Block, type Mail } from "./layout";

export function euro(cents: number | null | undefined): string {
  const value = (Number(cents) || 0) / 100;
  return `€ ${value.toFixed(2).replace(".", ",")}`;
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

type Base = { firstName?: string | null; workshopTitle: string };
type Location = { name?: string | null; address?: string | null; postal_code?: string | null; city?: string | null } | null;

function locationLines(location: Location): string[] {
  if (!location?.address) return ["Het adres staat op je boekingspagina."];
  return [
    location.name || "",
    location.address,
    [location.postal_code, location.city].filter(Boolean).join(" "),
  ].filter(Boolean);
}

const ADDRESS_NOTE = "Dit adres is alleen voor deelnemers. Deel het niet verder.";
const TEST_NOTE = "Testmodus: dit was een testbetaling. Er is geen echt geld afgeschreven.";

/* ---------- boeken ---------- */

export function bookingConfirmed(d: Base & {
  providerName: string; when: string; day: string; participants: number; totalCents: number;
  location: Location; standing: string | null; cancelText: string | null; manageUrl: string;
  accountUrl: string | null; testMode: boolean; bookingCode: string;
}): Mail {
  const blocks: Block[] = [
    { p: `Je bent aangemeld voor ${d.workshopTitle} bij ${d.providerName}. Hieronder staat alles wat je nodig hebt.` },
    {
      title: "Wanneer en waar",
      box: [cap(d.when), ...locationLines(d.location)],
    },
    {
      box: [
        `${d.participants} ${d.participants === 1 ? "persoon" : "personen"}, ${euro(d.totalCents)}`,
        `Boekingscode ${d.bookingCode}`,
        ...(d.standing ? [d.standing] : []),
      ],
    },
  ];
  if (d.standing) {
    blocks.push({ p: "Betaald is nog niet hetzelfde als doorgaan: deze datum heeft een minimum. Op het beslismoment hoor je of hij doorgaat. Gaat hij niet door, dan krijg je een andere datum aangeboden of je geld terug." });
  }
  if (d.cancelText) blocks.push({ p: d.cancelText });
  blocks.push({ button: { label: "Bekijk of wijzig je aanmelding", url: d.manageUrl } });
  if (d.accountUrl) {
    blocks.push({ box: ["Al je aanmeldingen op één plek? Maak met één klik een account."], title: "Account" });
    blocks.push({ button: { label: "Maak mijn account", url: d.accountUrl } });
  }
  blocks.push({ small: ADDRESS_NOTE });
  if (d.testMode) blocks.push({ small: TEST_NOTE });
  return render(`Je bent aangemeld: ${d.day} bij ${d.providerName}`, d.firstName, blocks);
}

export function bookingCancelled(d: Base & { when: string; refundCents: number; manageUrl: string | null }): Mail {
  const blocks: Block[] = [
    { p: `Je aanmelding voor ${d.workshopTitle} op ${d.when} is geannuleerd.` },
    d.refundCents > 0
      ? { p: `Je krijgt ${euro(d.refundCents)} terug. Het bedrag staat binnen een paar werkdagen op je rekening.` }
      : { p: "Er waren geen kosten en er is niets terug te betalen." },
  ];
  if (d.manageUrl) blocks.push({ button: { label: "Bekijk je aanmelding", url: d.manageUrl } });
  return render("Je aanmelding is geannuleerd", d.firstName, blocks);
}

export function bookingMoved(d: Base & { fromWhen: string; toWhen: string; manageUrl: string }): Mail {
  return render(`Verzet naar ${d.toWhen}`, d.firstName, [
    { p: `Je aanmelding voor ${d.workshopTitle} is verzet van ${d.fromWhen} naar ${d.toWhen}. Het aantal personen en wat je betaalde blijven hetzelfde.` },
    { button: { label: "Bekijk je aanmelding", url: d.manageUrl } },
  ]);
}

/* ---------- datum gaat door of niet ---------- */

export function sessionConfirmed(d: Base & { day: string; when: string; manageUrl: string }): Mail {
  return render(`${cap(d.day)} gaat door`, d.firstName, [
    { p: `Goed nieuws: ${d.workshopTitle} op ${d.when} gaat door. Het minimum is gehaald en dat blijft zo, ook als iemand afzegt.` },
    { button: { label: "Bekijk je aanmelding", url: d.manageUrl } },
  ]);
}

type Offer = { when: string; expires: string } | null;

function offerBlocks(offer: Offer, manageUrl: string, refundCents: number): Block[] {
  if (offer) {
    return [
      { p: `We hebben een andere datum voor je: ${offer.when}. Die datum gaat al door en er is plek.` },
      { p: `Kies voor ${offer.expires} of je die datum wilt of je geld terug. Reageer je niet, dan annuleren we je aanmelding kosteloos en krijg je alles terug.` },
      { button: { label: "Kies een datum of je geld terug", url: manageUrl } },
    ];
  }
  return [
    refundCents > 0
      ? { p: `Je krijgt het volledige bedrag terug: ${euro(refundCents)}. Het staat binnen een paar werkdagen op je rekening.` }
      : { p: "Er waren geen kosten." },
    { button: { label: "Bekijk andere datums", url: manageUrl } },
  ];
}

export function sessionNotHappening(d: Base & { when: string; offer: Offer; manageUrl: string; refundCents: number }): Mail {
  return render(`${cap(d.when)} gaat niet door`, d.firstName, [
    { p: `${d.workshopTitle} op ${d.when} gaat helaas niet door: het minimum aantal deelnemers is niet gehaald.` },
    ...offerBlocks(d.offer, d.manageUrl, d.refundCents),
  ]);
}

export function sessionCancelled(d: Base & { when: string; providerName: string; reason: string | null; offer: Offer; manageUrl: string; refundCents: number }): Mail {
  return render(`${cap(d.when)} is geannuleerd`, d.firstName, [
    { p: `${d.providerName} heeft ${d.workshopTitle} op ${d.when} moeten annuleren.${d.reason ? ` Reden: ${d.reason}` : ""}` },
    ...offerBlocks(d.offer, d.manageUrl, d.refundCents),
  ]);
}

export function offerExpired(d: Base & { when: string; refundCents: number }): Mail {
  return render("Je aanmelding is kosteloos geannuleerd", d.firstName, [
    { p: `Je hebt niet gereageerd op de andere datum voor ${d.workshopTitle}. Je aanmelding is daarom kosteloos geannuleerd.` },
    d.refundCents > 0 ? { p: `Je krijgt ${euro(d.refundCents)} terug.` } : { p: "Er waren geen kosten." },
  ]);
}

export function providerDecision(d: Base & { when: string; goesAhead: boolean; taken: number; min: number; graceUntil: string | null; dashboardUrl: string }): Mail {
  if (d.goesAhead) {
    return render(`${cap(d.when)} gaat door`, d.firstName, [
      { p: `${d.workshopTitle} op ${d.when} gaat door, met ${d.taken} aanmeldingen. Datum, tijd en minimum liggen nu vast.` },
      { button: { label: "Naar je dashboard", url: d.dashboardUrl } },
    ]);
  }
  return render(`${cap(d.when)}: minimum niet gehaald`, d.firstName, [
    { p: `Het beslismoment voor ${d.workshopTitle} op ${d.when} is voorbij: ${d.taken} van ${d.min} aanmeldingen.` },
    d.graceUntil
      ? { p: `Wil je toch doorgaan? Dat kan in je dashboard tot ${d.graceUntil}. Daarna krijgen de deelnemers een andere datum aangeboden of hun geld terug.` }
      : { p: "De deelnemers krijgen een andere datum aangeboden of hun geld terug." },
    { button: { label: "Naar je dashboard", url: d.dashboardUrl } },
  ]);
}

/* ---------- herinneringen ---------- */

export function reminderDecision(d: Base & { when: string; standing: string; decisionWhen: string; workshopUrl: string; manageUrl: string }): Mail {
  return render(`Nog even: ${d.workshopTitle}`, d.firstName, [
    { p: `${d.workshopTitle} op ${d.when} staat op ${d.standing}. Op ${d.decisionWhen} valt het besluit of de datum doorgaat.` },
    { p: "Ken je iemand die mee wil? Deel de workshop, dan is de kans groter dat hij doorgaat." },
    { button: { label: "Deel de workshop", url: d.workshopUrl } },
    { small: `Je aanmelding bekijken of wijzigen: ${d.manageUrl}` },
  ]);
}

export function reminderStart(d: Base & { when: string; location: Location; manageUrl: string }): Mail {
  return render(`Morgen: ${d.workshopTitle}`, d.firstName, [
    { p: `Fijn dat je erbij bent. ${d.workshopTitle} begint ${d.when}.` },
    { title: "Waar", box: locationLines(d.location) },
    { button: { label: "Bekijk je aanmelding", url: d.manageUrl } },
    { small: ADDRESS_NOTE },
  ]);
}

/* ---------- na afloop ---------- */

export function reviewInvite(d: Base & { providerName: string; reviewUrl: string }): Mail {
  return render(`Hoe was het bij ${d.providerName}?`, d.firstName, [
    { p: `Je deed mee aan ${d.workshopTitle}. Vertel anderen hoe het was: twee vragen, klaar in een minuut.` },
    { button: { label: "Schrijf een review", url: d.reviewUrl } },
  ]);
}

export function noShowMarked(d: Base & { when: string; manageUrl: string }): Mail {
  return render("Je was er niet bij", d.firstName, [
    { p: `${d.workshopTitle} op ${d.when} is voorbij en de workshopgever heeft gemeld dat je er niet was. Bij niet verschijnen krijg je geen geld terug.` },
    { p: "Klopt dit niet? Laat het ons weten via je aanmelding." },
    { button: { label: "Dit klopt niet", url: d.manageUrl } },
  ]);
}

/* ---------- klachten en terugbetalen ---------- */

export function complaintReceived(d: Base & { bookingCode: string }): Mail {
  return render("We hebben je melding ontvangen", d.firstName, [
    { p: `Bedankt voor je melding over ${d.workshopTitle} (boeking ${d.bookingCode}). We bekijken hem en horen ook de workshopgever. Binnen 14 dagen hoor je wat we besluiten.` },
    { p: "Zolang je melding loopt, gaat het geld nog niet naar de workshopgever." },
  ]);
}

export function complaintTeam(d: { workshopTitle: string; bookingCode: string; kind: string; description: string; when: string; adminUrl: string }): Mail {
  return render(`Nieuwe klacht: ${d.bookingCode}`, "team", [
    { box: [`Workshop: ${d.workshopTitle}`, `Datum: ${d.when}`, `Soort: ${d.kind}`], title: d.bookingCode },
    { p: d.description },
    { p: "De escrow bij OPP is verlengd. Beslis binnen 14 dagen." },
    { button: { label: "Open in Directus", url: d.adminUrl } },
  ]);
}

export function refundDone(d: Base & { refundCents: number }): Mail {
  return render("We betalen je terug", d.firstName, [
    { p: `Over ${d.workshopTitle}: je krijgt ${euro(d.refundCents)} terug. Het staat binnen een paar werkdagen op je rekening.` },
  ]);
}

/* ---------- workshopgever ---------- */

export function workshopLive(d: Base & { url: string }): Mail {
  return render("Je workshop staat online", d.firstName, [
    { p: `${d.workshopTitle} is nagekeken en staat online. Deelnemers kunnen zich nu aanmelden op je datums.` },
    { button: { label: "Bekijk je workshop", url: d.url } },
  ]);
}

export function workshopChanges(d: Base & { note: string; url: string }): Mail {
  return render("Nog een paar dingen voor je workshop", d.firstName, [
    { p: `We hebben ${d.workshopTitle} nagekeken. Voordat hij online kan, vragen we je dit aan te passen:` },
    { p: d.note },
    { button: { label: "Pas je workshop aan", url: d.url } },
  ]);
}

/* ---------- account ---------- */

export function accountVerify(d: { firstName?: string | null; url: string; intent: "participant" | "provider" | "venue" }): Mail {
  if (d.intent === "venue") {
    return render("Klopt dit e-mailadres?", d.firstName, [
      { p: "Bevestig je e-mailadres, dan zetten we je ruimte klaar." },
      { button: { label: "Bevestig mijn e-mailadres", url: d.url } },
      { small: "Heb je niets aangemeld? Dan kun je deze mail negeren." },
    ]);
  }
  const intro = d.intent === "provider"
    ? "Bevestig je e-mailadres, dan ga je verder met je aanmelding als workshopgever."
    : "Bevestig je e-mailadres, dan is je account klaar.";
  return render("Bevestig je e-mailadres", d.firstName, [
    { p: intro },
    { button: { label: "Bevestig mijn e-mailadres", url: d.url } },
    { small: "De link werkt 24 uur en één keer." },
    { small: "Heb je geen account gemaakt? Dan kun je deze mail negeren." },
  ]);
}

export function passwordReset(d: { firstName?: string | null; url: string }): Mail {
  return render("Kies een nieuw wachtwoord", d.firstName, [
    { p: "Je vroeg om een nieuw wachtwoord. Met de knop hieronder kies je er een." },
    { button: { label: "Kies een nieuw wachtwoord", url: d.url } },
    { small: "De link werkt 1 uur en één keer. Heb je niets gevraagd? Dan kun je deze mail negeren; je wachtwoord blijft hetzelfde." },
  ]);
}
