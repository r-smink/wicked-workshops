import AuthPage from "@/components/pages/AuthPage";
import { SIDE_COPY } from "@/lib/mock-data";

export const metadata = { title: "Inloggen of aanmelden" };

export default function Page({ searchParams }) {
  const { tab } = searchParams || {};
  return <AuthPage tab={tab === "provider" ? "provider" : "visitor"} sideCopy={SIDE_COPY} />;
}
