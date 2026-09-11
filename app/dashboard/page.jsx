import Dashboard from "@/components/pages/Dashboard";
import {
  getDashboardSessions, getDashboardBookings, getDashboardWorkshops,
  getDashboardVenues, getProviderProfile, getCategories, getCities,
  DASH_NAV, DASH_TITLES,
} from "@/lib/directus";

export const revalidate = 60;

export default async function Page() {
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
