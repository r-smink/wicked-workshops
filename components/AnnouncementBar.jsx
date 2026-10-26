import Link from "next/link";

/* Donkere balk bovenaan elke publieke pagina (shared_announcement_bar uit
   de export). Tekst, vet deel en link komen uit Directus > settings. */
export default function AnnouncementBar({ text, highlight, href }) {
  const content = (
    <>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3z" />
      </svg>
      <span>
        {highlight && <b>{highlight} </b>}
        {text}
      </span>
    </>
  );
  return (
    <div className="wb-announce" role="region" aria-label="Aankondiging">
      {href ? <Link href={href}>{content}</Link> : <p>{content}</p>}
    </div>
  );
}
