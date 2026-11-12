import Link from "next/link";
import Image from "next/image";
import type { ProviderDetail, ReviewView, WorkshopDetail } from "@/lib/voorkant/data";
import { euro, plekken, rating } from "@/lib/voorkant/format";
import { ALL_PLACES, routes } from "@/lib/routes";
import { BookingFlow } from "./BookingFlow";
import { ShareButton } from "./ShareButton";
import type { PolicyView } from "./server";
import { capital, commonSlot, countWord, selectable, sessionStart, verbs } from "./text";
import "./detail.css";

const SIZES = "(max-width: 860px) 100vw, 50vw";

/* Werktekst: de definitieve tekst volgt (juristen). {naam} wordt de voornaam. */
const WERKTEKST_PARTICULIER = "{naam} geeft workshops als privépersoon, niet als bedrijf. Je maakt je afspraak dus met een particulier, en dan geldt het consumentenrecht niet.";

/* Tijdelijk stockbeeld uit het ontwerp voor de galerij zolang Directus geen
   eigen foto's heeft (zie wicked-handoff/docs/beeldmap.md). */
type Pic = { src: string; alt: string; w: number; h: number };
const DESIGN_GALLERY: Record<string, Pic[]> = {
  "italiaans-koken-met-luca-verse-pasta": [
    { src: "/img/bedrijven-pasta.jpg", alt: "Twee deelnemers lachen terwijl ze een lange pastavel omhooghouden", w: 1400, h: 933 },
    { src: "/img/cat-pasta.jpg", alt: "Verse tagliatelle komt uit een pastamachine op een met bloem bestoven tafel", w: 1400, h: 933 },
    { src: "/img/cat-wijn3.jpg", alt: "Rode wijn wordt ingeschonken naast een bord pasta met saus", w: 787, h: 1400 },
    { src: "/img/cat-ravioli.jpg", alt: "Rijen ravioli op een houten plank, net uitgestoken", w: 1400, h: 933 },
    { src: "/img/cat-pasta2.jpg", alt: "Handen vouwen een stukje deeg tot pasta op een houten plank", w: 1400, h: 933 },
  ],
};
const TEAM_IMAGE = { src: "/img/cat-tafel.jpg", alt: "Een groep vrienden schept samen eten op aan een lange tafel" };

const Icon = ({ id, size = 18 }: { id: string; size?: number }) => (
  <svg width={size} height={size} aria-hidden="true">
    <use href={`#${id}`} />
  </svg>
);
const Check = () => <Icon id="i-check" size={13} />;
const Flag = ({ children }: { children: string }) => (
  <span className="demo-flag">
    <Icon id="i-shield" size={13} />
    {children}
  </span>
);

const paragraphs = (t: string | null | undefined) => (t ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const minutes = (hhmm: string) => {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
};
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

function groupText(min: number | null, max: number | null): string | null {
  if (!max) return null;
  return `${min ?? 1} tot ${max} personen`;
}

type Props = {
  w: WorkshopDetail;
  provider: ProviderDetail | null;
  providerWorkshops: number;
  reviews: ReviewView[];
  policy: PolicyView | null;
  paymentMode: "off" | "sandbox" | "live";
};

export function DetailPage({ w, provider, providerWorkshops, reviews, policy, paymentMode }: Props) {
  const v = verbs(w.category?.slug);
  const host = w.provider?.firstName || w.provider?.name || "de workshopgever";
  const area = w.neighbourhood || w.city?.name || "";
  const place = [w.neighbourhood, w.city?.name].filter(Boolean).join(", ");
  const privateHost = w.provider?.kind === "private";
  const sessions = w.sessions;
  const next = sessions.find(selectable) ?? null;
  const last = sessions[sessions.length - 1];
  const group = groupText(w.min, w.max);
  const slot = commonSlot(sessions);
  const price = w.price;

  /* galerij */
  const pics: Pic[] = w.gallery.length
    ? w.gallery.slice(0, 5).map((g) => ({ src: g.src, alt: g.alt || w.title, w: 1400, h: 933 }))
    : DESIGN_GALLERY[w.slug] ?? [{ src: w.image, alt: w.imageAlt, w: 1400, h: 933 }];

  /* praktisch: dagbalk rond de vaste tijd */
  let dayBar: { left: number; width: number; labels: [string, number][]; lo: string; hi: string } | null = null;
  if (slot?.end) {
    const s = minutes(slot.start), e = minutes(slot.end);
    const lo = Math.max(0, Math.floor(s / 60) - 3), hi = Math.min(24, Math.ceil(e / 60) + 3);
    const span = (hi - lo) * 60;
    if (e > s && span > 0) {
      const pct = (m: number) => Math.round(((m - lo * 60) / span) * 1000) / 10;
      dayBar = { left: pct(s), width: pct(e) - pct(s), labels: [[slot.start, pct(s)], [slot.end, pct(e)]], lo: hh(lo), hi: hh(hi) };
    }
  }

  const lead = paragraphs(w.intro);
  const body = paragraphs(w.description);
  const providerBio = paragraphs(provider?.bioShort || provider?.bioLong);
  const showReviews = reviews.length > 0 || (w.rating != null && w.ratingCount > 0);
  const team = w.groupQuoteFrom != null || w.privateBooking;
  const hours = policy?.free_until_hours_before ?? null;
  const penalty = policy?.penalty_percent_after ?? null;

  const crumbCat = w.category ? routes.category(w.category.slug, ALL_PLACES) : null;
  const crumbCity = w.category && w.city ? routes.category(w.category.slug, w.city.slug) : null;

  return (
    <>
      <div className="van-a">
        {" "}
        <div className="wrap">
          <nav className="kruimel" aria-label="Kruimelpad">
            {" "}
            <Link href="/">Home</Link>
            <span>/</span>
            {w.category && crumbCat && (
              <>
                <Link href={crumbCat}>{w.category.name}</Link>
                <span>/</span>
              </>
            )}
            {w.category && w.city && crumbCity && (
              <>
                <Link href={crumbCity}>{w.category.name} in {w.city.name}</Link>
                <span>/</span>
              </>
            )}
            {w.title}
          </nav>
        </div>
        {" "}
      </div>
      {" "}
      <div className="van-a">
        {" "}
        <section className="wrap detail-a-kop">
          {" "}
          <div>
            {" "}
            <h1>{w.city ? `${w.title} in ${w.city.name}` : w.title}</h1>
            {" "}
            <p className="detail-a-kop-rij">
              {" "}
              {w.rating != null && w.ratingCount > 0 && (
                <>
                  <a className="rate" href="#detail-a-reviews"><span className="stars" aria-hidden="true">★</span>{rating(w.rating)}{" "}<small>({w.ratingCount} reviews)</small></a>{" "}
                </>
              )}
              {place && (<><span><Icon id="i-pin" size={17} />{place}</span>{" "}</>)}
              {w.duration && (<><span><Icon id="i-clock" size={17} />{w.duration}</span>{" "}</>)}
              {group && (<><span><Icon id="i-people" size={17} />{group}</span>{" "}</>)}
              {w.provider?.kind && (<><a className="detail-a-wie" href="#detail-a-gever">{privateHost ? "Particulier" : "Bedrijf"}</a>{" "}</>)}
            </p>
            {" "}
          </div>
          {" "}
          <div className="detail-a-kop-acties">
            {" "}
            <div className="detail-d-kopkoop">
              {" "}
              {price != null && (<><p className="detail-d-kopprijs"><b>€{euro(price)}</b>{" "}per persoon</p>{" "}</>)}
              <a className="btn" href="#detail-b-sessies">Kies een datum<Icon id="i-arrow" /></a>{" "}
            </div>
            {" "}
            <div className="detail-d-kopknoppen">
              {" "}
              <ShareButton title={w.title} />{" "}
              <button className="btn btn-line btn-sm" type="button"><Icon id="i-heart" />Bewaren</button>{" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        {" "}
      </div>
      {" "}
      <div className="van-a">
        {" "}
        <section className="wrap detail-a-galerij" aria-label="Foto's van de workshop" data-n={pics.length < 5 ? pics.length : undefined}>
          {pics.map((p, i) => (
            <figure key={p.src + i} className={`detail-a-g${i + 1}`}>
              <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes={SIZES} priority={i === 0} />
            </figure>
          ))}
        </section>
        {" "}
      </div>
      {" "}
      {sessions.length > 0 ? (
        <BookingFlow
          title={w.title}
          sessions={sessions}
          price={price}
          host={host}
          place={place}
          area={area}
          privateHost={privateHost}
          paymentMode={paymentMode}
          words={{ atHost: v.atHost, doing: v.doing }}
        />
      ) : (
        <div className="van-b">
          {" "}
          <section className="detail-b-sessies" id="detail-b-sessies" aria-labelledby="detail-b-sessies-h">
            <div className="wrap">
              <div className="detail-b-kop">
                <h2 id="detail-b-sessies-h">Kies je datum</h2>
                <p>
                  Er staan nu geen datums open voor deze workshop. Kijk later nog eens
                  {w.provider ? (<>, of bekijk <Link href={routes.provider(w.provider.slug)}>wat {host} nog meer doet</Link>.</>) : "."}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
      {" "}
      <div className="van-a">
        {" "}
        <div className="wrap detail-a-split">
          {" "}
          <div className="detail-a-main">
            {" "}
            {(lead.length > 0 || body.length > 0) && (
              <section className="detail-a-blok">
                {" "}
                <h2>Wat je doet en maakt</h2>
                {" "}
                {[...lead, ...body].map((t, i) => <p key={i} className="detail-a-lead">{t}</p>)}
                {" "}
              </section>
            )}
            {w.inclusions.length > 0 && (
              <section className="detail-a-blok">
                {" "}
                <h2>Wat er inbegrepen is</h2>
                {" "}
                <ul className="detail-a-in">
                  {w.inclusions.map((t, i) => (
                    <li key={i}><Icon id="i-check" />{t}</li>
                  ))}
                </ul>
                {" "}
              </section>
            )}
            <section className="detail-a-blok">
              {" "}
              <h2>Praktisch</h2>
              {" "}
              <dl className="detail-a-prak">
                {" "}
                {w.duration && (
                  <div className="detail-a-prak-breed">
                    {" "}
                    <dt>Duur</dt>{" "}
                    <dd>
                      {w.duration}
                      {slot ? `, op ${slot.weekday} van ${slot.start}${slot.end ? ` tot ${slot.end}` : ""}` : ""}{" "}
                      {dayBar && (
                        <span className="detail-a-dag" aria-hidden="true">
                          <i style={{ left: `${dayBar.left}%`, width: `${dayBar.width}%` }}></i>
                          <small style={{ left: "0" }}>{dayBar.lo}</small>
                          {dayBar.labels.map(([t, l]) => <small key={t} style={{ left: `${l}%` }}>{t}</small>)}
                          <small style={{ right: "0" }}>{dayBar.hi}</small>
                        </span>
                      )}{" "}
                    </dd>{" "}
                  </div>
                )}
                {group && w.max && (
                  <div className="detail-a-prak-breed">
                    {" "}
                    <dt>Groepsgrootte</dt>{" "}
                    <dd>
                      {group}{" "}
                      <span className="detail-stoelen detail-a-stoelen-groot" aria-hidden="true">
                        {Array.from({ length: Math.min(w.max, 24) }, (_, i) => <i key={i} className={w.min && i < w.min ? "n" : undefined}></i>)}
                      </span>{" "}
                    </dd>{" "}
                  </div>
                )}
                {w.accessibility && (<div><dt>Toegankelijkheid</dt><dd>{w.accessibility}</dd></div>)}
                {place && (<div><dt>Waar</dt><dd>{[w.locationName, place].filter(Boolean).join(", ")}. Het precieze adres staat in je bevestiging.</dd></div>)}
              </dl>
              {" "}
            </section>
            {w.provider && (
              <section className="detail-a-blok detail-a-gever" id="detail-a-gever" data-noimg={provider?.image ? undefined : ""}>
                {" "}
                {provider?.image && (
                  <figure><Image src={provider.image} alt={`${host} in de workshopruimte`} width={1100} height={1650} sizes={SIZES} /></figure>
                )}
                {" "}
                <div>
                  {" "}
                  <h2>{v.atHost} {host}</h2>
                  {" "}
                  {providerBio.map((t, i) => <p key={i}>{t}</p>)}
                  {" "}
                  {provider?.rating != null && provider.ratingCount > 0 && (
                    <p className="detail-a-gever-cijfer">
                      <span className="rate"><span className="stars" aria-hidden="true">★</span>{rating(provider.rating)}</span>{" "}
                      uit {provider.ratingCount} reviews{providerWorkshops > 1 ? ` over ${countWord(providerWorkshops)} workshops` : ""}
                    </p>
                  )}
                  {" "}
                  {privateHost && (
                    <div className="detail-a-pp">
                      {" "}
                      <p><b>Particulier.</b> {WERKTEKST_PARTICULIER.replace("{naam}", host)}</p>
                      {" "}
                      <Flag>Werktekst, de definitieve tekst volgt</Flag>{" "}
                    </div>
                  )}
                  {" "}
                  <Link className="tlink" href={routes.provider(w.provider.slug)}>Bekijk het profiel van {host}<Icon id="i-arrow" /></Link>{" "}
                </div>
                {" "}
              </section>
            )}
            {policy && (
              <section className="detail-a-blok">
                {" "}
                <h2>Annuleren of verzetten</h2>
                {" "}
                {policy.key === "basis" && <p className="detail-a-sub">Zo werkt het bij de meeste workshops, ook bij deze.</p>}
                {" "}
                {hours != null ? (
                  <div className="detail-a-annuleer" role="list">
                    {" "}
                    <div role="listitem"><b>Tot {hours} uur vooraf</b><span>Gratis annuleren</span></div>
                    {" "}
                    <div role="listitem"><b>Daarna</b><span>{penalty === 100 ? "Je betaalt het hele bedrag" : penalty ? `Je betaalt ${penalty} procent` : "Ook gratis"}</span></div>
                    {" "}
                    {policy.reschedule_free && <div role="listitem"><b>Verzetten</b><span>Kosteloos, zolang er plek is</span></div>}
                    {" "}
                  </div>
                ) : (
                  policy.description && <p className="detail-a-tekst">{policy.description}</p>
                )}
                {" "}
                <p className="detail-a-tekst">Annuleert {host}, dan krijg je alles terug en een andere datum aangeboden. Kun je zelf niet, meld je dan af, dan komt je plek vrij voor een ander.</p>
                {" "}
              </section>
            )}
            {showReviews && (
              <section className="detail-a-blok" id="detail-a-reviews">
                {" "}
                <div className="detail-a-rev-kop">
                  {" "}
                  <h2>Wat deelnemers zeggen</h2>
                  {" "}
                  {w.rating != null && w.ratingCount > 0 && (
                    <p><b>{rating(w.rating)}</b><span className="stars" aria-hidden="true">★★★★★</span><span>{w.ratingCount} reviews op deze workshop, alleen van mensen die via Wicked hebben geboekt</span></p>
                  )}
                  {" "}
                </div>
                {" "}
                {reviews.length > 0 && (
                  <div className="detail-a-revs">
                    {reviews.slice(0, 3).map((r) => (
                      <article key={r.id}>
                        {" "}
                        <p>“{r.body}”</p>
                        {" "}
                        <footer><span className="detail-av">{r.initials}</span><span><b>{r.author.split(" ")[0]}</b>{" "}{v.joined}</span></footer>
                        {" "}
                      </article>
                    ))}
                  </div>
                )}
                {" "}
                {w.provider && w.ratingCount > Math.min(reviews.length, 3) && (
                  <Link className="tlink" href={routes.provider(w.provider.slug)}>Lees alle {w.ratingCount} reviews van deze workshop<Icon id="i-arrow" /></Link>
                )}
                {" "}
              </section>
            )}
            {w.faq.length > 0 && (
              <section className="detail-a-blok">
                {" "}
                <h2>Veelgestelde vragen</h2>
                {" "}
                <div className="faq">
                  {w.faq.map((f, i) => (
                    <details key={i}><summary>{f.question}</summary><p>{f.answer}</p></details>
                  ))}
                </div>
                {" "}
              </section>
            )}
          </div>
          {" "}
          <aside className="detail-a-kaart detail-d-zij" aria-label="Prijs en volgende datum">
            {" "}
            <div className="detail-d-kaartje">
              {" "}
              {price != null && <p className="detail-d-k-prijs"><b>€{euro(price)}</b>{" "}per persoon</p>}
              {" "}
              {next ? (
                <div className="detail-d-k-eerst">
                  {" "}
                  <p className="detail-d-k-label">Eerstvolgende datum</p>
                  {" "}
                  <p className="detail-d-k-dag">
                    <b>{sessionStart(next)}</b>
                    {next.stand === "open" ? <span className="detail-stand detail-stand-open">{next.label}</span> : <span className="detail-stand detail-stand-door"><Check />Gaat door</span>}
                  </p>
                  {" "}
                  <p className="detail-d-k-sub">{next.taken} aangemeld, nog {plekken(next.free)}</p>
                  {" "}
                </div>
              ) : (
                <div className="detail-d-k-eerst">
                  <p className="detail-d-k-label">Er staan nu geen datums open.</p>
                </div>
              )}
              {" "}
              <a className="btn" href="#detail-b-sessies">Kies een datum</a>{" "}
              {last && (
                <p className="detail-d-k-klein">
                  {sessions.length === 1 ? `Eén datum: ${last.day}.` : `${capital(countWord(sessions.length))} datums tot en met ${last.day}.`} Boekingskosten €0, altijd.
                </p>
              )}
              {!last && <p className="detail-d-k-klein">Boekingskosten €0, altijd.</p>}
              {" "}
            </div>
            {" "}
          </aside>{" "}
        </div>
        {" "}
      </div>
      {" "}
      {team && (
        <div className="van-a">
          {" "}
          <section className="wrap detail-a-zakelijk">
            {" "}
            <Image src={TEAM_IMAGE.src} alt={TEAM_IMAGE.alt} width={1400} height={933} sizes={SIZES} />{" "}
            <div>
              {" "}
              <h2>Met {w.groupQuoteFrom ? `${countWord(w.groupQuoteFrom)} of meer` : "een groep"} collega&apos;s {v.team}?</h2>
              {" "}
              <p>
                {w.privateBooking ? "" : `De ${v.cooking ? "keuken" : "ruimte"} van ${host} is te klein voor een team. `}
                Vertel ons wat je zoekt, dan zoeken wij een {v.kind} die past. Je hoort binnen één werkdag van ons. Het minimum per datum geldt niet voor bedrijfsuitjes.
              </p>
              {" "}
              <Link className="btn" href={routes.contact}>Vraag een teamuitje aan<Icon id="i-arrow" /></Link>{" "}
            </div>
            {" "}
          </section>
          {" "}
        </div>
      )}
      {" "}
      <div className="van-a">
        {" "}
        <div className="detail-a-mbalk">
          {" "}
          <span>
            {price != null && (<><b>€{euro(price)}</b>{" "}p.p.</>)}
            <small>{sessions.length ? `${sessions.length} ${sessions.length === 1 ? "datum" : "datums"}, vanaf ${sessions[0]!.day}` : "Nog geen datums"}</small>
          </span>{" "}
          <a className="btn btn-sm" href="#detail-b-sessies">Kies een datum</a>{" "}
        </div>
        {" "}
      </div>
    </>
  );
}

/* Afgeleide meta-omschrijving als seoDescription leeg is. */
export function deriveDescription(w: WorkshopDetail): string {
  if (w.intro) return w.intro.length > 160 ? `${w.intro.slice(0, 157).trimEnd()}...` : w.intro;
  const place = [w.neighbourhood, w.city?.name].filter(Boolean).join(", ");
  const bits = [
    place ? `${w.title} in ${place}.` : `${w.title}.`,
    [w.duration, groupText(w.min, w.max), w.price != null ? `€${euro(w.price)} per persoon` : null].filter(Boolean).join(", "),
  ];
  return `${bits.filter(Boolean).join(" ")}. Kies je datum en zie meteen of hij doorgaat.`.replace(/\.\./g, ".");
}
