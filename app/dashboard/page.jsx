import Dashboard from "@/components/pages/Dashboard";
import {
  getDashboardSessions, getDashboardBookings, getDashboardWorkshops,
  getDashboardVenues, getCities,
  DASH_NAV, DASH_TITLES,
} from "@/lib/directus";

export const revalidate = 60;

export default async function Page() {
  const [sessions, bookings, workshops, venues, cities] = await Promise.all([
    getDashboardSessions(),
    getDashboardBookings(),
    getDashboardWorkshops(),
    getDashboardVenues(),
    getCities(),
  ]);
  return (
    <Dashboard
      initialView="overview"
      sessions={sessions}
      bookings={bookings}
      workshops={workshops}
      venues={venues}
      cities={cities}
      nav={DASH_NAV}
      titles={DASH_TITLES}
    />
  );
}
