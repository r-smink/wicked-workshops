import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import {
  getDashboardSessions, getDashboardBookings, getDashboardWorkshops,
  getDashboardVenues, getProviderProfile, getCategories, getCities,
  DASH_NAV, DASH_TITLES,
} from "@/lib/directus";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page() {
  /* Auth-check: niet ingelogd → doorsturen naar inloggen. */
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  const [sessions, bookings, workshops, venues, provider, categories, cities] = await Promise.all([
    getDashboardSessions(),
    getDashboardBookings(),
    getDashboardWorkshops(),
    getDashboardVenues(),
    getProviderProfile(),
    getCategories(),
    getCities(),
  ]);
  return (
    <Dashboard
      initialView="overview"
      sessions={sessions}
      bookings={bookings}
      workshops={workshops}
      venues={venues}
      provider={provider}
      categories={categories}
      cities={cities}
      nav={DASH_NAV}
      titles={DASH_TITLES}
    />
  );
}
