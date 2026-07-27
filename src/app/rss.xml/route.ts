import { generateRssFeed } from "@/lib/rss";

export const dynamic = "force-static";

export async function GET() {
  const rss = generateRssFeed();
  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
