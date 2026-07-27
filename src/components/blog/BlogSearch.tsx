"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Tag } from "lucide-react";
import { BlogPostMeta } from "@/lib/mdx";
import BlogCard from "./BlogCard";

interface BlogSearchProps {
  posts: BlogPostMeta[];
  categories: { name: string; slug: string; count: number }[];
}

export default function BlogSearch({ posts, categories }: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = query.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesQuery =
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [posts, query, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search Bar & Category Tabs Container */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Search Input Box (Pagefind compatible) */}
        <div className="relative max-w-2xl mx-auto" id="search">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles by title, topic, or keyword..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-xs"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#0F2C59] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            All Articles ({posts.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? "bg-[#0F2C59] text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {(query || selectedCategory !== "all") && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
          <span>
            Found {filteredPosts.length} article{filteredPosts.length === 1 ? "" : "s"}
            {query && ` matching "${query}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </span>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCategory("all");
            }}
            className="text-teal-700 hover:underline font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Grid of Filtered Posts */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#0F2C59]">No articles found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or category filter.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCategory("all");
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
