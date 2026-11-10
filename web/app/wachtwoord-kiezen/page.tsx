import { redirect } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import { ChoosePassword } from "@/components/pages/AccountForms";
import { findToken, tokenUsable } from "@/lib/account/tokens";

export const metadata = { title: "Kies een nieuw wachtwoord", robots: { index: false } };
export const dynamic = "force-dynamic";

/* Controleert de link al bij openen, zodat iemand niet eerst een
   wachtwoord typt om daarna te horen dat de link verlopen is. De link wordt
   pas bij opslaan gebruikt. */
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  if (!tokenUsable(await findToken(token), "reset")) redirect("/link-werkt-niet-meer?type=wachtwoord");
  return (
    <PublicLayout>
      <ChoosePassword token={token} />
    </PublicLayout>
  );
}
