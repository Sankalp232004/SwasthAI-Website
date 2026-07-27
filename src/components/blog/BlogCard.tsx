import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowUpRight, Tag } from "lucide-react";
import { BlogPostMeta } from "@/lib/mdx";

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  if (featured) {
    return (
      <div className="group bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl hover:border-teal-500/40 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto bg-slate-950 overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-teal-500/90 backdrop-blur-md text-white font-extrabold text-xs tracking-wider uppercase shadow-md">
              Featured Article
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-teal-300 font-semibold">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/10">
                {post.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>

            <Link href={`/blog/${post.slug}`} className="block group-hover:text-teal-300 transition-colors">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                {post.title}
              </h2>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center font-bold text-xs">
                {post.author.charAt(0)}
              </div>
              <div>
                <span className="block text-xs font-bold text-white">{post.author}</span>
                <span className="block text-[10px] text-slate-400">{post.publishedAt}</span>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="w-9 h-9 rounded-full bg-teal-500/20 group-hover:bg-teal-500 text-teal-300 group-hover:text-white flex items-center justify-center transition-all shadow-sm"
              title="Read full article"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#0F2C59]/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {post.readingTime}
            </span>
          </div>

          <Link href={`/blog/${post.slug}`} className="block group-hover:text-teal-700 transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-[#0F2C59] leading-snug line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
        <div className="flex items-center space-x-2 pt-3">
          <div className="w-7 h-7 rounded-full bg-[#0F2C59] text-white flex items-center justify-center font-bold text-[10px]">
            {post.author.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-slate-700">{post.author}</span>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="text-xs font-bold text-teal-700 group-hover:text-teal-800 flex items-center gap-0.5 pt-3"
        >
          <span>Read</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
