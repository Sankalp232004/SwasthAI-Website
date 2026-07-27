import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/mdx";
import BlogCard from "@/components/blog/BlogCard";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import NewsletterBox from "@/components/blog/NewsletterBox";
import { User, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface PageParams {
  params: Promise<{ author: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  const authors = Array.from(new Set(posts.map((p) => p.author.toLowerCase().replace(/\s+/g, "-"))));
  return authors.map((author) => ({ author }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { author } = await params;
  const posts = getAllPosts();
  const matched = posts.find((p) => p.author.toLowerCase().replace(/\s+/g, "-") === author);

  const authorName = matched ? matched.author : "Founder";

  return {
    title: `Articles by ${authorName} | SwasthAI Blog`,
    description: `Read all healthcare workflow and clinic management articles written by ${authorName} on SwasthAI.`,
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/author/${author}`,
    },
  };
}

export default async function AuthorPage({ params }: PageParams) {
  const { author } = await params;
  const posts = getAllPosts();
  const authorPosts = posts.filter(
    (p) => p.author.toLowerCase().replace(/\s+/g, "-") === author
  );

  if (authorPosts.length === 0) {
    notFound();
  }

  const firstPost = authorPosts[0];

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-white">
      <section className="bg-[#0F2C59] text-white py-14 sm:py-18 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: `Author: ${firstPost.author}` },
            ]}
          />

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 border-2 border-teal-400/40 flex items-center justify-center font-extrabold text-2xl">
              {firstPost.author.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {firstPost.author}
                </h1>
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <span className="block text-xs sm:text-sm text-teal-300 font-semibold">
                {firstPost.authorRole}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Building intelligent, accessible workflow technology for healthcare providers across India. Writing about OPD triage, reception workflows, and offline-first software architecture.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-[#0F2C59]">
            Articles Published by {firstPost.author} ({authorPosts.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {authorPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <NewsletterBox />
      </div>
    </div>
  );
}
