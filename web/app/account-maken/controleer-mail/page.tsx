import PublicLayout from "@/components/PublicLayout";
import { CheckMail } from "@/components/pages/AccountForms";

export const metadata = { title: "Bevestig je e-mailadres", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; tab?: string }> }) {
  const { e = "", tab } = await searchParams;
  return (
    <PublicLayout>
      <CheckMail email={String(e).slice(0, 254)} provider={tab === "provider"} />
    </PublicLayout>
  );
}
