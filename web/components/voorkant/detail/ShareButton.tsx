"use client";

import { useState } from "react";

/* "Delen" in de kop: deelmenu van het toestel, anders de link kopieren. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* afgebroken */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* klembord niet beschikbaar */
    }
  }
  return (
    <button className="btn btn-line btn-sm" type="button" onClick={share} aria-live="polite">
      <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="5" r="2.4" />
          <circle cx="6" cy="11" r="2.4" />
          <circle cx="16" cy="17" r="2.4" />
          <path d="M8.1 9.9 L13.9 6.1" />
          <path d="M8.1 12.1 L13.9 15.9" />
        </g>
      </svg>
      {copied ? "Link gekopieerd" : "Delen"}
    </button>
  );
}
