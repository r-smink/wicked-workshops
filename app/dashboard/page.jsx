import Dashboard from "@/components/pages/Dashboard";
import {
  getDashboardSessions, getDashboardBookings, getDashboardWorkshops,
  DASH_NAV, DASH_TITLES,
} from "@/lib/directus";

export const revalidate = 60;

export default async function Page() {
  const [sessions, bookings, workshops] = await Promise.all([
    getDashboardSessions(),
    getDashboardBookings(),
    getDashboardWorkshops(),
  ]);
  return (
    <Dashboard
      initialView="overview"
      sessions={sessions}
      bookings={bookings}
      workshops={workshops}
      nav={DASH_NAV}
      titles={DASH_TITLES}
    />
  );
}
