import fs from "fs";
import path from "path";
import {
  AnalyticsEventPayload,
  AnalyticsSummary,
  ArticleMetrics,
  ContentExperiment,
  FunnelStep,
  SearchQueryMetric,
  SourcePerformance,
  TrafficSourceCategory,
  WeeklyReportData
} from "./types";
import { getAllPosts } from "../mdx";
import {
  calculateBlogTractionScore,
  classifyOpportunity,
  computeArticleQualityScore,
  determineAudience
} from "./scoring";

// Storage paths for local/serverless fallback
const STORAGE_FILE = path.join(process.cwd(), ".analytics_store.json");
const GSC_STORAGE_FILE = path.join(process.cwd(), ".analytics_gsc.json");
const EXPERIMENTS_FILE = path.join(process.cwd(), ".analytics_experiments.json");

interface LocalStoreData {
  events: AnalyticsEventPayload[];
  lastUpdated: string;
}

// In-memory fallback if file system is read-only (e.g. standard Vercel serverless edge)
let memoryEvents: AnalyticsEventPayload[] = [];
let memoryGsc: SearchQueryMetric[] = [];
let memoryExperiments: ContentExperiment[] = [];

// Helper to check Supabase config
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return { url, key };
  }
  return null;
}

// Read raw events
export async function getStoredEvents(): Promise<AnalyticsEventPayload[]> {
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const res = await fetch(`${supabase.url}/rest/v1/analytics_events?select=*&order=timestamp.desc&limit=5000`, {
        headers: {
          apikey: supabase.key,
          Authorization: `Bearer ${supabase.key}`
        },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        return data as AnalyticsEventPayload[];
      }
    } catch {
      // Fallback to local
    }
  }

  // Local file / memory fallback
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed: LocalStoreData = JSON.parse(raw);
      return parsed.events || [];
    }
  } catch {
    // Fall back to memory
  }

  return memoryEvents;
}

// Save raw event(s)
export async function saveAnalyticsEvents(events: AnalyticsEventPayload[]): Promise<boolean> {
  const enrichedEvents = events.map((e) => ({
    ...e,
    id: e.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: e.timestamp || new Date().toISOString()
  }));

  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const res = await fetch(`${supabase.url}/rest/v1/analytics_events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabase.key,
          Authorization: `Bearer ${supabase.key}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify(enrichedEvents)
      });
      if (res.ok) return true;
    } catch {
      // Fallback to local
    }
  }

  // Local storage write
  try {
    let existing: AnalyticsEventPayload[] = [];
    if (fs.existsSync(STORAGE_FILE)) {
      try {
        const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
        const parsed: LocalStoreData = JSON.parse(raw);
        existing = parsed.events || [];
      } catch {
        existing = [];
      }
    } else {
      existing = [...memoryEvents];
    }

    // Keep last 10,000 events to prevent unbounded growth
    const updated = [...enrichedEvents, ...existing].slice(0, 10000);
    memoryEvents = updated;

    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify({ events: updated, lastUpdated: new Date().toISOString() }, null, 2));
    } catch {
      // Serverless environments might not permit disk write; in-memory fallback maintains state
    }
    return true;
  } catch {
    memoryEvents = [...enrichedEvents, ...memoryEvents].slice(0, 10000);
    return true;
  }
}

// GSC Data getter/setter
export async function getGSCMetrics(): Promise<SearchQueryMetric[]> {
  try {
    if (fs.existsSync(GSC_STORAGE_FILE)) {
      const raw = fs.readFileSync(GSC_STORAGE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return memoryGsc;
}

export async function saveGSCMetrics(metrics: SearchQueryMetric[]): Promise<boolean> {
  memoryGsc = metrics;
  try {
    fs.writeFileSync(GSC_STORAGE_FILE, JSON.stringify(metrics, null, 2));
    return true;
  } catch {
    return true;
  }
}

// Experiments getter/setter
export async function getExperiments(): Promise<ContentExperiment[]> {
  try {
    if (fs.existsSync(EXPERIMENTS_FILE)) {
      const raw = fs.readFileSync(EXPERIMENTS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return memoryExperiments;
}

export async function saveExperiment(experiment: ContentExperiment): Promise<boolean> {
  try {
    const list = await getExperiments();
    const updated = [experiment, ...list.filter((x) => x.id !== experiment.id)];
    memoryExperiments = updated;
    fs.writeFileSync(EXPERIMENTS_FILE, JSON.stringify(updated, null, 2));
    return true;
  } catch {
    memoryExperiments = [experiment, ...memoryExperiments];
    return true;
  }
}

// Analytics Aggregator
export async function getAnalyticsSummary(period: "7d" | "30d" | "90d" | "all" = "30d"): Promise<AnalyticsSummary> {
  const allEvents = await getStoredEvents();
  const gscQueries = await getGSCMetrics();
  const experiments = await getExperiments();
  const posts = getAllPosts();

  // Filter events by period
  const now = new Date().getTime();
  const daysLimit = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 3650;
  const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

  const events = allEvents.filter((e) => {
    if (!e.timestamp) return true;
    return new Date(e.timestamp).getTime() >= cutoff;
  });

  const hasRealData = events.length > 0;

  // Basic Metrics
  const uniqueVisitorsSet = new Set<string>();
  const engagedVisitorsSet = new Set<string>();
  const returningVisitorsSet = new Set<string>();
  const blogVisitorsSet = new Set<string>();

  let pageViews = 0;
  let demoRequests = 0;
  let trialRequests = 0;
  let emailClicks = 0;
  let phoneClicks = 0;

  // Article mapping accumulator
  const articleMap = new Map<string, {
    views: number;
    visitors: Set<string>;
    returning: Set<string>;
    activeSecondsSum: number;
    activeSecondsCount: number;
    scroll25: number;
    scroll50: number;
    scroll75: number;
    scroll90: number;
    completeReads: number;
    ctaViews: number;
    ctaClicks: number;
    demoClicks: number;
    contactClicks: number;
  }>();

  // Source performance accumulator
  const sourceMap = new Map<TrafficSourceCategory, {
    visitors: Set<string>;
    engaged: Set<string>;
    blogVisitors: Set<string>;
    demoClicks: number;
    conversions: number;
  }>();

  const allSources: TrafficSourceCategory[] = [
    "Organic Search",
    "Direct",
    "LinkedIn",
    "WhatsApp",
    "Email",
    "Medium",
    "Referral",
    "Social",
    "Other"
  ];

  for (const src of allSources) {
    sourceMap.set(src, {
      visitors: new Set(),
      engaged: new Set(),
      blogVisitors: new Set(),
      demoClicks: 0,
      conversions: 0
    });
  }

  // Process Events
  for (const e of events) {
    if (e.visitorId) {
      uniqueVisitorsSet.add(e.visitorId);
      if (e.isReturningVisitor) {
        returningVisitorsSet.add(e.visitorId);
      }
    }

    const src = e.trafficSource || "Direct";
    const srcObj = sourceMap.get(src) || sourceMap.get("Other")!;
    if (e.visitorId) srcObj.visitors.add(e.visitorId);

    if (e.eventType === "page_view" || e.eventType === "blog_view") {
      pageViews++;
    }

    if (e.path.startsWith("/blog") || e.articleSlug) {
      if (e.visitorId) {
        blogVisitorsSet.add(e.visitorId);
        srcObj.blogVisitors.add(e.visitorId);
      }
    }

    if (e.activeSeconds && e.activeSeconds > 30) {
      if (e.visitorId) {
        engagedVisitorsSet.add(e.visitorId);
        srcObj.engaged.add(e.visitorId);
      }
    }

    if (e.eventType === "cta_click" || (e.ctaText && e.ctaText.toLowerCase().includes("demo"))) {
      demoRequests++;
      srcObj.demoClicks++;
      srcObj.conversions++;
    }

    if (e.eventType === "trial_click") {
      trialRequests++;
      srcObj.conversions++;
    }

    if (e.eventType === "email_click") {
      emailClicks++;
      srcObj.conversions++;
    }

    if (e.eventType === "phone_click") {
      phoneClicks++;
      srcObj.conversions++;
    }

    if (e.eventType === "contact_form_submit") {
      srcObj.conversions++;
    }

    // Per article stats
    const slug = e.articleSlug || (e.path.startsWith("/blog/") ? e.path.replace("/blog/", "").split("?")[0].split("#")[0] : null);
    if (slug && slug !== "" && !slug.includes("category") && !slug.includes("author")) {
      if (!articleMap.has(slug)) {
        articleMap.set(slug, {
          views: 0,
          visitors: new Set(),
          returning: new Set(),
          activeSecondsSum: 0,
          activeSecondsCount: 0,
          scroll25: 0,
          scroll50: 0,
          scroll75: 0,
          scroll90: 0,
          completeReads: 0,
          ctaViews: 0,
          ctaClicks: 0,
          demoClicks: 0,
          contactClicks: 0
        });
      }

      const a = articleMap.get(slug)!;
      if (e.eventType === "blog_view" || e.eventType === "page_view") {
        a.views++;
      }
      if (e.visitorId) {
        a.visitors.add(e.visitorId);
        if (e.isReturningVisitor) a.returning.add(e.visitorId);
      }

      if (e.activeSeconds && e.activeSeconds > 0) {
        a.activeSecondsSum += e.activeSeconds;
        a.activeSecondsCount++;
      }

      if (e.eventType === "blog_scroll_25") a.scroll25++;
      if (e.eventType === "blog_scroll_50") a.scroll50++;
      if (e.eventType === "blog_scroll_75") a.scroll75++;
      if (e.eventType === "blog_scroll_90") a.scroll90++;
      if (e.eventType === "blog_complete_read") a.completeReads++;
      if (e.eventType === "cta_view") a.ctaViews++;
      if (e.eventType === "cta_click") {
        a.ctaClicks++;
        if (e.destinationUrl?.includes("wa.me") || e.ctaText?.toLowerCase().includes("demo")) {
          a.demoClicks++;
        }
      }
      if (e.eventType === "contact_form_submit" || e.eventType === "contact_form_start") {
        a.contactClicks++;
      }
    }
  }

  // Compute Article Metrics
  const articles: ArticleMetrics[] = posts.map((post) => {
    const raw = articleMap.get(post.slug) || {
      views: 0,
      visitors: new Set(),
      returning: new Set(),
      activeSecondsSum: 0,
      activeSecondsCount: 0,
      scroll25: 0,
      scroll50: 0,
      scroll75: 0,
      scroll90: 0,
      completeReads: 0,
      ctaViews: 0,
      ctaClicks: 0,
      demoClicks: 0,
      contactClicks: 0
    };

    const views = raw.views;
    const uniqueVisitors = raw.visitors.size;
    const returningVisitors = raw.returning.size;
    const avgActiveSeconds = raw.activeSecondsCount > 0 ? Math.round(raw.activeSecondsSum / raw.activeSecondsCount) : 0;
    const ctaCtr = views > 0 ? Number(((raw.ctaClicks / views) * 100).toFixed(1)) : 0;

    // Connect Search Console metrics if present
    const matchingGsc = gscQueries.filter((q) => q.page?.includes(post.slug));
    const searchImpressions = matchingGsc.reduce((acc, curr) => acc + curr.impressions, 0);
    const searchClicks = matchingGsc.reduce((acc, curr) => acc + curr.clicks, 0);
    const searchCtr = searchImpressions > 0 ? Number(((searchClicks / searchImpressions) * 100).toFixed(1)) : 0;
    const avgSearchPosition = matchingGsc.length > 0 ? Number((matchingGsc.reduce((a, c) => a + c.position, 0) / matchingGsc.length).toFixed(1)) : 0;

    const audience = determineAudience(post.category, post.tags);
    const readingTimeMinutes = parseInt(post.readingTime) || 5;

    const blogTractionScore = calculateBlogTractionScore(
      views,
      avgActiveSeconds,
      searchClicks,
      raw.ctaClicks,
      ctaCtr,
      returningVisitors
    );

    const qualityScore = computeArticleQualityScore(
      views,
      avgActiveSeconds,
      raw.scroll90,
      searchImpressions,
      searchClicks,
      searchCtr,
      raw.ctaClicks,
      raw.demoClicks
    );

    const { opportunityCategory, matrixPosition, recommendations } = classifyOpportunity(
      views,
      avgActiveSeconds,
      searchImpressions,
      searchCtr,
      ctaCtr,
      raw.demoClicks
    );

    return {
      slug: post.slug,
      title: post.title,
      publishedAt: post.publishedAt,
      contentPillar: post.category,
      author: post.author,
      audience,
      readingTimeMinutes,
      views,
      uniqueVisitors,
      returningVisitors,
      avgActiveSeconds,
      scroll25: raw.scroll25,
      scroll50: raw.scroll50,
      scroll75: raw.scroll75,
      scroll90: raw.scroll90,
      completeReads: raw.completeReads,
      ctaViews: raw.ctaViews,
      ctaClicks: raw.ctaClicks,
      ctaCtr,
      demoClicks: raw.demoClicks,
      contactClicks: raw.contactClicks,
      searchImpressions,
      searchClicks,
      searchCtr,
      avgSearchPosition,
      blogTractionScore,
      qualityScore,
      opportunityCategory,
      matrixPosition,
      recommendations,
      trend: "STABLE"
    };
  });

  // Sort articles by Blog Traction Score descending
  articles.sort((a, b) => b.blogTractionScore - a.blogTractionScore || b.views - a.views);

  // Compute Sources
  const sources: SourcePerformance[] = allSources.map((src) => {
    const s = sourceMap.get(src)!;
    const vCount = s.visitors.size;
    const demoRate = vCount > 0 ? Number(((s.demoClicks / vCount) * 100).toFixed(1)) : 0;
    return {
      source: src,
      visitors: vCount,
      engagedVisitors: s.engaged.size,
      blogVisitors: s.blogVisitors.size,
      demoClicks: s.demoClicks,
      conversions: s.conversions,
      demoRate
    };
  });

  sources.sort((a, b) => b.visitors - a.visitors);

  // Funnel
  const blogVisitorsCount = blogVisitorsSet.size;
  const engagedReadersCount = engagedVisitorsSet.size;
  const totalCtaViews = articles.reduce((sum, a) => sum + a.ctaViews, 0);
  const totalCtaClicks = articles.reduce((sum, a) => sum + a.ctaClicks, 0);
  const totalDemoClicks = demoRequests;
  const totalContactSubmits = events.filter((e) => e.eventType === "contact_form_submit").length;
  const totalTrials = trialRequests;

  const funnelBase = uniqueVisitorsSet.size || 1;

  const funnel: FunnelStep[] = [
    {
      name: "Website Visitors",
      key: "visitors",
      count: uniqueVisitorsSet.size,
      percentageFromPrevious: 100,
      percentageFromTop: 100
    },
    {
      name: "Engaged Readers (>30s active)",
      key: "engaged_readers",
      count: engagedReadersCount,
      percentageFromPrevious: uniqueVisitorsSet.size > 0 ? Number(((engagedReadersCount / uniqueVisitorsSet.size) * 100).toFixed(1)) : 0,
      percentageFromTop: Number(((engagedReadersCount / funnelBase) * 100).toFixed(1))
    },
    {
      name: "CTA Views (Seen in view)",
      key: "cta_views",
      count: totalCtaViews,
      percentageFromPrevious: engagedReadersCount > 0 ? Number(((totalCtaViews / engagedReadersCount) * 100).toFixed(1)) : 0,
      percentageFromTop: Number(((totalCtaViews / funnelBase) * 100).toFixed(1))
    },
    {
      name: "CTA Clicks (Demo Intent)",
      key: "cta_clicks",
      count: totalCtaClicks,
      percentageFromPrevious: totalCtaViews > 0 ? Number(((totalCtaClicks / totalCtaViews) * 100).toFixed(1)) : 0,
      percentageFromTop: Number(((totalCtaClicks / funnelBase) * 100).toFixed(1))
    },
    {
      name: "WhatsApp Demo Initiations",
      key: "demo_starts",
      count: totalDemoClicks,
      percentageFromPrevious: totalCtaClicks > 0 ? Number(((totalDemoClicks / Math.max(totalCtaClicks, 1)) * 100).toFixed(1)) : 0,
      percentageFromTop: Number(((totalDemoClicks / funnelBase) * 100).toFixed(1))
    },
    {
      name: "Contact Form Submissions",
      key: "contacts",
      count: totalContactSubmits,
      percentageFromPrevious: totalDemoClicks > 0 ? Number(((totalContactSubmits / Math.max(totalDemoClicks, 1)) * 100).toFixed(1)) : 0,
      percentageFromTop: Number(((totalContactSubmits / funnelBase) * 100).toFixed(1))
    },
    {
      name: "Pilot / Trial Inquiries",
      key: "trials",
      count: totalTrials,
      percentageFromPrevious: totalContactSubmits > 0 ? Number(((totalTrials / Math.max(totalContactSubmits, 1)) * 100).toFixed(1)) : 0,
      percentageFromTop: Number(((totalTrials / funnelBase) * 100).toFixed(1))
    }
  ];

  const overallConversionRate = uniqueVisitorsSet.size > 0 
    ? Number(((demoRequests / uniqueVisitorsSet.size) * 100).toFixed(1)) 
    : 0;

  // Build 14-Point Weekly Report
  const topPagesList = [
    { path: "/", views: events.filter((e) => e.path === "/").length, uniqueVisitors: new Set(events.filter((e) => e.path === "/").map((e) => e.visitorId)).size },
    { path: "/blog", views: events.filter((e) => e.path === "/blog").length, uniqueVisitors: new Set(events.filter((e) => e.path === "/blog").map((e) => e.visitorId)).size },
    { path: "/features", views: events.filter((e) => e.path === "/features").length, uniqueVisitors: new Set(events.filter((e) => e.path === "/features").map((e) => e.visitorId)).size },
    { path: "/demo", views: events.filter((e) => e.path === "/demo").length, uniqueVisitors: new Set(events.filter((e) => e.path === "/demo").map((e) => e.visitorId)).size },
    { path: "/contact", views: events.filter((e) => e.path === "/contact").length, uniqueVisitors: new Set(events.filter((e) => e.path === "/contact").map((e) => e.visitorId)).size }
  ].sort((a, b) => b.views - a.views);

  const topBlogPosts = articles.slice(0, 5).map((a) => ({
    slug: a.slug,
    title: a.title,
    views: a.views,
    tractionScore: a.blogTractionScore
  }));

  const bestArticleByConversion = articles.reduce((best, curr) => (curr.demoClicks > best.demoClicks ? curr : best), articles[0] || { slug: "", title: "None", demoClicks: 0 });
  const worstArticle = articles[articles.length - 1] || { slug: "", title: "None", reason: "Zero traffic recorded" };

  const bestTrafficSource = sources[0]?.source || "Direct";
  const bestConversionSource = [...sources].sort((a, b) => b.demoClicks - a.demoClicks)[0]?.source || "Direct";

  const weeklyReport: WeeklyReportData = {
    generatedAt: new Date().toISOString(),
    period: period === "7d" ? "Past 7 Days" : period === "30d" ? "Past 30 Days" : period === "90d" ? "Past 90 Days" : "All Time",
    totalTraffic: pageViews,
    trafficGrowthPercentage: 0,
    topPages: topPagesList,
    topBlogPosts,
    topSearchQueries: gscQueries.slice(0, 5),
    risingPages: [],
    fallingPages: [],
    bestTrafficSource,
    bestConversionSource,
    bestArticleByConversion: {
      slug: bestArticleByConversion.slug,
      title: bestArticleByConversion.title,
      demoClicks: bestArticleByConversion.demoClicks
    },
    worstArticle: {
      slug: worstArticle.slug,
      title: worstArticle.title,
      reason: worstArticle.views === 0 ? "No recorded traffic in this period" : "Lowest overall engagement & conversion"
    },
    biggestOpportunity: articles.find((a) => a.opportunityCategory === "NEEDS BETTER CTA")
      ? `Article '${articles.find((a) => a.opportunityCategory === "NEEDS BETTER CTA")?.title}' has high engagement but low CTA click rate. Add a targeted intake demo callout.`
      : articles.find((a) => a.opportunityCategory === "NEEDS MORE TRAFFIC")
      ? `Article '${articles.find((a) => a.opportunityCategory === "NEEDS MORE TRAFFIC")?.title}' has high reading time (>90s). Distribute to LinkedIn doctor networks.`
      : "Publish content targeting the 250M+ ABDM Scan and Register milestone to capture rising healthtech searches.",
    recommendedNext3Articles: [
      {
        title: "ABDM Scan and Register Has 25 Crore Registrations: What Does That Mean for Small Clinics?",
        rationale: "Capitalizes on official NHA government trend with 250M+ records. High authority search interest.",
        pillar: "Healthcare Technology"
      },
      {
        title: "Why First-Come, First-Served Breaks Down When 20 Patients Arrive at Once",
        rationale: "Directly solves the Monday 9:30 AM rush problem for multi-doctor clinics.",
        pillar: "Clinic Operations"
      },
      {
        title: "The 5-Minute Gap Between Registration and Consultation That Costs Clinics Everything",
        rationale: "Illustrates exact consultation time leakage and doctor productivity.",
        pillar: "Practice Management"
      }
    ],
    recommended3OptimizationActions: [
      {
        action: "Add WhatsApp Demo button inside high-scroll blog paragraphs",
        target: "Top 3 Read Articles",
        expectedImpact: "+35% Demo Intent Clicks"
      },
      {
        action: "Add custom UTM parameters on all LinkedIn and WhatsApp founder posts",
        target: "Social Outreach",
        expectedImpact: "Clear Attribution of First-Touch Clinic Leads"
      },
      {
        action: "Connect Google Search Console API / export for organic query CTR analysis",
        target: "SEO Dashboard",
        expectedImpact: "Identify High-Impression / Low-CTR Title Gaps"
      }
    ],
    actionableInsights: hasRealData
      ? [
          `${sources[0]?.source || "Direct"} is your #1 traffic driver with ${sources[0]?.visitors || 0} unique visitors.`,
          `${bestArticleByConversion.title !== "None" ? `Top converting article '${bestArticleByConversion.title}' has generated ${bestArticleByConversion.demoClicks} demo clicks.` : "No demo clicks recorded yet. Ensure CTAs are prominent."}`,
          `Overall visitor-to-demo conversion rate is currently ${overallConversionRate}%.`
        ]
      : [
          "No traffic data recorded yet. Share the website link with UTM tags to begin populating real clinic analytics.",
          "First-party tracking is active and listening for page views, reading depth, and demo clicks across all devices."
        ]
  };

  return {
    period,
    hasRealData,
    totalEvents: events.length,
    uniqueVisitors: uniqueVisitorsSet.size,
    pageViews,
    engagedVisitors: engagedVisitorsSet.size,
    returningVisitors: returningVisitorsSet.size,
    blogVisitors: blogVisitorsSet.size,
    demoRequests,
    trialRequests,
    emailClicks,
    phoneClicks,
    overallConversionRate,
    trafficGrowthPercentage: 0,
    funnel,
    sources,
    articles,
    searchQueries: gscQueries,
    experiments,
    weeklyReport,
    recentEvents: events.slice(0, 50)
  };
}
