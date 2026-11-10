import PublicLayout from "@/components/PublicLayout";
import { LinkExpired } from "@/components/pages/AccountForms";

export const metadata = { title: "Deze link werkt niet meer", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; e?: string }> }) {
  const { type, e = "" } = await searchParams;
  return (
    <PublicLayout>
      <LinkExpired type={type === "wachtwoord" ? "wachtwoord" : "bevestigen"} initialEmail={String(e).slice(0, 254)} />
    </PublicLayout>
  );
}
