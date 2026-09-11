import { redirect } from "next/navigation";
import Dashboard from "@/components/pages/Dashboard";
import { requireAuth } from "@/lib/auth";
import {
  getDashboardSessions, getDashboardBookings, getDashboardWorkshops,
  getDashboardReviews, getDashboardVenues, getProviderProfile, getCategories, getCities,
  createProviderForUser,
  DASH_NAV, DASH_TITLES,
} from "@/lib/directus";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page() {
  /* Auth-check: niet ingelogd → doorsturen naar inloggen. */
  const user = await requireAuth();
  if (!user) redirect("/inloggen?tab=provider");

  /* Provider ophalen die hoort bij deze user. */
  let provider = await getProviderProfile(user.id);

  /* Als er geen provider-record is, maak er een aan. */
  if (!provider) {
    const created = await createProviderForUser(user);
    if (created) {
      provider = await getProviderProfile(user.id);
    }
  }

  const pid = provider?.id || null;

  /* Fallback: als provider niet gevonden wordt, gebruik de user-naam. */
  const displayName = provider?.display_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Aanbieder";

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
    overview: [`Hoi ${displayName.split(" ")[0]}`, "Hier staat je week in een oogopslag."],
  };

  /* Zorg dat provider altijd een display_name heeft voor de sidebar. */
  const providerWithFallback = provider
    ? { ...provider, display_name: provider.display_name || displayName }
    : { id: null, display_name: displayName, location_name: "", profession: "" };

  return (
    <Dashboard
      initialView="overview"
      sessions={sessions}
      bookings={bookings}
      workshops={workshops}
      reviews={reviews}
      venues={venues}
      provider={providerWithFallback}
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
