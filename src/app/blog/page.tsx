import React from "react";
import type { Metadata } from "next";
import { getAllPosts, getAllCategories } from "@/lib/mdx";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogCard from "@/components/blog/BlogCard";
import NewsletterBox from "@/components/blog/NewsletterBox";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import { BookOpen, Sparkles, Rss } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Blog & Healthcare Workflow Insights | SwasthAI",
  description: "Practical guides, OPD intake strategies, and healthcare technology insights for clinic owners, GPs, and medical practice managers across India.",
  openGraph: {
    title: "Blog & Healthcare Workflow Insights | SwasthAI",
    description: "Practical guides, OPD intake strategies, and healthcare technology insights for clinic owners, GPs, and medical practice managers across India.",
    url: `${SITE_CONFIG.url}/blog`,
    siteName: "SwasthAI",
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.url}/img/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SwasthAI Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Healthcare Workflow Insights | SwasthAI",
    description: "Practical guides, OPD intake strategies, and healthcare technology insights for clinic owners, GPs, and medical practice managers across India.",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const featuredPost = posts.find((p) => p.featured) || posts[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SwasthAI Healthcare & Clinic Workflow Blog",
    description: "Practical guides, OPD intake strategies, and healthcare technology insights for clinic owners across India.",
    url: `${SITE_CONFIG.url}/blog`,
    publisher: {
      "@type": "Organization",
      name: "SwasthAI",
      logo: `${SITE_CONFIG.url}/img/logo-dark.png`,
    },
  };

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="bg-[#0F2C59] text-white py-16 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Breadcrumbs items={[{ label: "Blog" }]} />

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
              <BookOpen className="w-4 h-4 text-teal-300" />
              <span>SwasthAI Knowledge Hub</span>
            </div>

            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 hover:text-white text-xs font-bold border border-orange-500/30 transition-colors"
              title="Subscribe to RSS Feed"
            >
              <Rss className="w-3.5 h-3.5" />
              <span>RSS</span>
            </a>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Clinic Workflow & Healthcare <span className="text-teal-400">Insights</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
              Practical guides on OPD queue management, waiting room psychology, and offline-first healthcare software for Indian clinics.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* Featured Article Section */}
        {featuredPost && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Spotlight Article</span>
            </div>
            <BlogCard post={featuredPost} featured={true} />
          </div>
        )}

        {/* Search & Category Filter Section */}
        <BlogSearch posts={posts} categories={categories} />

        {/* Newsletter Subscription Card */}
        <NewsletterBox />
      </div>
    </div>
  );
}
