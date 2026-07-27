import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts, getRelatedPosts, extractTableOfContents } from "@/lib/mdx";
import Callout from "@/components/blog/Callout";
import TableOfContents from "@/components/blog/TableOfContents";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import ShareButtons from "@/components/blog/ShareButtons";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import ArticleFooterCTA from "@/components/blog/ArticleFooterCTA";
import BlogCard from "@/components/blog/BlogCard";
import { Clock, Calendar, ArrowLeft, ArrowRight, User } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found | SwasthAI" };
  }

  const url = `${SITE_CONFIG.url}/blog/${slug}`;

  return {
    title: `${post.title} | SwasthAI Blog`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    category: post.category,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "SwasthAI",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: `${SITE_CONFIG.url}${post.featuredImage}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${SITE_CONFIG.url}${post.featuredImage}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

const mdxComponents = {
  Callout,
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return (
      <h2 id={id} className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mt-10 mb-4 scroll-mt-28">
        {children}
      </h2>
    );
  },
  h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return (
      <h3 id={id} className="text-xl sm:text-2xl font-bold text-[#0F2C59] tracking-tight mt-8 mb-3 scroll-mt-28">
        {children}
      </h3>
    );
  },
  p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-700 leading-relaxed text-base sm:text-lg mb-6">
      {children}
    </p>
  ),
  blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-8 p-6 rounded-2xl bg-teal-50/60 border-l-4 border-teal-500 text-teal-950 italic text-base sm:text-lg font-medium shadow-xs">
      {children}
    </blockquote>
  ),
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="space-y-2.5 my-6 list-disc list-inside text-slate-700 text-base sm:text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="space-y-2.5 my-6 list-decimal list-inside text-slate-700 text-base sm:text-lg">
      {children}
    </ol>
  ),
  li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed">{children}</li>
  ),
  table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
      <table className="w-full text-left text-xs sm:text-sm text-slate-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[#0F2C59] text-white uppercase text-[11px] font-bold tracking-wider">
      {children}
    </thead>
  ),
  th: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="p-3.5 sm:p-4">{children}</th>
  ),
  td: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="p-3.5 sm:p-4 border-t border-slate-200">{children}</td>
  ),
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-6 p-4 sm:p-5 rounded-2xl bg-[#07162C] text-teal-300 font-mono text-xs sm:text-sm overflow-x-auto border border-white/10 shadow-lg">
      {children}
    </pre>
  ),
  code: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-teal-800 font-mono text-xs sm:text-sm font-semibold border border-slate-200">
      {children}
    </code>
  ),
};

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const relatedPosts = getRelatedPosts(slug, post.category);
  const toc = extractTableOfContents(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${SITE_CONFIG.url}${post.featuredImage}`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "SwasthAI",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/img/logo-dark.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/blog/${slug}`,
    },
  };

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-white">
      <ReadingProgressBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <section className="bg-[#0F2C59] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.category, href: `/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}` },
              { label: post.title },
            ]}
          />

          <div className="space-y-4">
            <Link
              href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30 hover:bg-teal-500/30 transition-colors"
            >
              {post.category}
            </Link>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-base sm:text-xl text-slate-300 leading-relaxed">
                {post.subtitle}
              </p>
            )}
          </div>

          {/* Metadata Row */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-300">
            <Link href={`/blog/author/${post.author.toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center font-bold text-sm">
                {post.author.charAt(0)}
              </div>
              <div>
                <span className="block font-bold text-white group-hover:text-teal-300 transition-colors">
                  {post.author}
                </span>
                <span className="block text-xs text-slate-400">{post.authorRole}</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" />
                {post.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                {post.readingTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-950">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Share Buttons Row */}
            <div className="py-4 border-y border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <ShareButtons title={post.title} slug={slug} />
            </div>

            {/* Rendered MDX Content */}
            <div className="prose prose-slate max-w-none">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* Soft Demo Booking CTA */}
            <ArticleFooterCTA />

            {/* Previous / Next Article Navigation */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all space-y-1 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Previous Article
                  </span>
                  <span className="block text-xs font-bold text-[#0F2C59] group-hover:text-teal-700 transition-colors line-clamp-1">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-right transition-all space-y-1 group sm:col-start-2"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
                    Next Article
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="block text-xs font-bold text-[#0F2C59] group-hover:text-teal-700 transition-colors line-clamp-1">
                    {nextPost.title}
                  </span>
                </Link>
              ) : <div />}
            </div>

          </article>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8">
            <TableOfContents toc={toc} />

            {/* Author Profile Sidebar Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-white flex items-center justify-center font-extrabold text-xl">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F2C59]">{post.author}</h4>
                  <span className="block text-xs text-teal-700 font-medium">{post.authorRole}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Building intelligent, accessible workflow technology for healthcare providers across India.
              </p>
              <Link
                href={`/blog/author/${post.author.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-block text-xs font-bold text-teal-700 hover:underline"
              >
                View Author Articles →
              </Link>
            </div>
          </aside>

        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-16 border-t border-slate-200 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Explore Related Topics</span>
              <h3 className="text-2xl font-extrabold text-[#0F2C59]">Related Articles</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <BlogCard key={rPost.slug} post={rPost} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
