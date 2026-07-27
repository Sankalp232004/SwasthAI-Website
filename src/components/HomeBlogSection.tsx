import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/mdx";
import BlogCard from "@/components/blog/BlogCard";

export default function HomeBlogSection() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Knowledge Hub & Insights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
              Latest Clinic Workflow Insights
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              Practical guides, OPD queue strategies, and healthcare software architecture for doctors and practice managers.
            </p>
          </div>

          <Link
            href="/blog"
            className="px-5 py-3 rounded-xl bg-[#0F2C59] hover:bg-[#07162C] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
          >
            <span>Explore All Blog Articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
