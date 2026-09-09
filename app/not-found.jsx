import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "70vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "40px 20px", gap: 14,
    }}>
      <h1 style={{ fontSize: 34, margin: 0, letterSpacing: "-0.02em" }}>
        Deze pagina bestaat niet
      </h1>
      <p style={{ color: "#6E6A85", maxWidth: 380, margin: 0 }}>
        Misschien is de workshop verlopen of klopt de link niet helemaal.
      </p>
      <Link href="/" style={{
        marginTop: 8, display: "inline-flex", alignItems: "center", height: 48,
        padding: "0 22px", borderRadius: 14, background: "#6C2BD9", color: "#fff",
        fontWeight: 700, textDecoration: "none",
      }}>
        Terug naar het aanbod
      </Link>
    </main>
  );
}
