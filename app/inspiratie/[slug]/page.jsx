import PublicLayout from "@/components/PublicLayout";
import ArticlePage from "@/components/pages/ArticlePage";
import { getArticle, getArticleSections, getArticleFaq } from "@/lib/directus";

export const revalidate = 60;

export default async function Page({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return (
    <PublicLayout>
      <ArticlePage article={article} />
    </PublicLayout>
  );
}
