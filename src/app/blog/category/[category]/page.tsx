import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getAllCategories } from "@/lib/mdx";
import BlogCard from "@/components/blog/BlogCard";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import NewsletterBox from "@/components/blog/NewsletterBox";
import { Tag } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface PageParams {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { category } = await params;
  const categories = getAllCategories();
  const catObj = categories.find((c) => c.slug === category);

  if (!catObj) {
    return { title: "Category Not Found | SwasthAI Blog" };
  }

  return {
    title: `${catObj.name} Articles | SwasthAI Blog`,
    description: `Browse all articles, case studies, and insights related to ${catObj.name} on the SwasthAI blog.`,
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/category/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: PageParams) {
  const { category } = await params;
  const categories = getAllCategories();
  const catObj = categories.find((c) => c.slug === category);

  if (!catObj) {
    notFound();
  }

  const posts = getAllPosts().filter(
    (p) => p.category.toLowerCase().replace(/\s+/g, "-") === category
  );

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-white">
      <section className="bg-[#0F2C59] text-white py-14 sm:py-18 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: catObj.name },
            ]}
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
            <Tag className="w-3.5 h-3.5" />
            <span>Category Archive</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {catObj.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            Showing {posts.length} article{posts.length === 1 ? "" : "s"} under this topic.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <NewsletterBox />
      </div>
    </div>
  );
}
