import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts, getRelatedPosts, extractTableOfContents } from "@/lib/mdx";
import Callout from "@/components/blog/Callout";
import {
  HeroWorkflowVisual,
  NationalMilestoneVisual,
  InformationGapVisual,
  SwasthAIWorkflowVisual,
  MidArticleCTA
} from "@/components/blog/ArticleVisuals";
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
  HeroWorkflowVisual,
  NationalMilestoneVisual,
  InformationGapVisual,
  SwasthAIWorkflowVisual,
  MidArticleCTA,
  h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return (
      <div className="relative group mt-12 mb-5">
        <h2 id={id} className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight scroll-mt-28 flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-teal-500 to-[#0F2C59] inline-block shrink-0"></span>
          <span>{children}</span>
        </h2>
      </div>
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
    <p className="text-slate-700 leading-relaxed text-base sm:text-lg mb-6 tracking-normal">
      {children}
    </p>
  ),
  blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-teal-50/60 border-l-4 border-teal-500 text-[#0F2C59] italic text-base sm:text-lg font-medium shadow-xs relative">
      <div className="relative z-10">{children}</div>
    </blockquote>
  ),
  ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="space-y-3 my-6 list-disc list-inside text-slate-700 text-base sm:text-lg pl-1">
      {children}
    </ul>
  ),
  ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="space-y-3 my-6 list-decimal list-inside text-slate-700 text-base sm:text-lg pl-1">
      {children}
    </ol>
  ),
  li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed">{children}</li>
  ),
  table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200/90 shadow-md bg-white">
      <table className="w-full text-left text-xs sm:text-sm text-slate-700 divide-y divide-slate-200">
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
    <th className="p-4 font-extrabold tracking-wider">{children}</th>
  ),
  td: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="p-4 border-t border-slate-100/90 leading-relaxed">{children}</td>
  ),
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-7 p-5 sm:p-6 rounded-2xl bg-[#07162C] text-teal-300 font-mono text-xs sm:text-sm overflow-x-auto border border-teal-500/20 shadow-xl">
      {children}
    </pre>
  ),
  code: ({ children }: React.HTMLAttributes<HTMLElement>) => (
    <code className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 font-mono text-xs sm:text-sm font-semibold border border-teal-200/60">
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

  const categorySlug = post.category.toLowerCase().replace(/\s+/g, "-");
  const authorSlug = post.author.toLowerCase().replace(/\s+/g, "-");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_CONFIG.url}/blog/${slug}#article`,
        isPartOf: {
          "@type": "WebPage",
          "@id": `${SITE_CONFIG.url}/blog/${slug}`,
        },
        headline: post.title,
        alternativeHeadline: post.subtitle || undefined,
        description: post.excerpt,
        image: `${SITE_CONFIG.url}${post.featuredImage}`,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        inLanguage: "en-IN",
        keywords: post.tags?.join(", "),
        articleSection: post.category,
        author: {
          "@type": "Person",
          name: post.author,
          jobTitle: post.authorRole,
          url: `${SITE_CONFIG.url}/blog/author/${authorSlug}`,
        },
        publisher: {
          "@type": "Organization",
          name: "SwasthAI",
          url: SITE_CONFIG.url,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_CONFIG.url}/img/logo-dark.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_CONFIG.url}/blog/${slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_CONFIG.url}/blog/${slug}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_CONFIG.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_CONFIG.url}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.category,
            item: `${SITE_CONFIG.url}/blog/category/${categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: post.title,
            item: `${SITE_CONFIG.url}/blog/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-white">
      <ReadingProgressBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header Banner */}
      <section className="bg-gradient-to-br from-[#0F2C59] via-[#12366A] to-[#07162C] text-white py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
        {/* Subtle Radial Glow Backdrops */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.category, href: `/blog/category/${categorySlug}` },
              { label: post.title },
            ]}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/blog/category/${categorySlug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30 hover:bg-teal-500/30 transition-all shadow-xs"
              >
                <span>{post.category}</span>
              </Link>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium border border-white/10">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>{post.readingTime}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal pt-1">
                {post.subtitle}
              </p>
            )}
          </div>

          {/* Author & Published Metadata Bar */}
          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-300">
            <Link href={`/blog/author/${authorSlug}`} className="flex items-center space-x-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center justify-center font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white group-hover:text-teal-300 transition-colors text-sm">
                    {post.author}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                </div>
                <span className="block text-xs text-slate-400">{post.authorRole}</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4 text-xs sm:text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-teal-400" />
                {post.publishedAt}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950 group">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                priority
              />
            </div>

            {/* Social Share & Engagement Bar */}
            <div className="py-4 px-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between flex-wrap gap-4 shadow-xs">
              <span className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">Share this article:</span>
              <ShareButtons title={post.title} slug={slug} />
            </div>

            {/* Rendered MDX Content */}
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-teal-700 prose-a:font-semibold prose-a:underline hover:prose-a:text-teal-900">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* Soft Demo Booking CTA */}
            <ArticleFooterCTA />

            {/* Previous / Next Article Navigation */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/90 text-left transition-all space-y-1.5 group shadow-xs hover:border-teal-500/40"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-700 uppercase tracking-widest flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Previous Article
                  </span>
                  <span className="block text-sm font-bold text-[#0F2C59] group-hover:text-teal-800 transition-colors line-clamp-2">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/90 text-right transition-all space-y-1.5 group sm:col-start-2 shadow-xs hover:border-teal-500/40"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-teal-700 uppercase tracking-widest flex items-center justify-end gap-1">
                    Next Article
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="block text-sm font-bold text-[#0F2C59] group-hover:text-teal-800 transition-colors line-clamp-2">
                    {nextPost.title}
                  </span>
                </Link>
              ) : <div />}
            </div>

          </article>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-8">
              <TableOfContents toc={toc} />

              {/* Author Profile Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0F2C59] text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#0F2C59]">{post.author}</h4>
                    <span className="block text-xs text-teal-700 font-semibold">{post.authorRole}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Building intelligent, accessible workflow technology for healthcare providers across India.
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <Link
                    href={`/blog/author/${authorSlug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
                  >
                    <span>View all articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <a
                    href="https://wa.me/919140721395?text=Hi%20Sankalp,%20I%20read%20your%20blog%20post%20and%20would%20like%20to%20connect."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#25D366] hover:underline"
                  >
                    <span>Connect</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-16 mt-16 border-t border-slate-200 space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Continue Reading</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">Related Articles & Case Studies</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
