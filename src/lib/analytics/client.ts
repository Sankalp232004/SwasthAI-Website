"use client";

import { AnalyticsEventPayload, AttributionData, EventType, TrafficSourceCategory } from "./types";
import { classifyTrafficSource } from "./scoring";

const VISITOR_COOKIE = "_swasthai_vid";
const SESSION_COOKIE = "_swasthai_sid";
const ATTR_KEY = "_swasthai_attr";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

function generateUUID(): string {
  return "v_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}

export function getOrCreateVisitorId(): { visitorId: string; isReturning: boolean } {
  if (typeof window === "undefined") return { visitorId: "srv_unknown", isReturning: false };

  let vid = getCookie(VISITOR_COOKIE) || localStorage.getItem(VISITOR_COOKIE);
  let isReturning = false;

  if (vid) {
    isReturning = true;
  } else {
    vid = generateUUID();
    setCookie(VISITOR_COOKIE, vid, 365);
    try {
      localStorage.setItem(VISITOR_COOKIE, vid);
    } catch {}
  }

  return { visitorId: vid, isReturning };
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "sess_unknown";

  let sid = sessionStorage.getItem(SESSION_COOKIE);
  if (!sid) {
    sid = "s_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    try {
      sessionStorage.setItem(SESSION_COOKIE, sid);
    } catch {}
  }
  return sid;
}

export function getStoredAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return {
      firstSource: "Direct",
      firstReferrer: "",
      firstLandingPage: "/",
      lastSource: "Direct",
      lastReferrer: "",
      lastLandingPage: "/"
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || undefined;
  const utmMedium = urlParams.get("utm_medium") || undefined;
  const utmCampaign = urlParams.get("utm_campaign") || undefined;
  const utmTerm = urlParams.get("utm_term") || undefined;
  const utmContent = urlParams.get("utm_content") || undefined;

  const currentReferrer = document.referrer || "";
  const currentPath = window.location.pathname;
  const currentSource = classifyTrafficSource(currentReferrer, utmSource || "");

  let stored: AttributionData;
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null as unknown as AttributionData;
  }

  if (!stored) {
    stored = {
      firstSource: currentSource,
      firstReferrer: currentReferrer,
      firstLandingPage: currentPath,
      firstLandingArticle: currentPath.startsWith("/blog/") ? currentPath.replace("/blog/", "") : undefined,
      firstUtmSource: utmSource,
      firstUtmMedium: utmMedium,
      firstUtmCampaign: utmCampaign,
      lastSource: currentSource,
      lastReferrer: currentReferrer,
      lastLandingPage: currentPath,
      lastLandingArticle: currentPath.startsWith("/blog/") ? currentPath.replace("/blog/", "") : undefined,
      lastUtmSource: utmSource,
      lastUtmMedium: utmMedium,
      lastUtmCampaign: utmCampaign,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent
    };
    try {
      localStorage.setItem(ATTR_KEY, JSON.stringify(stored));
    } catch {}
  } else {
    // Update last touch if new traffic source or UTM is present
    if (utmSource || (currentReferrer && !currentReferrer.includes(window.location.host))) {
      stored.lastSource = currentSource;
      stored.lastReferrer = currentReferrer;
      stored.lastLandingPage = currentPath;
      if (currentPath.startsWith("/blog/")) {
        stored.lastLandingArticle = currentPath.replace("/blog/", "");
      }
      stored.lastUtmSource = utmSource;
      stored.lastUtmMedium = utmMedium;
      stored.lastUtmCampaign = utmCampaign;
      stored.utmSource = utmSource || stored.utmSource;
      stored.utmMedium = utmMedium || stored.utmMedium;
      stored.utmCampaign = utmCampaign || stored.utmCampaign;
      stored.utmTerm = utmTerm || stored.utmTerm;
      stored.utmContent = utmContent || stored.utmContent;

      try {
        localStorage.setItem(ATTR_KEY, JSON.stringify(stored));
      } catch {}
    }
  }

  return stored;
}

function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// Global Event Queue for Batching
let eventQueue: AnalyticsEventPayload[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

function flushQueue() {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue = [];

  const body = JSON.stringify({ events: batch });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon("/api/analytics/track", body);
    if (!sent) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => {});
    }
  } else if (typeof fetch !== "undefined") {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }
}

export function trackEvent(
  eventType: EventType,
  details: Partial<AnalyticsEventPayload> = {}
) {
  if (typeof window === "undefined") return;

  const { visitorId, isReturning } = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const attribution = getStoredAttribution();

  const payload: AnalyticsEventPayload = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    timestamp: new Date().toISOString(),
    eventType,
    path: window.location.pathname,
    visitorId,
    sessionId,
    isReturningVisitor: isReturning,
    trafficSource: attribution.lastSource,
    referrer: document.referrer || "",
    device: getDeviceType(),
    attribution,
    ...details
  };

  eventQueue.push(payload);

  // Critical conversion events flush immediately; scroll/reading events batch over 1.5s
  const immediateEvents: EventType[] = [
    "cta_click",
    "demo_page_view",
    "contact_form_submit",
    "trial_click",
    "app_click",
    "email_click",
    "phone_click"
  ];

  if (immediateEvents.includes(eventType)) {
    flushQueue();
  } else {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushQueue, 1500);
  }
}

// Flush queue on page unload
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushQueue();
    }
  });
  window.addEventListener("pagehide", flushQueue);
}
