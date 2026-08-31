import {
  ArticleMetrics,
  AudienceCategory,
  ContentOpportunityCategory,
  ReadingBehaviorType,
  TrendStatus,
  TrafficSourceCategory
} from "./types";

export function determineAudience(category: string, tags: string[] = []): AudienceCategory {
  const normalized = (category + " " + tags.join(" ")).toLowerCase();
  
  if (normalized.includes("pediatric") || normalized.includes("child")) return "PEDIATRIC";
  if (normalized.includes("orthopedic") || normalized.includes("bone") || normalized.includes("joint")) return "ORTHOPEDIC";
  if (normalized.includes("reception") || normalized.includes("front desk")) return "RECEPTION";
  if (normalized.includes("manager") || normalized.includes("operations") || normalized.includes("practice management")) return "CLINIC_MANAGER";
  if (normalized.includes("general physician") || normalized.includes("gp") || normalized.includes("consultation")) return "GENERAL_PHYSICIAN";
  if (normalized.includes("offline-first") || normalized.includes("ai in health") || normalized.includes("tech") || normalized.includes("software")) return "HEALTHCARE_TECH";
  if (normalized.includes("dental")) return "DENTAL";
  if (normalized.includes("ophthalmology") || normalized.includes("eye")) return "OPHTHALMOLOGY";
  if (normalized.includes("dermatology") || normalized.includes("skin")) return "DERMATOLOGY";
  if (normalized.includes("ent")) return "ENT";
  if (normalized.includes("physio")) return "PHYSIOTHERAPY";
  
  return "GENERAL_CLINIC";
}

export function classifyReadingBehavior(activeSeconds: number, scrollDepth: number): ReadingBehaviorType {
  if (activeSeconds < 15 || scrollDepth < 25) return "BOUNCED";
  if (activeSeconds < 60 || scrollDepth < 50) return "SKIMMED";
  if (activeSeconds >= 180 && scrollDepth >= 90) return "DEEP_READ";
  return "ENGAGED";
}

export interface ScoreWeights {
  traffic: number;      // default 0.20
  engagement: number;   // default 0.20
  searchGrowth: number; // default 0.20
  ctaEngagement: number;// default 0.25
  returnVisits: number; // default 0.15
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  traffic: 0.20,
  engagement: 0.20,
  searchGrowth: 0.20,
  ctaEngagement: 0.25,
  returnVisits: 0.15
};

export function calculateBlogTractionScore(
  views: number,
  avgActiveSeconds: number,
  searchClicks: number,
  ctaClicks: number,
  ctaCtr: number,
  returningVisitors: number,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  if (views === 0) return 0;

  // Normalized component scores (0 to 100)
  // 1. Traffic score: scales with reasonable clinic blog volume (50-500 views is solid for specialized B2B healthcare)
  const trafficComponent = Math.min(100, Math.round((views / 150) * 100));

  // 2. Engagement score: benchmark target is 120s (2 minutes active reading)
  const engagementComponent = Math.min(100, Math.round((avgActiveSeconds / 120) * 100));

  // 3. Search growth component: search clicks / impressions ratio and raw volume
  const searchComponent = Math.min(100, Math.round((searchClicks / 50) * 100));

  // 4. CTA Engagement component: target 3%+ CTR on high-intent B2B clinic CTAs
  const ctaComponent = Math.min(100, Math.round((ctaClicks * 15) + (ctaCtr * 10)));

  // 5. Returning visitor score: benchmark 15% return rate
  const returnRate = views > 0 ? (returningVisitors / views) * 100 : 0;
  const returnComponent = Math.min(100, Math.round((returnRate / 20) * 100));

  const weightedScore =
    trafficComponent * weights.traffic +
    engagementComponent * weights.engagement +
    searchComponent * weights.searchGrowth +
    ctaComponent * weights.ctaEngagement +
    returnComponent * weights.returnVisits;

  return Math.max(0, Math.min(100, Math.round(weightedScore)));
}

export function computeArticleQualityScore(
  views: number,
  avgActiveSeconds: number,
  scroll90: number,
  searchImpressions: number,
  searchClicks: number,
  searchCtr: number,
  ctaClicks: number,
  demoClicks: number
) {
  if (views === 0) {
    return {
      trafficScore: 0,
      engagementScore: 0,
      searchScore: 0,
      conversionScore: 0,
      overall: 0,
      verdict: "NO DATA YET"
    };
  }

  const trafficScore = Math.min(100, Math.round((views / 100) * 100));
  
  // Engagement considers both reading time and deep scroll (90% completion)
  const completionRate = views > 0 ? (scroll90 / views) * 100 : 0;
  const timeScore = Math.min(100, Math.round((avgActiveSeconds / 120) * 100));
  const engagementScore = Math.min(100, Math.round((timeScore * 0.6) + (completionRate * 0.4)));

  // Search considers impressions and CTR
  const searchScore = searchImpressions > 0 
    ? Math.min(100, Math.round((Math.min(searchImpressions / 300, 1) * 50) + (Math.min(searchCtr / 5, 1) * 50)))
    : 0;

  // Conversion considers CTA clicks and actual demo requests
  const conversionScore = Math.min(100, Math.round((demoClicks * 30) + (ctaClicks * 10)));

  const overall = Math.round(
    trafficScore * 0.25 + 
    engagementScore * 0.30 + 
    searchScore * 0.20 + 
    conversionScore * 0.25
  );

  let verdict = "BALANCED";
  if (trafficScore >= 60 && conversionScore < 30) {
    verdict = "HIGH TRAFFIC • WEAK CONVERSION";
  } else if (trafficScore < 30 && conversionScore >= 40) {
    verdict = "LOW TRAFFIC • HIGH CONVERSION";
  } else if (trafficScore >= 60 && conversionScore >= 60) {
    verdict = "STAR PERFORMER";
  } else if (trafficScore < 30 && engagementScore >= 60) {
    verdict = "HIGH ENGAGEMENT • NEEDS TRAFFIC";
  } else if (trafficScore < 30 && conversionScore < 30) {
    verdict = "EARLY STAGE / LOW TRACTION";
  }

  return {
    trafficScore,
    engagementScore,
    searchScore,
    conversionScore,
    overall,
    verdict
  };
}

export function classifyOpportunity(
  views: number,
  avgActiveSeconds: number,
  searchImpressions: number,
  searchCtr: number,
  ctaCtr: number,
  demoClicks: number
): {
  opportunityCategory: ContentOpportunityCategory;
  matrixPosition: "SCALE" | "OPTIMIZE" | "PROMOTE" | "STOP_RETHINK";
  recommendations: string[];
} {
  const recommendations: string[] = [];

  // Matrix Position logic: High/Low Traffic vs High/Low Conversion
  const isHighTraffic = views >= 50;
  const isHighConversion = (demoClicks >= 2) || (ctaCtr >= 3.5 && views >= 20);

  let matrixPosition: "SCALE" | "OPTIMIZE" | "PROMOTE" | "STOP_RETHINK" = "STOP_RETHINK";
  if (isHighTraffic && isHighConversion) {
    matrixPosition = "SCALE";
  } else if (isHighTraffic && !isHighConversion) {
    matrixPosition = "OPTIMIZE";
  } else if (!isHighTraffic && isHighConversion) {
    matrixPosition = "PROMOTE";
  } else {
    matrixPosition = "STOP_RETHINK";
  }

  // Opportunity Category & Actionable Recommendations
  let opportunityCategory: ContentOpportunityCategory = "UNDERPERFORMING";

  if (views === 0) {
    opportunityCategory = "NEW";
    recommendations.push("Distribute initial link on LinkedIn and doctor outreach channels.");
    recommendations.push("Ensure article is indexed in Google Search Console.");
  } else if (demoClicks >= 3 || (ctaCtr >= 4.0 && isHighTraffic)) {
    opportunityCategory = "WINNER";
    recommendations.push("Keep publishing similar clinic-operational content.");
    recommendations.push("Scale distribution via WhatsApp healthcare groups and LinkedIn outreach.");
    recommendations.push("Add internal links from other lower-converting articles to this winner.");
  } else if (searchImpressions >= 200 && searchCtr < 2.5) {
    opportunityCategory = "NEEDS BETTER TITLE";
    recommendations.push("Rewrite SEO title & meta description to improve search CTR (currently low CTR despite high impressions).");
    recommendations.push("Address the specific clinic search query in the first H2 header.");
  } else if (isHighTraffic && ctaCtr < 1.5) {
    opportunityCategory = "NEEDS BETTER CTA";
    recommendations.push("Traffic is arriving but readers aren't clicking the CTA.");
    recommendations.push("Test an in-article contextual demo callout after the core problem section.");
    recommendations.push("Make the transition from the operational problem to SwasthAI more explicit.");
  } else if (!isHighTraffic && avgActiveSeconds >= 90) {
    opportunityCategory = "NEEDS MORE TRAFFIC";
    recommendations.push("Readers who visit are deeply engaged (avg >90s). The content resonates.");
    recommendations.push("Repurpose into LinkedIn thought leadership carousel or WhatsApp clinic flyer.");
    recommendations.push("Add internal links from the homepage and high-traffic blog posts.");
  } else if (!isHighTraffic && avgActiveSeconds < 30) {
    opportunityCategory = "LOW PRIORITY";
    recommendations.push("Low readership and low engagement. Do not invest more time until higher-priority articles are scaled.");
  } else {
    opportunityCategory = "HIGH POTENTIAL";
    recommendations.push("Steady engagement. Continue monitoring search ranking progression.");
    recommendations.push("Share with clinic pilot prospects as pre-demo reading.");
  }

  return {
    opportunityCategory,
    matrixPosition,
    recommendations
  };
}

export function classifyTrafficSource(referrerUrl: string = "", utmSource: string = ""): TrafficSourceCategory {
  const ref = referrerUrl.toLowerCase();
  const utm = utmSource.toLowerCase();

  if (utm === "linkedin" || ref.includes("linkedin.com") || ref.includes("lnkd.in")) return "LinkedIn";
  if (utm === "whatsapp" || ref.includes("whatsapp.com") || ref.includes("wa.me") || ref.includes("api.whatsapp")) return "WhatsApp";
  if (utm === "medium" || ref.includes("medium.com")) return "Medium";
  if (utm === "email" || utm === "newsletter" || ref.includes("mail.google.com") || ref.includes("outlook.live.com") || ref.includes("brevo")) return "Email";
  
  if (
    ref.includes("google.") ||
    ref.includes("bing.com") ||
    ref.includes("duckduckgo.com") ||
    ref.includes("ecosia.org") ||
    ref.includes("yahoo.com")
  ) {
    return "Organic Search";
  }

  if (
    utm === "twitter" ||
    utm === "x" ||
    ref.includes("twitter.com") ||
    ref.includes("t.co") ||
    ref.includes("x.com") ||
    ref.includes("facebook.com") ||
    ref.includes("instagram.com") ||
    ref.includes("reddit.com")
  ) {
    return "Social";
  }

  if (!ref && !utm) return "Direct";
  if (ref) return "Referral";

  return "Other";
}
