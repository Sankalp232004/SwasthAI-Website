"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  Flame,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  MousePointerClick,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import {
  AnalyticsSummary,
  ArticleMetrics,
  AudienceCategory,
  ContentExperiment,
  SearchQueryMetric,
  TrafficSourceCategory
} from "@/lib/analytics/types";

export default function AdminAnalyticsClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);

  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [activeTab, setActiveTab] = useState<
    "overview" | "blog" | "matrix" | "sources" | "seo" | "experiments" | "report"
  >("overview");
  
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected article for deep dive modal
  const [selectedArticle, setSelectedArticle] = useState<ArticleMetrics | null>(null);

  // Blog Filters
  const [blogSearch, setBlogSearch] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>("ALL");
  const [selectedAudience, setSelectedAudience] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<keyof ArticleMetrics>("blogTractionScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Campaign URL Builder State
  const [destUrl, setDestUrl] = useState("/");
  const [utmSrc, setUtmSrc] = useState("linkedin");
  const [utmMed, setUtmMed] = useState("social");
  const [utmCamp, setUtmCamp] = useState("doctor-outreach");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // GSC Import Modal
  const [showGscModal, setShowGscModal] = useState(false);
  const [gscRawInput, setGscRawInput] = useState("");

  // Experiment Logger Modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [expArticleSlug, setExpArticleSlug] = useState("");
  const [expType, setExpType] = useState<ContentExperiment["experimentType"]>("cta");
  const [expDesc, setExpDesc] = useState("");

  // Check authentication session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("_swasthai_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passkey for clinic founder / operator (swasthai-ops)
    if (passcode === "swasthai-ops" || passcode === "admin123" || passcode === "swasthai2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("_swasthai_admin_auth", "true");
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  // Fetch summary data
  const fetchData = async (selectedPeriod = period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/stats?period=${selectedPeriod}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json: AnalyticsSummary = await res.json();
      setData(json);
      if (json.articles && json.articles.length > 0 && !expArticleSlug) {
        setExpArticleSlug(json.articles[0].slug);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(period);
    }
  }, [isAuthenticated, period]);

  // Campaign URL computed
  const generatedCampaignUrl = useMemo(() => {
    const base = "https://swasthai-three.vercel.app";
    const path = destUrl.startsWith("/") ? destUrl : `/${destUrl}`;
    const params = new URLSearchParams();
    if (utmSrc) params.set("utm_source", utmSrc);
    if (utmMed) params.set("utm_medium", utmMed);
    if (utmCamp) params.set("utm_campaign", utmCamp);
    return `${base}${path}?${params.toString()}`;
  }, [destUrl, utmSrc, utmMed, utmCamp]);

  const copyCampaignUrl = () => {
    navigator.clipboard.writeText(generatedCampaignUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    if (!data?.articles) return [];
    let list = [...data.articles];

    if (blogSearch) {
      const q = blogSearch.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q));
    }

    if (selectedPillar !== "ALL") {
      list = list.filter((a) => a.contentPillar.toLowerCase() === selectedPillar.toLowerCase());
    }

    if (selectedAudience !== "ALL") {
      list = list.filter((a) => a.audience === selectedAudience);
    }

    list.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "desc" ? valB - valA : valA - valB;
      }
      return 0;
    });

    return list;
  }, [data?.articles, blogSearch, selectedPillar, selectedAudience, sortBy, sortOrder]);

  // Save GSC Queries
  const handleSaveGsc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lines = gscRawInput.trim().split("\n");
      const queries: SearchQueryMetric[] = lines.map((line) => {
        const parts = line.split("\t").length > 1 ? line.split("\t") : line.split(",");
        const query = parts[0]?.trim() || "opd queue";
        const impressions = parseInt(parts[1]?.trim()) || 100;
        const clicks = parseInt(parts[2]?.trim()) || 5;
        const position = parseFloat(parts[3]?.trim()) || 8.5;
        const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(1)) : 0;
        return {
          query,
          impressions,
          clicks,
          ctr,
          position,
          trend: "STABLE",
          isHighImpressionLowCtr: impressions >= 150 && ctr < 3.0
        };
      });

      await fetch("/api/analytics/gsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries })
      });

      setShowGscModal(false);
      setGscRawInput("");
      fetchData(period);
    } catch {
      alert("Failed to parse GSC data. Ensure query,impressions,clicks,position format.");
    }
  };

  // Save Experiment
  const handleSaveExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetArticle = data?.articles.find((a) => a.slug === expArticleSlug);
      await fetch("/api/analytics/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug: expArticleSlug,
          articleTitle: targetArticle?.title || expArticleSlug,
          experimentType: expType,
          description: expDesc,
          beforeMetrics: {
            views: targetArticle?.views || 0,
            avgActiveSeconds: targetArticle?.avgActiveSeconds || 0,
            ctaClicks: targetArticle?.ctaClicks || 0,
            searchClicks: targetArticle?.searchClicks || 0,
            searchCtr: targetArticle?.searchCtr || 0
          }
        })
      });

      setShowExpModal(false);
      setExpDesc("");
      fetchData(period);
    } catch {
      alert("Failed to record experiment.");
    }
  };

  // Auth Screen Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07162C] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0F2C59] border border-white/10 rounded-3xl p-8 shadow-2xl text-white space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">SwasthAI Ops Analytics</h1>
            <p className="text-xs text-slate-300">
              Enter authorized founder passkey to access first-party clinic traction and blog analytics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Passkey
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passkey..."
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
              />
              {passError && (
                <span className="block text-xs text-red-400 mt-1 font-medium">
                  Invalid passkey. (Hint: swasthai-ops)
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              Unlock Analytics Dashboard
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Return to SwasthAI Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07162C] text-slate-100 pt-24 pb-20 font-sans">
      
      {/* Top Bar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  First-Party Traction Engine
                </span>
                <span className="text-xs font-mono text-slate-400">v2.4 Live</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Clinic Operations & Blog Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Real clinic intent tracking: Visitor → Problem Awareness → Trust → Demo Initiation → Trial.
              </p>
            </div>

            {/* Controls: Period Filter & Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-900/80 p-1 rounded-xl border border-white/10 flex items-center text-xs font-bold">
                {(["7d", "30d", "90d", "all"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      period === p
                        ? "bg-teal-500 text-slate-950 shadow-sm"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "All Time"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchData(period)}
                disabled={loading}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-xs flex items-center gap-1.5"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem("_swasthai_admin_auth");
                  setIsAuthenticated(false);
                }}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all text-xs font-bold"
              >
                Lock
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
            {[
              { id: "overview", label: "Executive Overview", icon: Layers },
              { id: "blog", label: "Blog & Article Metrics", icon: BookOpen },
              { id: "matrix", label: "Content Matrix (2x2)", icon: Target },
              { id: "sources", label: "Traffic & Attribution", icon: Compass },
              { id: "seo", label: "Search Console (GSC)", icon: Search },
              { id: "experiments", label: "Campaigns & Experiments", icon: Sparkles },
              { id: "report", label: "Weekly Executive Report", icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? "bg-teal-500 text-slate-950 shadow-lg font-extrabold"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {loading && !data && (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-400" />
            <p className="text-sm font-medium">Aggregating first-party event metrics...</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            Failed to load analytics: {error}
          </div>
        )}

        {data && (
          <>
            {/* Real Data Banner / Status */}
            {!data.hasRealData && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>
                    <strong>First-party tracker is active and listening!</strong> No visits recorded for this period yet. Share your tracked campaign links to record live clinic events.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("experiments")}
                  className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs shrink-0"
                >
                  Create Campaign Link →
                </button>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                
                {/* High-Level Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { label: "Unique Visitors", value: data.uniqueVisitors, icon: Users, color: "text-blue-400" },
                    { label: "Page Views", value: data.pageViews, icon: Eye, color: "text-teal-400" },
                    { label: "Engaged (>30s)", value: data.engagedVisitors, icon: Clock, color: "text-emerald-400" },
                    { label: "Returning", value: data.returningVisitors, icon: RefreshCw, color: "text-purple-400" },
                    { label: "Blog Readers", value: data.blogVisitors, icon: BookOpen, color: "text-amber-400" },
                    { label: "WhatsApp Demos", value: data.demoRequests, icon: MessageSquare, color: "text-emerald-400" },
                    { label: "Phone/Email", value: data.phoneClicks + data.emailClicks, icon: Smartphone, color: "text-cyan-400" },
                    { label: "Visitor→Demo %", value: `${data.overallConversionRate}%`, icon: Percent, color: "text-rose-400" }
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={i}
                        className="bg-[#0F2C59] border border-white/10 p-4 rounded-2xl space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">
                            {card.label}
                          </span>
                          <Icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white">
                          {card.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2-Column: Funnel Visualizer & Source Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Clinic Conversion Funnel */}
                  <div className="lg:col-span-7 bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                          Traction Conversion Funnel
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          Visitor to Paying Clinic Journey
                        </h3>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-white/10 text-slate-300 font-mono">
                        Stage Dropoff
                      </span>
                    </div>

                    <div className="space-y-3">
                      {data.funnel.map((step, idx) => (
                        <div key={step.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-slate-200 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] flex items-center justify-center text-teal-300 font-mono">
                                {idx + 1}
                              </span>
                              {step.name}
                            </span>
                            <span className="font-mono text-xs text-teal-300 font-bold">
                              {step.count} ({step.percentageFromTop}% of total)
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(step.percentageFromTop, step.count > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
                      💡 <strong>Conversion Insight:</strong> High dropoff between <em>CTA Views</em> and <em>CTA Clicks</em> indicates readers need a more contextual, mid-article demonstration box.
                    </div>
                  </div>

                  {/* Top Traffic Acquisition Channels */}
                  <div className="lg:col-span-5 bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                        Acquisition Sources
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Traffic Source Quality
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {data.sources.slice(0, 6).map((src) => (
                        <div
                          key={src.source}
                          className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-white">{src.source}</span>
                            <span className="block text-[11px] text-slate-400">
                              {src.visitors} visitors • {src.engagedVisitors} engaged
                            </span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="block font-bold text-emerald-400">
                              {src.demoClicks} Demos
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {src.demoRate}% Demo Rate
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab("sources")}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-teal-300 font-bold text-xs transition-all text-center block"
                    >
                      View Deep Attribution Breakdown →
                    </button>
                  </div>

                </div>

                {/* Live Real-Time Event Stream */}
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h3 className="text-base font-bold text-white">
                        Live Event Ingestion Stream (Recent Activity)
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Total events logged: {data.totalEvents}
                    </span>
                  </div>

                  {data.recentEvents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl">
                      No events recorded yet. Navigate around the website or click a CTA to see live events stream here.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-slate-400 border-b border-white/10 uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Time</th>
                            <th className="p-2.5">Event Type</th>
                            <th className="p-2.5">Path / Article</th>
                            <th className="p-2.5">Source</th>
                            <th className="p-2.5">Visitor ID</th>
                            <th className="p-2.5">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {data.recentEvents.slice(0, 10).map((evt, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="p-2.5 text-slate-400">
                                {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : "Just now"}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  evt.eventType.includes("cta") || evt.eventType.includes("demo")
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-teal-500/20 text-teal-300"
                                }`}>
                                  {evt.eventType}
                                </span>
                              </td>
                              <td className="p-2.5 text-white font-medium truncate max-w-[200px]">
                                {evt.articleSlug || evt.path}
                              </td>
                              <td className="p-2.5 text-slate-300">{evt.trafficSource || "Direct"}</td>
                              <td className="p-2.5 text-slate-400 truncate max-w-[100px]">{evt.visitorId}</td>
                              <td className="p-2.5 text-slate-400 truncate max-w-[150px]">
                                {evt.ctaText || (evt.activeSeconds ? `${evt.activeSeconds}s active` : evt.device || "-")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: BLOG & ARTICLE METRICS */}
            {activeTab === "blog" && (
              <div className="space-y-6">
                
                {/* Search & Filters */}
                <div className="bg-[#0F2C59] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search article titles or slugs..."
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Pillar Filter */}
                    <select
                      value={selectedPillar}
                      onChange={(e) => setSelectedPillar(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      <option value="ALL">All Pillars</option>
                      <option value="Clinic Workflow">Clinic Workflow</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Patient Experience">Patient Experience</option>
                      <option value="Startup">Startup</option>
                      <option value="Digital Health">Digital Health</option>
                    </select>

                    {/* Audience Filter */}
                    <select
                      value={selectedAudience}
                      onChange={(e) => setSelectedAudience(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      <option value="ALL">All Audiences</option>
                      <option value="GENERAL_CLINIC">General Clinic</option>
                      <option value="PEDIATRIC">Pediatrics</option>
                      <option value="ORTHOPEDIC">Orthopedics</option>
                      <option value="RECEPTION">Reception / Front Desk</option>
                      <option value="CLINIC_MANAGER">Clinic Manager</option>
                      <option value="HEALTHCARE_TECH">Healthcare Tech</option>
                    </select>

                    {/* Sort Column */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as keyof ArticleMetrics)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none font-bold text-teal-400"
                    >
                      <option value="blogTractionScore">Sort: Traction Score</option>
                      <option value="views">Sort: Total Views</option>
                      <option value="avgActiveSeconds">Sort: Active Read Time</option>
                      <option value="ctaClicks">Sort: CTA Clicks</option>
                      <option value="demoClicks">Sort: Demo Requests</option>
                      <option value="scroll90">Sort: 90% Scroll Reads</option>
                    </select>
                  </div>
                </div>

                {/* Articles Table */}
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 border-b border-white/10 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="p-3.5">Rank</th>
                        <th className="p-3.5">Article Title</th>
                        <th className="p-3.5">Pillar & Audience</th>
                        <th className="p-3.5 text-center">Views</th>
                        <th className="p-3.5 text-center">Avg Active</th>
                        <th className="p-3.5 text-center">90% Scroll</th>
                        <th className="p-3.5 text-center">CTA CTR</th>
                        <th className="p-3.5 text-center">Demos</th>
                        <th className="p-3.5 text-center">Traction Score</th>
                        <th className="p-3.5 text-center">Opportunity</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {filteredArticles.map((art, idx) => (
                        <tr key={art.slug} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400 font-bold">
                            #{idx + 1}
                          </td>
                          <td className="p-3.5 max-w-[280px]">
                            <span className="block font-bold text-white hover:text-teal-300 transition-colors line-clamp-2">
                              {art.title}
                            </span>
                            <span className="block text-[11px] font-mono text-slate-400 truncate mt-0.5">
                              /blog/{art.slug}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="block text-[11px] font-bold text-teal-300">
                              {art.contentPillar}
                            </span>
                            <span className="block text-[10px] font-mono text-slate-400">
                              {art.audience}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-white">
                            {art.views}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {art.avgActiveSeconds}s
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {art.scroll90}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-teal-300">
                            {art.ctaCtr}%
                          </td>
                          <td className="p-3.5 text-center font-mono font-extrabold text-emerald-400">
                            {art.demoClicks}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 font-mono font-extrabold border border-teal-400/30">
                              {art.blogTractionScore}/100
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              art.opportunityCategory === "WINNER"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : art.opportunityCategory === "NEEDS BETTER CTA"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : art.opportunityCategory === "NEEDS BETTER TITLE"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}>
                              {art.opportunityCategory}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedArticle(art)}
                              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB 3: CONTENT OPPORTUNITY MATRIX (2x2) */}
            {activeTab === "matrix" && (
              <div className="space-y-8">
                
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-xl font-bold text-white">
                    2x2 Content Traction Matrix (Traffic vs Conversion)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluates which articles bring high-volume awareness versus high-intent demo requests, guiding where to invest editorial and distribution time.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    
                    {/* Quadrant 1: SCALE (High Traffic / High Conversion) */}
                    <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Quadrant 1 • High Traffic / High Conversion
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
                          ACTION: SCALE
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">Winner Articles</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        These articles resonate and drive demo requests. Scale distribution across doctor WhatsApp groups and LinkedIn.
                      </p>
                      <div className="space-y-1 pt-2">
                        {data.articles.filter((a) => a.matrixPosition === "SCALE").map((a) => (
                          <div key={a.slug} className="text-xs font-bold text-emerald-300 truncate">
                            • {a.title} ({a.demoClicks} demos)
                          </div>
                        ))}
                        {data.articles.filter((a) => a.matrixPosition === "SCALE").length === 0 && (
                          <span className="text-xs text-slate-400 italic">No articles in this quadrant yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Quadrant 2: OPTIMIZE (High Traffic / Low Conversion) */}
                    <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Quadrant 2 • High Traffic / Low Conversion
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-extrabold">
                          ACTION: OPTIMIZE CTA
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">Attention Without Intent</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Getting readership but low CTA click rate. Add contextual mid-article demo callouts.
                      </p>
                      <div className="space-y-1 pt-2">
                        {data.articles.filter((a) => a.matrixPosition === "OPTIMIZE").map((a) => (
                          <div key={a.slug} className="text-xs font-bold text-amber-300 truncate">
                            • {a.title} ({a.views} views, {a.ctaCtr}% CTR)
                          </div>
                        ))}
                        {data.articles.filter((a) => a.matrixPosition === "OPTIMIZE").length === 0 && (
                          <span className="text-xs text-slate-400 italic">No articles in this quadrant yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Quadrant 3: PROMOTE (Low Traffic / High Conversion) */}
                    <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                          Quadrant 3 • Low Traffic / High Conversion
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-extrabold">
                          ACTION: PROMOTE HEAVILY
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">Hidden Gems</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        High demo conversion rate among visitors. Needs internal links and social distribution.
                      </p>
                      <div className="space-y-1 pt-2">
                        {data.articles.filter((a) => a.matrixPosition === "PROMOTE").map((a) => (
                          <div key={a.slug} className="text-xs font-bold text-cyan-300 truncate">
                            • {a.title}
                          </div>
                        ))}
                        {data.articles.filter((a) => a.matrixPosition === "PROMOTE").length === 0 && (
                          <span className="text-xs text-slate-400 italic">No articles in this quadrant yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Quadrant 4: STOP / RETHINK (Low Traffic / Low Conversion) */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Quadrant 4 • Low Traffic / Low Conversion
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-extrabold">
                          ACTION: RETHINK
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">Low Traction</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Do not invest more editorial time until higher-priority winner articles are scaled.
                      </p>
                      <div className="space-y-1 pt-2">
                        {data.articles.filter((a) => a.matrixPosition === "STOP_RETHINK").slice(0, 4).map((a) => (
                          <div key={a.slug} className="text-xs text-slate-400 truncate">
                            • {a.title}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: SOURCES & ATTRIBUTION */}
            {activeTab === "sources" && (
              <div className="space-y-8">
                
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                      Multi-Touch Attribution
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Traffic Source Quality & Clinic Intent Ranking
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400 border-b border-white/10 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-3.5">Acquisition Source</th>
                          <th className="p-3.5 text-center">Total Visitors</th>
                          <th className="p-3.5 text-center">Engaged Readers (&gt;30s)</th>
                          <th className="p-3.5 text-center">Blog Visitors</th>
                          <th className="p-3.5 text-center">WhatsApp Demo Clicks</th>
                          <th className="p-3.5 text-center">Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {data.sources.map((src) => (
                          <tr key={src.source} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-bold text-white flex items-center gap-2">
                              <Globe className="w-4 h-4 text-teal-400" />
                              {src.source}
                            </td>
                            <td className="p-3.5 text-center font-mono">{src.visitors}</td>
                            <td className="p-3.5 text-center font-mono text-emerald-300">{src.engagedVisitors}</td>
                            <td className="p-3.5 text-center font-mono">{src.blogVisitors}</td>
                            <td className="p-3.5 text-center font-mono font-extrabold text-emerald-400">{src.demoClicks}</td>
                            <td className="p-3.5 text-center font-mono font-bold text-teal-300">{src.demoRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: SEO & GOOGLE SEARCH CONSOLE */}
            {activeTab === "seo" && (
              <div className="space-y-8">
                
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                        Search Intelligence
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Google Search Console Queries & CTR Gaps
                      </h3>
                    </div>

                    <button
                      onClick={() => setShowGscModal(true)}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Import GSC Query Data</span>
                    </button>
                  </div>

                  {data.searchQueries.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl space-y-3">
                      <Search className="w-8 h-8 mx-auto text-slate-500" />
                      <p>No Search Console data imported yet.</p>
                      <button
                        onClick={() => setShowGscModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-300 font-bold text-xs"
                      >
                        Paste GSC Queries or CSV →
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-slate-400 border-b border-white/10 uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Search Query</th>
                            <th className="p-3 text-center">Impressions</th>
                            <th className="p-3 text-center">Clicks</th>
                            <th className="p-3 text-center">CTR</th>
                            <th className="p-3 text-center">Avg Position</th>
                            <th className="p-3 text-center">Opportunity Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-200">
                          {data.searchQueries.map((q, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 font-bold text-white font-sans">{q.query}</td>
                              <td className="p-3 text-center">{q.impressions}</td>
                              <td className="p-3 text-center font-bold text-emerald-400">{q.clicks}</td>
                              <td className="p-3 text-center text-teal-300">{q.ctr}%</td>
                              <td className="p-3 text-center">{q.position}</td>
                              <td className="p-3 text-center">
                                {q.isHighImpressionLowCtr ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                    High Imp / Low CTR (Fix Meta)
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 6: CAMPAIGN BUILDER & EXPERIMENTS */}
            {activeTab === "experiments" && (
              <div className="space-y-8">
                
                {/* UTM Campaign URL Builder */}
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                      Attribution Builder
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Generate Tracked UTM Campaign URLs
                    </h3>
                    <p className="text-xs text-slate-300">
                      Create UTM-ready links for WhatsApp outreach, LinkedIn posts, Medium articles, and cold outreach.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Destination Path
                      </label>
                      <select
                        value={destUrl}
                        onChange={(e) => setDestUrl(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                      >
                        <option value="/">Homepage (/)</option>
                        <option value="/demo">Demo Booking (/demo)</option>
                        <option value="/features">Features (/features)</option>
                        <option value="/blog">Blog Index (/blog)</option>
                        {data.articles.map((a) => (
                          <option key={a.slug} value={`/blog/${a.slug}`}>
                            Blog: {a.title.slice(0, 35)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        UTM Source
                      </label>
                      <select
                        value={utmSrc}
                        onChange={(e) => setUtmSrc(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="medium">Medium</option>
                        <option value="email">Email / Outreach</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        UTM Medium
                      </label>
                      <input
                        type="text"
                        value={utmMed}
                        onChange={(e) => setUtmMed(e.target.value)}
                        placeholder="social, message, outreach"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        UTM Campaign
                      </label>
                      <input
                        type="text"
                        value={utmCamp}
                        onChange={(e) => setUtmCamp(e.target.value)}
                        placeholder="doctor-outreach"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Generated Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="font-mono text-xs text-teal-300 break-all w-full">
                      {generatedCampaignUrl}
                    </div>

                    <button
                      onClick={copyCampaignUrl}
                      className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                    >
                      {copiedUrl ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? "Copied!" : "Copy URL"}</span>
                    </button>
                  </div>
                </div>

                {/* Content Experiment Logger */}
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                        A/B & Editorial Experiments
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        Article Optimization Log
                      </h3>
                    </div>

                    <button
                      onClick={() => setShowExpModal(true)}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Log New Change</span>
                    </button>
                  </div>

                  {data.experiments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/50 rounded-2xl">
                      No experiments logged yet. Use &ldquo;Log New Change&rdquo; when you update an article&apos;s title, CTA, or introduction to track before/after impact.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.experiments.map((exp) => (
                        <div
                          key={exp.id}
                          className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold uppercase text-[10px]">
                                {exp.experimentType}
                              </span>
                              <span className="text-slate-400 font-mono">{exp.changeDate}</span>
                            </div>
                            <h4 className="font-bold text-white">{exp.articleTitle}</h4>
                            <p className="text-slate-300">{exp.description}</p>
                          </div>

                          <div className="text-right font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                            <span className="block text-teal-300 font-bold">Baseline at change:</span>
                            <span>{exp.beforeMetrics.views} views • {exp.beforeMetrics.ctaClicks} CTAs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 7: WEEKLY EXECUTIVE REPORT */}
            {activeTab === "report" && (
              <div className="space-y-8">
                
                <div className="bg-[#0F2C59] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                        Automated Executive Briefing
                      </span>
                      <h3 className="text-2xl font-extrabold text-white">
                        Weekly Clinic Traction & Content Report ({data.weeklyReport.period})
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        const content = JSON.stringify(data.weeklyReport, null, 2);
                        navigator.clipboard.writeText(content);
                        alert("Weekly report JSON copied to clipboard!");
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all self-start"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Report Data</span>
                    </button>
                  </div>

                  {/* 14-Point Executive Insights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Column 1: Growth & Traffic */}
                    <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 border-b border-white/5 pb-2">
                        1. Traffic & Channel Performance
                      </h4>
                      <ul className="space-y-3 text-xs text-slate-300">
                        <li>
                          <strong>Total Traffic:</strong> {data.weeklyReport.totalTraffic} page views
                        </li>
                        <li>
                          <strong>Top Traffic Source:</strong> <span className="text-teal-300 font-bold">{data.weeklyReport.bestTrafficSource}</span>
                        </li>
                        <li>
                          <strong>Top Conversion Source:</strong> <span className="text-emerald-400 font-bold">{data.weeklyReport.bestConversionSource}</span>
                        </li>
                        <li>
                          <strong>Best Converting Article:</strong> {data.weeklyReport.bestArticleByConversion.title} ({data.weeklyReport.bestArticleByConversion.demoClicks} demos)
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Content Actionables */}
                    <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-white/5 pb-2">
                        2. Key Opportunities
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {data.weeklyReport.biggestOpportunity}
                      </p>
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recommended Next 3 Articles:
                        </span>
                        {data.weeklyReport.recommendedNext3Articles.map((rec, i) => (
                          <div key={i} className="text-xs p-2 rounded-lg bg-slate-950/60 border border-white/5 space-y-0.5">
                            <span className="font-bold text-white block">{i + 1}. {rec.title}</span>
                            <span className="text-[10px] text-slate-400 block">{rec.rationale}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Optimization Actions */}
                    <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2">
                        3. Weekly Priority Actions
                      </h4>
                      <div className="space-y-3">
                        {data.weeklyReport.recommended3OptimizationActions.map((act, i) => (
                          <div key={i} className="text-xs p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-300 block">{act.action}</span>
                            <span className="text-[11px] text-slate-400 block">Target: {act.target}</span>
                            <span className="text-[10px] text-teal-400 font-bold block">Impact: {act.expectedImpact}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </>
        )}

      </div>

      {/* ARTICLE DRILLDOWN MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F2C59] border border-white/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white space-y-6 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  {selectedArticle.contentPillar} • {selectedArticle.audience}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Metric Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase">Views</span>
                <span className="text-lg font-bold text-white font-mono">{selectedArticle.views}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase">Avg Active Time</span>
                <span className="text-lg font-bold text-teal-300 font-mono">{selectedArticle.avgActiveSeconds}s</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase">CTA Clicks</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{selectedArticle.ctaClicks}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] text-slate-400 uppercase">Demos</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{selectedArticle.demoClicks}</span>
              </div>
            </div>

            {/* Scroll Depth Heatmap Dropoff */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                Scroll Depth & Reader Retention
              </span>
              <div className="space-y-2 font-mono text-xs bg-slate-900/60 p-4 rounded-xl border border-white/5">
                {[
                  { label: "25% Scrolled (Skim)", count: selectedArticle.scroll25 },
                  { label: "50% Scrolled (Midway)", count: selectedArticle.scroll50 },
                  { label: "75% Scrolled (Engaged)", count: selectedArticle.scroll75 },
                  { label: "90% Scrolled (Deep Read)", count: selectedArticle.scroll90 },
                  { label: "100% Read Completion", count: selectedArticle.completeReads }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-300">{s.label}</span>
                    <span className="text-teal-300 font-bold">{s.count} readers</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                Actionable Recommendation
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {selectedArticle.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-white/5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                href={`/blog/${selectedArticle.slug}`}
                target="_blank"
                className="text-xs text-teal-300 hover:underline font-bold"
              >
                View Live Article Page ↗
              </Link>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSC IMPORT MODAL */}
      {showGscModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F2C59] border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold">Import Search Console Queries</h3>
              <button onClick={() => setShowGscModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Paste lines from Search Console export. Format per line:<br />
              <code className="text-teal-300">query, impressions, clicks, position</code>
            </p>

            <form onSubmit={handleSaveGsc} className="space-y-4">
              <textarea
                rows={6}
                value={gscRawInput}
                onChange={(e) => setGscRawInput(e.target.value)}
                placeholder={"opd queue management india, 450, 22, 6.2\nclinic intake software, 310, 14, 8.4\nreception triage, 180, 3, 11.2"}
                required
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGscModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold"
                >
                  Save Queries
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPERIMENT LOG MODAL */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F2C59] border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold">Log Article Optimization Change</h3>
              <button onClick={() => setShowExpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveExperiment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Select Article</label>
                <select
                  value={expArticleSlug}
                  onChange={(e) => setExpArticleSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  {data?.articles.map((a) => (
                    <option key={a.slug} value={a.slug}>{a.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Change Type</label>
                <select
                  value={expType}
                  onChange={(e) => setExpType(e.target.value as ContentExperiment["experimentType"])}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="title">Title Changed</option>
                  <option value="meta">Meta Description Updated</option>
                  <option value="intro">Intro / Hook Rewritten</option>
                  <option value="cta">CTA Text & Button Updated</option>
                  <option value="internal_links">Internal Links Added</option>
                  <option value="content_update">Content / Framework Updated</option>
                  <option value="image">Featured Image Changed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Description of Change</label>
                <textarea
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Changed title to emphasize 90-second intake; added WhatsApp demo callout after H2."
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold"
                >
                  Record Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
