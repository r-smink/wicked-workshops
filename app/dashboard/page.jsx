import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import {
  getDashboardSessions, getDashboardBookings, getDashboardWorkshops,
  getDashboardReviews, getDashboardVenues, getProviderProfile, getCategories, getCities,
  DASH_NAV, DASH_TITLES,
} from "@/lib/directus";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page() {
  /* Auth-check: niet ingelogd → doorsturen naar inloggen. */
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  /* Provider ophalen die hoort bij deze user. */
  const provider = await getProviderProfile(user.id);
  const pid = provider?.id || null;

  const [sessions, bookings, workshops, reviews, venues, categories, cities] = await Promise.all([
    getDashboardSessions(pid),
    getDashboardBookings(pid),
    getDashboardWorkshops(pid),
    getDashboardReviews(pid),
    getDashboardVenues(),
    getCategories(),
    getCities(),
  ]);

  /* Nav-badges dynamisch: alleen tonen als er echt iets is. */
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const nav = DASH_NAV.map((n) => {
    if (n.key === "bookings" && pendingBookings > 0) return { ...n, dot: pendingBookings };
    if (n.key === "reviews" && reviews.length > 0) return { ...n, dot: reviews.length };
    return { ...n, dot: undefined };
  });

  /* KPI's berekenen uit echte data. */
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const monthTotal = monthBookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalParticipants = monthBookings.reduce((sum, b) => sum + (b.people || 0), 0);
  const upcomingSessions = sessions.filter((s) => new Date(s.starts_at || s.date) >= now).length;
  const avgRating = provider?.rating ?? null;
  const reviewCount = provider?.count ?? reviews.length;

  const titles = {
    ...DASH_TITLES,
    overview: [`Hoi ${provider?.display_name?.split(" ")[0] || "there"}`, "Hier staat je week in een oogopslag."],
  };

  return (
    <Dashboard
      initialView="overview"
      sessions={sessions}
      bookings={bookings}
      workshops={workshops}
      reviews={reviews}
      venues={venues}
      provider={provider}
      categories={categories}
      cities={cities}
      nav={nav}
      titles={titles}
      kpis={{
        monthTotal,
        monthBookings: monthBookings.length,
        totalParticipants,
        upcomingSessions,
        avgRating,
        reviewCount,
        pendingBookings,
      }}
    />
  );
}
