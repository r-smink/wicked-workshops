"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Status = { kind: "idle" | "busy" | "ok" | "error"; text: string };

/* Link naar dit profiel delen: met het deelmenu van het toestel als dat er is,
   anders kopieren naar het klembord. Geeft de bevestiging terug. */
async function shareProfile(name: string, preferShare: boolean): Promise<string> {
  const url = window.location.href.split("#")[0]!;
  if (preferShare && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: `${name} op Wicked Workshops`, url });
      return "";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "De link naar dit profiel is gekopieerd.";
  } catch {
    return `Kopieren lukte niet. De link is ${url}`;
  }
}

function useFlash() {
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const flash = (t: string) => {
    setText(t);
    if (timer.current) clearTimeout(timer.current);
    if (t) timer.current = setTimeout(() => setText(""), 5000);
  };
  return [text, flash] as const;
}

/* "Volg Luca": mail bij een nieuwe datum, via POST /api/forms (form "follow"). */
export function FollowForm({ name, slug }: { name: string; slug: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const [shareText, flashShare] = useFlash();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    if (!email) {
      setStatus({ kind: "error", text: "Vul je e-mailadres in." });
      return;
    }
    setStatus({ kind: "busy", text: "" });
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "follow",
          data: { email, provider: slug, name },
          page: window.location.pathname,
          website: String(fd.get("website") ?? ""),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus({ kind: "error", text: json.error ? `${json.error}.` : "Volgen lukte niet, probeer het later opnieuw." });
        return;
      }
      form.reset();
      setStatus({ kind: "ok", text: `Gelukt. Je krijgt een mail als ${name} een nieuwe datum toevoegt.` });
    } catch {
      setStatus({ kind: "error", text: "Volgen lukte niet, probeer het later opnieuw." });
    }
  }

  const message = status.text || shareText;

  return (
    <form className="aanbieder-a-volg" aria-label={`Volg ${name}`} onSubmit={submit}>
      {" "}
      <label htmlFor="aanbieder-a-mail">Volg {name} en krijg een mail als er een nieuwe datum bij komt</label>{" "}
      <div>
        {" "}
        <input
          id="aanbieder-a-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Je e-mailadres"
          required
          aria-invalid={status.kind === "error" ? true : undefined}
          aria-describedby="aanbieder-a-volg-melding"
        />{" "}
        <button className="btn" type="submit" disabled={status.kind === "busy"}>
          Volg
        </button>{" "}
        <button
          className="btn btn-line aanbieder-a-deel"
          type="button"
          aria-label={`Deel het profiel van ${name}`}
          onClick={async () => flashShare(await shareProfile(name, true))}
        >
          <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="16" cy="5" r="2.4" />
              <circle cx="6" cy="11" r="2.4" />
              <circle cx="16" cy="17" r="2.4" />
              <path d="M8.1 9.9 L13.9 6.1" />
              <path d="M8.1 12.1 L13.9 15.9" />
            </g>
          </svg>
          Deel
        </button>{" "}
      </div>
      {" "}
      <input className="aanbieder-volg-honing" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <small>Alleen je e-mailadres, en je zegt het met één klik weer op.</small>{" "}
      <p
        id="aanbieder-a-volg-melding"
        className={status.kind === "error" ? "aanbieder-volg-melding is-fout" : "aanbieder-volg-melding"}
        role="status"
      >
        {message}
      </p>
    </form>
  );
}

/* "Kopieer de link naar dit profiel" in het slotblok. */
export function CopyLinkButton({ name }: { name: string }) {
  const [text, flash] = useFlash();
  return (
    <>
      <button className="btn btn-line" type="button" onClick={async () => flash(await shareProfile(name, false))}>
        {text && text.startsWith("De link") ? "Link gekopieerd" : "Kopieer de link naar dit profiel"}
      </button>
      <span className="aanbieder-volg-sr" role="status">
        {text}
      </span>
    </>
  );
}
