import PublicLayout from "@/components/PublicLayout";
import { ForgotPassword } from "@/components/pages/AccountForms";

export const metadata = { title: "Wachtwoord vergeten", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return (
    <PublicLayout>
      <ForgotPassword initialEmail={String(email).slice(0, 254)} />
    </PublicLayout>
  );
}
