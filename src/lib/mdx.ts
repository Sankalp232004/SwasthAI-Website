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

export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}

function getContentDir(): string | null {
  const cwd = process.cwd();
  const possiblePaths = [
    path.join(cwd, "content/blog"),
    path.join(cwd, "website/content/blog"),
    path.join(__dirname, "../../../content/blog"),
    path.join(__dirname, "../../content/blog"),
    path.join(__dirname, "../content/blog"),
    path.resolve("content/blog"),
    path.resolve("website/content/blog")
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p) && fs.readdirSync(p).length > 0) {
        return p;
      }
    } catch {
      // Continue searching
    }
  }
  return null;
}

export function getAllPosts(): BlogPostMeta[] {
  const contentDir = getContentDir();
  if (!contentDir) {
    return [];
  }

  try {
    const files = fs.readdirSync(contentDir);
    const posts: BlogPostMeta[] = [];

    for (const file of files) {
      if (file.endsWith(".mdx") || file.endsWith(".md")) {
        const slug = file.replace(/\.mdx?$/, "");
        const fullPath = path.join(contentDir, file);
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
  } catch (err) {
    console.error("Error reading blog posts in getAllPosts():", err);
    return [];
  }
}

export function getAllCategories(): CategoryInfo[] {
  const posts = getAllPosts();
  const categoryMap = new Map<string, number>();

  posts.forEach((post) => {
    const cat = post.category || "General";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });

  const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    count,
  }));

  return [
    { name: "All Topics", slug: "all", count: posts.length },
    ...categories,
  ];
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const contentDir = getContentDir();
  if (!contentDir) return null;

  try {
    const mdxPath = path.join(contentDir, `${slug}.mdx`);
    const mdPath = path.join(contentDir, `${slug}.md`);
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
  } catch (err) {
    console.error(`Error reading blog post for slug "${slug}":`, err);
    return null;
  }
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPostMeta[] {
  const allPosts = getAllPosts();
  return allPosts
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      if (a.category === category && b.category !== category) return -1;
      if (b.category === category && a.category !== category) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, limit);
}

export function extractTableOfContents(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    items.push({ id, text, level });
  }

  return items;
}
