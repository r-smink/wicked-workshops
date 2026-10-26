import PublicLayout from "@/components/PublicLayout";
import BlogIndexPage from "@/components/pages/BlogIndexPage";
import { getArticles } from "@/lib/directus";

export const revalidate = 60;

export default async function Page() {
  const articles = await getArticles();
  return (
    <PublicLayout>
      <BlogIndexPage articles={articles} />
    </PublicLayout>
  );
}
