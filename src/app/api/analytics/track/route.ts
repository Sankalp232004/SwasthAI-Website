import { NextRequest, NextResponse } from "next/server";
import { saveAnalyticsEvents } from "@/lib/analytics/storage";
import { AnalyticsEventPayload } from "@/lib/analytics/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let events: AnalyticsEventPayload[] = [];

    if (Array.isArray(body.events)) {
      events = body.events;
    } else if (body.eventType) {
      events = [body];
    }

    if (events.length === 0) {
      return NextResponse.json({ success: false, message: "No events provided" }, { status: 400 });
    }

    // Enrich with request headers if not provided (privacy-friendly: geo country only)
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const enriched = events.map((e) => ({
      ...e,
      country: e.country || country,
      browser: e.browser || (userAgent ? userAgent.slice(0, 50) : undefined)
    }));

    await saveAnalyticsEvents(enriched);

    return NextResponse.json({ success: true, count: enriched.length });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ success: false, error: "Failed to record event" }, { status: 500 });
  }
}
