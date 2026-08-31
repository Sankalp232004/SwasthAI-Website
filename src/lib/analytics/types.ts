export type EventType =
  | "page_view"
  | "blog_view"
  | "blog_scroll_25"
  | "blog_scroll_50"
  | "blog_scroll_75"
  | "blog_scroll_90"
  | "blog_complete_read"
  | "cta_view"
  | "cta_click"
  | "demo_page_view"
  | "demo_video_start"
  | "demo_video_complete"
  | "website_cta_click"
  | "app_click"
  | "contact_form_start"
  | "contact_form_submit"
  | "email_click"
  | "phone_click"
  | "qr_view"
  | "qr_scan"
  | "trial_click"
  | "external_link_click"
  | "share_click";

export type TrafficSourceCategory =
  | "Organic Search"
  | "Direct"
  | "LinkedIn"
  | "WhatsApp"
  | "Email"
  | "Medium"
  | "Referral"
  | "Social"
  | "Other";

export type AudienceCategory =
  | "GENERAL_CLINIC"
  | "GENERAL_PHYSICIAN"
  | "PEDIATRIC"
  | "ORTHOPEDIC"
  | "DENTAL"
  | "OPHTHALMOLOGY"
  | "DERMATOLOGY"
  | "ENT"
  | "PHYSIOTHERAPY"
  | "CLINIC_MANAGER"
  | "RECEPTION"
  | "HEALTHCARE_TECH"
  | "GENERAL";

export type ReadingBehaviorType = "BOUNCED" | "SKIMMED" | "ENGAGED" | "DEEP_READ";

export type ContentOpportunityCategory =
  | "WINNER"
  | "HIGH POTENTIAL"
  | "NEEDS BETTER TITLE"
  | "NEEDS BETTER CTA"
  | "NEEDS MORE TRAFFIC"
  | "LOW PRIORITY"
  | "UNDERPERFORMING"
  | "NEW";

export type TrendStatus = "RISING" | "STABLE" | "DECLINING" | "NEW" | "UNKNOWN";

export interface AttributionData {
  firstSource: TrafficSourceCategory;
  firstReferrer: string;
  firstLandingPage: string;
  firstLandingArticle?: string;
  firstUtmSource?: string;
  firstUtmMedium?: string;
  firstUtmCampaign?: string;
  lastSource: TrafficSourceCategory;
  lastReferrer: string;
  lastLandingPage: string;
  lastLandingArticle?: string;
  lastUtmSource?: string;
  lastUtmMedium?: string;
  lastUtmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface AnalyticsEventPayload {
  id?: string;
  timestamp?: string;
  eventType: EventType;
  path: string;
  visitorId: string;
  sessionId: string;
  isReturningVisitor?: boolean;
  
  // Blog specific metadata
  articleSlug?: string;
  articleTitle?: string;
  contentPillar?: string;
  author?: string;
  readingTime?: string;
  audience?: AudienceCategory;

  // Interaction metrics
  scrollDepth?: number;
  activeSeconds?: number;
  ctaText?: string;
  ctaLocation?: string;
  ctaVariant?: string;
  destinationUrl?: string;

  // Environment & Source
  referrer?: string;
  trafficSource?: TrafficSourceCategory;
  device?: "mobile" | "desktop" | "tablet";
  browser?: string;
  country?: string;

  // Attribution
  attribution?: AttributionData;

  // Additional custom props
  meta?: Record<string, unknown>;
}

export interface ArticleMetrics {
  slug: string;
  title: string;
  publishedAt: string;
  contentPillar: string;
  author: string;
  audience: AudienceCategory;
  readingTimeMinutes: number;
  
  views: number;
  uniqueVisitors: number;
  returningVisitors: number;
  avgActiveSeconds: number;
  scroll25: number;
  scroll50: number;
  scroll75: number;
  scroll90: number;
  completeReads: number;
  
  ctaViews: number;
  ctaClicks: number;
  ctaCtr: number; // percentage
  demoClicks: number;
  contactClicks: number;
  
  // Search Console (GSC) Metrics
  searchImpressions: number;
  searchClicks: number;
  searchCtr: number;
  avgSearchPosition: number;
  
  // Computed Scores
  blogTractionScore: number; // 0-100
  qualityScore: {
    trafficScore: number;
    engagementScore: number;
    searchScore: number;
    conversionScore: number;
    overall: number;
    verdict: string;
  };
  opportunityCategory: ContentOpportunityCategory;
  matrixPosition: "SCALE" | "OPTIMIZE" | "PROMOTE" | "STOP_RETHINK";
  recommendations: string[];
  trend: TrendStatus;
}

export interface FunnelStep {
  name: string;
  key: string;
  count: number;
  percentageFromPrevious: number;
  percentageFromTop: number;
}

export interface SourcePerformance {
  source: TrafficSourceCategory;
  visitors: number;
  engagedVisitors: number;
  blogVisitors: number;
  demoClicks: number;
  conversions: number;
  demoRate: number; // percentage
}

export interface SearchQueryMetric {
  query: string;
  page?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  trend: TrendStatus;
  isHighImpressionLowCtr?: boolean;
}

export interface ContentExperiment {
  id: string;
  articleSlug: string;
  articleTitle: string;
  experimentType: "title" | "meta" | "intro" | "cta" | "internal_links" | "content_update" | "image";
  changeDate: string;
  description: string;
  beforeMetrics: {
    views: number;
    avgActiveSeconds: number;
    ctaClicks: number;
    searchClicks: number;
    searchCtr: number;
  };
  afterMetrics?: {
    views: number;
    avgActiveSeconds: number;
    ctaClicks: number;
    searchClicks: number;
    searchCtr: number;
  };
}

export interface WeeklyReportData {
  generatedAt: string;
  period: string;
  totalTraffic: number;
  trafficGrowthPercentage: number;
  topPages: { path: string; views: number; uniqueVisitors: number }[];
  topBlogPosts: { slug: string; title: string; views: number; tractionScore: number }[];
  topSearchQueries: SearchQueryMetric[];
  risingPages: { path: string; growthPct: number }[];
  fallingPages: { path: string; dropPct: number }[];
  bestTrafficSource: TrafficSourceCategory;
  bestConversionSource: TrafficSourceCategory;
  bestArticleByConversion: { slug: string; title: string; demoClicks: number };
  worstArticle: { slug: string; title: string; reason: string };
  biggestOpportunity: string;
  recommendedNext3Articles: { title: string; rationale: string; pillar: string }[];
  recommended3OptimizationActions: { action: string; target: string; expectedImpact: string }[];
  actionableInsights: string[];
}

export interface AnalyticsSummary {
  period: "7d" | "30d" | "90d" | "all";
  hasRealData: boolean;
  totalEvents: number;
  uniqueVisitors: number;
  pageViews: number;
  engagedVisitors: number;
  returningVisitors: number;
  blogVisitors: number;
  demoRequests: number;
  trialRequests: number;
  emailClicks: number;
  phoneClicks: number;
  overallConversionRate: number;
  trafficGrowthPercentage: number;
  
  funnel: FunnelStep[];
  sources: SourcePerformance[];
  articles: ArticleMetrics[];
  searchQueries: SearchQueryMetric[];
  experiments: ContentExperiment[];
  weeklyReport: WeeklyReportData;
  recentEvents: AnalyticsEventPayload[];
}
