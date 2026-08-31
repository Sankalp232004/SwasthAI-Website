"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const activeSecondsRef = useRef(0);
  const lastActiveRef = useRef(Date.now());
  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const hasTrackedPageViewRef = useRef<string | null>(null);

  // 1. Page View & Route Change Tracking
  useEffect(() => {
    if (!pathname) return;

    // Reset milestones for new page
    milestonesReachedRef.current = new Set();
    activeSecondsRef.current = 0;
    lastActiveRef.current = Date.now();

    const isBlog = pathname.startsWith("/blog") && pathname !== "/blog";
    const isDemo = pathname === "/demo";

    const articleSlug = isBlog ? pathname.replace("/blog/", "").split("?")[0].split("#")[0] : undefined;

    if (isDemo) {
      trackEvent("demo_page_view", { path: pathname });
    } else if (isBlog && articleSlug && !articleSlug.includes("category") && !articleSlug.includes("author")) {
      trackEvent("blog_view", { path: pathname, articleSlug });
    } else {
      trackEvent("page_view", { path: pathname });
    }

    hasTrackedPageViewRef.current = pathname;
  }, [pathname]);

  // 2. Active Engagement Timer (ticking only when window is active & focused)
  useEffect(() => {
    const handleUserActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });
    window.addEventListener("scroll", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, { passive: true });

    const interval = setInterval(() => {
      if (typeof document === "undefined") return;
      const isVisible = document.visibilityState === "visible";
      const isRecentlyActive = Date.now() - lastActiveRef.current < 45000; // within 45s of interaction

      if (isVisible && isRecentlyActive) {
        activeSecondsRef.current += 1;

        // At 30s milestone, log engagement if on blog
        if (activeSecondsRef.current === 30 && pathname?.startsWith("/blog/")) {
          const articleSlug = pathname.replace("/blog/", "").split("?")[0];
          trackEvent("page_view", {
            path: pathname,
            articleSlug,
            activeSeconds: 30
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);

      // On leaving page, send total active reading time if > 5s
      if (activeSecondsRef.current >= 5 && pathname?.startsWith("/blog/")) {
        const articleSlug = pathname.replace("/blog/", "").split("?")[0];
        trackEvent("page_view", {
          path: pathname,
          articleSlug,
          activeSeconds: activeSecondsRef.current
        });
      }
    };
  }, [pathname]);

  // 3. Scroll Depth Milestones (25%, 50%, 75%, 90%, 100%)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const h = document.documentElement;
      const b = document.body;
      const st = "scrollTop" in h ? h.scrollTop : b.scrollTop;
      const sh = "scrollHeight" in h ? h.scrollHeight : b.scrollHeight;
      const ch = h.clientHeight;

      const totalScrollable = sh - ch;
      if (totalScrollable <= 0) return;

      const percent = Math.min(100, Math.round((st / totalScrollable) * 100));
      const milestones = [25, 50, 75, 90, 100];

      for (const m of milestones) {
        if (percent >= m && !milestonesReachedRef.current.has(m)) {
          milestonesReachedRef.current.add(m);

          const isBlog = pathname?.startsWith("/blog/") && !pathname?.includes("category") && !pathname?.includes("author");
          const articleSlug = isBlog ? pathname?.replace("/blog/", "").split("?")[0] : undefined;

          if (m === 25) {
            trackEvent("blog_scroll_25", { path: pathname, articleSlug, scrollDepth: 25, activeSeconds: activeSecondsRef.current });
          } else if (m === 50) {
            trackEvent("blog_scroll_50", { path: pathname, articleSlug, scrollDepth: 50, activeSeconds: activeSecondsRef.current });
          } else if (m === 75) {
            trackEvent("blog_scroll_75", { path: pathname, articleSlug, scrollDepth: 75, activeSeconds: activeSecondsRef.current });
          } else if (m === 90) {
            trackEvent("blog_scroll_90", { path: pathname, articleSlug, scrollDepth: 90, activeSeconds: activeSecondsRef.current });
          } else if (m === 100) {
            trackEvent("blog_complete_read", { path: pathname, articleSlug, scrollDepth: 100, activeSeconds: activeSecondsRef.current });
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // 4. Global Link & CTA Click Delegator
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button");
      if (!target) return;

      const href = target.getAttribute("href") || "";
      const text = (target.textContent || "").trim().slice(0, 100);
      const isBlog = pathname?.startsWith("/blog/") && !pathname?.includes("category") && !pathname?.includes("author");
      const articleSlug = isBlog ? pathname?.replace("/blog/", "").split("?")[0] : undefined;

      // WhatsApp Demo Click
      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        trackEvent("cta_click", {
          path: pathname,
          articleSlug,
          ctaText: text || "WhatsApp Demo Button",
          ctaLocation: isBlog ? "blog_article" : pathname,
          destinationUrl: href
        });
        return;
      }

      // Email Click
      if (href.startsWith("mailto:")) {
        trackEvent("email_click", {
          path: pathname,
          destinationUrl: href
        });
        return;
      }

      // Phone Click
      if (href.startsWith("tel:")) {
        trackEvent("phone_click", {
          path: pathname,
          destinationUrl: href
        });
        return;
      }

      // Doctor Portal / App Login Click
      if (href.includes("onrender.com") || text.toLowerCase().includes("doctor portal")) {
        trackEvent("app_click", {
          path: pathname,
          destinationUrl: href,
          ctaText: text
        });
        return;
      }

      // Clinic Flyer Download / View Click
      if (href.includes("flyer.html") || href.includes("flyer.jpg")) {
        trackEvent("trial_click", {
          path: pathname,
          ctaText: "Clinic Flyer",
          destinationUrl: href
        });
        return;
      }

      // Social Share Click
      if (target.closest("[data-share]") || href.includes("linkedin.com/share") || href.includes("twitter.com/intent")) {
        trackEvent("share_click", {
          path: pathname,
          articleSlug,
          destinationUrl: href
        });
        return;
      }

      // General CTA buttons
      if (text.toLowerCase().includes("book a demo") || text.toLowerCase().includes("explore capabilities") || text.toLowerCase().includes("pilot")) {
        trackEvent("website_cta_click", {
          path: pathname,
          articleSlug,
          ctaText: text,
          destinationUrl: href
        });
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [pathname]);

  // 5. IntersectionObserver for CTA Views
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const ctaElements = document.querySelectorAll("section, div[class*='CTA'], div[class*='cta']");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const isBlog = pathname?.startsWith("/blog/") && !pathname?.includes("category") && !pathname?.includes("author");
            const articleSlug = isBlog ? pathname?.replace("/blog/", "").split("?")[0] : undefined;

            trackEvent("cta_view", {
              path: pathname,
              articleSlug,
              ctaLocation: entry.target.tagName.toLowerCase()
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    ctaElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
