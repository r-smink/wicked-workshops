"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { vul, werkteksten } from "@/content/werkteksten";

/* Beheer van één aanmelding: andere datum, verzetten, annuleren, melding
   en review (docs/05 §4-8). Gegevens komen klaar uit app/boeking/beheer. */

export type ManageView = {
  code: string;
  token: string;
  status: string;
  statusLabel: string;
  workshopTitle: string;
  workshopSlug: string | null;
  providerName: string;
  when: string;
  participants: number;
  total: number;
  testMode: boolean;
  location: { name: string | null; address: string; postal: string } | null;
  refundStatus: string | null;
  refundAmount: number | null;
  cancel: { free: boolean; freeUntil: string | null; feePercent: number; refund: number; pilot: boolean } | null;
  targets: { id: string; when: string; standing: string }[];
  offer: { sessionId: string | null; when: string; expires: string } | null;
  complaint: { open: boolean; until: string } | null;
  complaintPending: boolean;
  review: boolean;
};

const euro = (n: number) => `€ ${n.toFixed(2).replace(".", ",")}`;
const T = werkteksten.beheer;

const KINDS: [string, string][] = [
  ["no_show_provider", "De workshopgever kwam niet"],
  ["quality", "De workshop was anders dan beschreven"],
  ["safety", "Ik voelde me niet veilig, of iemand gedroeg zich niet goed"],
  ["no_show_dispute", "Ik was er wel (niet verschenen klopt niet)"],
  ["other", "Iets anders"],
];

export default function BookingManage({ view }: { view: ManageView }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [target, setTarget] = useState<string>(view.offer?.sessionId || view.targets[0]?.id || "");
  const [showOther, setShowOther] = useState(!view.offer?.sessionId);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [kind, setKind] = useState(view.status === "no_show" ? "no_show_dispute" : "no_show_provider");
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState(0);
  const [reviewStep, setReviewStep] = useState<1 | 2>(1);
  const [reviewText, setReviewText] = useState("");

  async function act(action: string, extra: Record<string, unknown> = {}, done?: string) {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(view.code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: view.token, action, ...extra }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Dat lukte niet. Probeer het opnieuw.");
        return;
      }
      if (json.booking_code) {
        router.push(`/boeking/beheer?code=${encodeURIComponent(json.booking_code)}${json.t ? `&t=${encodeURIComponent(json.t)}` : ""}`);
        return;
      }
      if (done) setNotice(done);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const cancelText = (() => {
    const c = view.cancel;
    if (!c) return "";
    const first = c.freeUntil ? `Gratis tot ${c.freeUntil}.` : "";
    const after = c.feePercent > 0 ? vul(T.annulerenVast, { procent: c.feePercent }) : T.annulerenGeenKosten;
    return [first, after, c.pilot ? T.pilotAnnuleren : ""].filter(Boolean).join(" ");
  })();
  const cancelButton = !view.cancel
    ? ""
    : view.cancel.free
      ? "Annuleer, nu nog gratis"
      : view.cancel.refund > 0 && view.cancel.refund < view.total
        ? `Annuleer (je krijgt ${euro(view.cancel.refund)} terug)`
        : "Annuleer";

  return (
    <div className="ww-wrap" style={{ maxWidth: 720, padding: "40px 20px 64px" }}>
      <p className="ww-meta" style={{ margin: 0 }}>Aanmelding {view.code}</p>
      <h1 style={{ margin: "6px 0 4px" }}>{view.workshopTitle}</h1>
      <p style={{ margin: 0 }}>
        {view.when} bij {view.providerName} · {view.participants} {view.participants === 1 ? "persoon" : "personen"}
        {view.total ? ` · ${euro(view.total)}` : ""}
      </p>
      <p style={{ marginTop: 10 }}><strong>{view.statusLabel}</strong></p>
      {view.refundStatus && view.refundStatus !== "none" && view.refundAmount ? (
        <p style={{ marginTop: 4 }}>
          {view.refundStatus === "completed" ? "Terugbetaald" : view.refundStatus === "failed" ? "Terugbetaling vertraagd, we zijn ermee bezig" : "Terugbetaling onderweg"}: {euro(view.refundAmount)}
        </p>
      ) : null}
      {view.testMode && <p className="ww-meta" role="note">{werkteksten.betalen.testmodusTerug}</p>}

      {error && <p role="alert" style={{ color: "var(--ww-coral-deep)", fontWeight: 700 }}>{error}</p>}
      {notice && <p role="status" style={{ color: "var(--ww-ok)", fontWeight: 700 }}>{notice}</p>}

      {view.location && (
        <section className="ww-card" style={{ padding: 20, marginTop: 20 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Waar</h2>
          {view.location.name && <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{view.location.name}</p>}
          <p style={{ margin: 0 }}>{view.location.address}{view.location.postal ? <><br />{view.location.postal}</> : null}</p>
          <p className="ww-meta" style={{ marginTop: 10, fontSize: 13 }}>Dit adres is alleen voor deelnemers. Deel het niet verder.</p>
        </section>
      )}

      {view.offer && (
        <section className="ww-card" style={{ padding: 20, marginTop: 20 }} aria-labelledby="aanbod">
          <h2 id="aanbod" style={{ fontSize: 18, marginTop: 0 }}>
            {view.offer.sessionId ? `Er is een nieuwe datum voor je: ${view.offer.when}` : "Kies een andere datum of je geld terug"}
          </h2>
          {view.offer.sessionId && <p>Zelfde workshop, de datum gaat al door, en er is plek.</p>}
          <p className="ww-meta">Kies voor {view.offer.expires}. Daarna annuleren we je aanmelding kosteloos.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {view.offer.sessionId && (
              <button className="ww-btn ww-btn--primary" disabled={Boolean(busy)} onClick={() => act("accept_offer", { session_id: view.offer!.sessionId })}>
                Ja, {view.offer.when}
              </button>
            )}
            <button className="ww-btn ww-btn--outline" aria-expanded={showOther} onClick={() => setShowOther((v) => !v)}>
              Andere datum of annuleren
            </button>
          </div>
          {showOther && (
            <div style={{ marginTop: 16 }}>
              <DatePicker targets={view.targets} value={target} onChange={setTarget} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {view.targets.length > 0 && (
                  <button className="ww-btn ww-btn--primary" disabled={!target || Boolean(busy)} onClick={() => act("accept_offer", { session_id: target })}>
                    Kies deze datum
                  </button>
                )}
                <button className="ww-btn ww-btn--outline" disabled={Boolean(busy)} onClick={() => act("decline_offer", {}, "Je krijgt het volledige bedrag terug.")}>
                  Geen datum, geld terug
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {view.cancel && view.targets.length > 0 && (
        <section className="ww-card" style={{ padding: 20, marginTop: 20 }} aria-labelledby="verzetten">
          <h2 id="verzetten" style={{ fontSize: 18, marginTop: 0 }}>Verzetten, kosteloos</h2>
          <p className="ww-meta">Kies een andere datum van dezelfde workshop. Het aantal personen blijft hetzelfde.</p>
          <DatePicker targets={view.targets} value={target} onChange={setTarget} />
          <button className="ww-btn ww-btn--primary" style={{ marginTop: 12 }} disabled={!target || Boolean(busy)} onClick={() => act("reschedule", { session_id: target })}>
            {busy === "reschedule" ? "Bezig..." : "Verzet naar deze datum"}
          </button>
        </section>
      )}

      {view.cancel && (
        <section className="ww-card" style={{ padding: 20, marginTop: 20 }} aria-labelledby="annuleren">
          <h2 id="annuleren" style={{ fontSize: 18, marginTop: 0 }}>Annuleren</h2>
          <p>{cancelText}</p>
          {!confirmCancel ? (
            <button className="ww-btn ww-btn--outline" onClick={() => setConfirmCancel(true)}>{cancelButton}</button>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span>Weet je het zeker?</span>
              <button className="ww-btn ww-btn--coral" disabled={Boolean(busy)} onClick={() => act("cancel", {}, "Je aanmelding is geannuleerd. Je krijgt een bevestiging per mail.")}>
                {busy === "cancel" ? "Bezig..." : "Ja, annuleer"}
              </button>
              <button className="ww-btn ww-btn--ghost" onClick={() => setConfirmCancel(false)}>Nee, toch niet</button>
            </div>
          )}
        </section>
      )}

      {view.review && (
        <section id="review" className="ww-card" style={{ padding: 20, marginTop: 20 }} aria-labelledby="review-kop">
          {reviewStep === 1 ? (
            <>
              <h2 id="review-kop" style={{ fontSize: 18, marginTop: 0 }}>Hoe was het bij {view.providerName}?</h2>
              <div role="radiogroup" aria-label="Aantal sterren" style={{ display: "flex", gap: 6, fontSize: 32 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={stars === n}
                    aria-label={`${n} ${n === 1 ? "ster" : "sterren"}`}
                    onClick={() => setStars(n)}
                    style={{ color: n <= stars ? "var(--ww-sun)" : "var(--ww-border)", lineHeight: 1 }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button className="ww-btn ww-btn--primary" style={{ marginTop: 12 }} disabled={!stars} onClick={() => setReviewStep(2)}>Verder</button>
            </>
          ) : (
            <>
              <h2 id="review-kop" style={{ fontSize: 18, marginTop: 0 }}>Wat wil je anderen vertellen?</h2>
              <label className="ww-field">
                <span>Mag kort</span>
                <textarea className="ww-textarea" rows={4} maxLength={2000} value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="ww-btn ww-btn--ghost" onClick={() => setReviewStep(1)}>Terug</button>
                <button className="ww-btn ww-btn--primary" disabled={Boolean(busy)} onClick={() => act("review", { rating: stars, body: reviewText }, T.reviewDank)}>
                  Plaats review
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {view.status === "no_show" && <p style={{ marginTop: 20 }}>{T.noShowUitleg}</p>}

      {view.complaintPending && <p id="melding" style={{ marginTop: 20 }}>{T.meldingDank}</p>}
      {view.complaint?.open && (
        <section id="melding" className="ww-card" style={{ padding: 20, marginTop: 20 }} aria-labelledby="melding-kop">
          <h2 id="melding-kop" style={{ fontSize: 18, marginTop: 0 }}>Er ging iets mis</h2>
          <p>{T.meldingIntro}</p>
          <p className="ww-meta">{vul(T.meldingTermijn, { datum: view.complaint.until })}</p>
          <label className="ww-field">
            <span>Wat ging er mis?</span>
            <select className="ww-select" value={kind} onChange={(e) => setKind(e.target.value)}>
              {KINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="ww-field">
            <span>Vertel wat er gebeurde</span>
            <textarea className="ww-textarea" rows={5} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <button
            className="ww-btn ww-btn--primary"
            disabled={description.trim().length < 10 || Boolean(busy)}
            onClick={() => act("complaint", { kind, description }, T.meldingDank)}
          >
            {busy === "complaint" ? "Bezig..." : "Verstuur melding"}
          </button>
        </section>
      )}

      <div style={{ marginTop: 28 }}>
        {view.workshopSlug ? (
          <Link className="ww-btn ww-btn--outline" href={`/workshop/${view.workshopSlug}`}>Naar de workshop</Link>
        ) : (
          <Link className="ww-btn ww-btn--outline" href="/">Naar home</Link>
        )}
      </div>
    </div>
  );
}

function DatePicker({ targets, value, onChange }: { targets: ManageView["targets"]; value: string; onChange: (id: string) => void }) {
  if (!targets.length) return <p>Er is nu geen andere datum met plek.</p>;
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 8 }}>
      <legend className="ww-meta" style={{ marginBottom: 6 }}>Kies een datum</legend>
      {targets.map((s) => (
        <label key={s.id} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
          <input type="radio" name="datum" value={s.id} checked={value === s.id} onChange={() => onChange(s.id)} />
          <span><strong>{s.when}</strong> · {s.standing}</span>
        </label>
      ))}
    </fieldset>
  );
}
