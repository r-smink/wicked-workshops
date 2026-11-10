import PublicLayout from "@/components/PublicLayout";
import { ForgotSent } from "@/components/pages/AccountForms";

export const metadata = { title: "Kijk in je mail", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e = "" } = await searchParams;
  return (
    <PublicLayout>
      <ForgotSent email={String(e).slice(0, 254)} />
    </PublicLayout>
  );
}
