import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryScreen } from "@/components/category-screen";
import { PageTransition } from "@/components/page-transition";
import { CATEGORIES, CATEGORY_SLUGS, isCategorySlug } from "@/config/categories";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCategorySlug(slug)) return {};
  return {
    title: CATEGORIES[slug].label,
    description: CATEGORIES[slug].description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isCategorySlug(slug)) notFound();
  return (
    <PageTransition>
      <CategoryScreen slug={slug} />
    </PageTransition>
  );
}
