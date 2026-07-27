import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPostMeta {
  slug: string;
  title: string;
  subtitle?: string;
  publishedAt: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  featuredImage: string;
  excerpt: string;
  featured?: boolean;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR);
  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    if (file.endsWith(".mdx") || file.endsWith(".md")) {
      const slug = file.replace(/\.mdx?$/, "");
      const fullPath = path.join(CONTENT_DIR, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const readStats = readingTime(content);

      posts.push({
        slug,
        title: data.title || slug,
        subtitle: data.subtitle || "",
        publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
        author: data.author || "Founder",
        authorRole: data.authorRole || "Founder & CEO, SwasthAI",
        authorAvatar: data.authorAvatar || "/img/logo-white.png",
        category: data.category || "Clinic Workflow",
        tags: data.tags || ["Clinic Workflow"],
        featuredImage: data.featuredImage || "/img/screenshots/hero_overview.png",
        excerpt: data.excerpt || "",
        featured: Boolean(data.featured),
        readingTime: readStats.text,
      });
    }
  }

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  const fullPath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!fullPath) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const readStats = readingTime(content);

  return {
    slug,
    title: data.title || slug,
    subtitle: data.subtitle || "",
    publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
    author: data.author || "Founder",
    authorRole: data.authorRole || "Founder & CEO, SwasthAI",
    authorAvatar: data.authorAvatar || "/img/logo-white.png",
    category: data.category || "Clinic Workflow",
    tags: data.tags || ["Clinic Workflow"],
    featuredImage: data.featuredImage || "/img/screenshots/hero_overview.png",
    excerpt: data.excerpt || "",
    featured: Boolean(data.featured),
    readingTime: readStats.text,
    content,
  };
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);
  const sameCat = all.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  const otherCat = all.filter((p) => p.category.toLowerCase() !== category.toLowerCase());
  return [...sameCat, ...otherCat].slice(0, limit);
}

export function getAllCategories(): { name: string; slug: string; count: number }[] {
  const posts = getAllPosts();
  const catMap = new Map<string, number>();

  for (const post of posts) {
    const cat = post.category;
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  }

  return Array.from(catMap.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    count,
  }));
}

export function extractTableOfContents(content: string): TOCItem[] {
  const headingLines = content.split("\n").filter((line) => line.match(/^#{2,3}\s+/));

  return headingLines.map((line) => {
    const level = line.startsWith("###") ? 3 : 2;
    const text = line.replace(/^#{2,3}\s+/, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return { id, text, level };
  });
}
